import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { getTables,updateTableStatus } from "@/api/tableApi";
import { getOrderByTable, finalizeOrder } from "@/api/orderApi";

const WaiterDashboard = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [existingOrder, setExistingOrder] = useState(null);

  // Load tables
  useEffect(() => {
    const fetchTables = async () => {
      const data = await getTables();
      setTables(data);
    };
    fetchTables();
  }, []);
  /*
  // Track tables dynamically
  const [tables, setTables] = useState([
    { id: 1, name: "Table 1", status: "available" },
    { id: 2, name: "Table 2", status: "available" },
    { id: 3, name: "Table 3", status: "available" },
    { id: 4, name: "Table 4", status: "available" },
    { id: 5, name: "Table 5", status: "available" },
    { id: 6, name: "Table 6", status: "available" },
  ]);
*/

  
  // Fetch existing order for selected table
  useEffect(() => {
    if (!selectedTableId) return;

    const fetchOrder = async () => {
      try {
        const order = await getOrderByTable(selectedTableId);
        setExistingOrder(order);
      } catch (err) {
        console.error("Failed to fetch existing order:", err);
        setExistingOrder(null);
      }
    };

    fetchOrder();
  }, [selectedTableId]);

  const handleTakeOrder = async () => {
    if (!selectedTableId) {
      alert("Please select a table first!");
      return;
    }

    console.log("Selected Table",selectedTableId);
    // Backend update
    await updateTableStatus(selectedTableId, "occupied");

    // Update UI
    setTables((prev) =>
      prev.map((table) =>
        table._id === selectedTableId ? { ...table, status: "occupied" } : table
      )
    );

    // Navigate passing table ID
    navigate(`/waiter/order/${selectedTableId}`);
  };

  const handleFinalize = async () => {
    try {
      await finalizeOrder(existingOrder._id);
      alert("Order finalized!");
      setExistingOrder(null);

      setTables((prev) =>
        prev.map((t) =>
          t._id === selectedTableId ? { ...t, status: "available" } : t
        )
      );
    } catch {
      alert("Failed to finalize order");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Waiter Dashboard</h1>

      <h2 className="text-xl font-semibold mb-2">Select Table</h2>

      {/* Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tables.map((table) => {
          const isSelected = selectedTableId === table.tableNumber;

          return (
            <button
              key={table._id}
              onClick={() => setSelectedTableId(table.tableNumber)}
              className={`p-4 rounded-2xl border text-center transition
                ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-700"
                    : "bg-white border-gray-300"
                }
                ${
                  table.status === "occupied" && !isSelected
                    ? "opacity-60"
                    : "cursor-pointer"
                }`}
            >
              <p className="font-semibold">Tabel--{table.tableNumber}</p>
              <p
                className={`text-sm mt-1 ${
                  table.status === "available"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {table.status === "available" ? "Available" : "Occupied"}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Table Info + Actions */}
      {selectedTableId && (
        <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="font-medium text-blue-700 text-lg">
            Selected Table:{" "}
            <span className="font-bold">
              {tables.find((t) => t._id === selectedTableId)?.tableNumber}
            </span>
          </p>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleTakeOrder}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition"
            >
              Take Order
            </button>

            {existingOrder && (
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition"
                onClick={handleFinalize}
              >
                Finalize Order
              </button>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default WaiterDashboard;
