import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { getTables, updateTableStatus } from "@/api/tableApi";
import { getOrderByTable, finalizeOrder } from "@/api/orderApi";

const WaiterDashboard = () => {
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [existingOrder, setExistingOrder] = useState(null);
  const [viewOrderModal, setViewOrderModal] = useState(null);

  // Load tables
  useEffect(() => {
    const fetchTables = async () => {
      const data = await getTables();
      setTables(data);
    };
    fetchTables();
  }, []);

  // Load order in modal
  useEffect(() => {
    if (!viewOrderModal) return;

    const fetchOrder = async () => {
      try {
        const order = await getOrderByTable(viewOrderModal);
        setExistingOrder(order);
      } catch {
        setExistingOrder(null);
      }
    };

    fetchOrder();
  }, [viewOrderModal]);

  // Load order on table select
  useEffect(() => {
    if (!selectedTable) return;

    const fetchOrder = async () => {
      try {
        const order = await getOrderByTable(selectedTable);
        setExistingOrder(order);
      } catch {
        setExistingOrder(null);
      }
    };

    fetchOrder();
  }, [selectedTable]);

  // Take Order
  const handleTakeOrder = async () => {
    if (!selectedTable) {
      alert("Please select a table first!");
      return;
    }

    await updateTableStatus(selectedTable, "occupied");

    setTables((prev) =>
      prev.map((t) =>
        t.tableNumber === selectedTable ? { ...t, status: "occupied" } : t
      )
    );

    navigate(`/waiter/order/${selectedTable}`);
  };

  // Finalize Order
  const handleFinalize = async () => {
    try {
      await finalizeOrder(existingOrder._id);
      alert("Order finalized!");

      setExistingOrder(null);

      setTables((prev) =>
        prev.map((t) =>
          t.tableNumber === selectedTable ? { ...t, status: "available" } : t
        )
      );
    } catch {
      alert("Failed to finalize order");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-5">Waiter Dashboard</h1>

      {/* TABLE GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {tables.map((table) => {
          const isSelected = selectedTable === table.tableNumber;

          return (
            <div
              key={table._id}
              className="p-4 rounded-2xl border bg-white shadow hover:shadow-lg transition"
            >
              <button
                onClick={() => setSelectedTable(table.tableNumber)}
                className={`w-full p-4 rounded-xl text-center font-semibold text-lg transition
                  ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }
                `}
              >
                Table {table.tableNumber}
              </button>

              <p
                className={`mt-3 text-center font-medium ${
                  table.status === "available"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {table.status === "available" ? "Available" : "Occupied"}
              </p>

              {table.status === "occupied" && (
                <button
                  onClick={() => setViewOrderModal(table.tableNumber)}
                  className="mt-3 w-full py-2 rounded-lg bg-gray-800 text-white text-sm"
                >
                  View Order
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ACTION SECTION */}
      {selectedTable && (
        <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-blue-700 text-lg font-semibold">
            Selected Table: <span className="font-bold">{selectedTable}</span>
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleTakeOrder}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Take Order
            </button>

            {existingOrder && (
              <button
                onClick={handleFinalize}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Finalize
              </button>
            )}
          </div>
        </div>
      )}

      {/* ORDER MODAL */}
      {viewOrderModal && existingOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold mb-3 text-center">
              Order (Table {existingOrder.tableNumber})
            </h2>

            <div className="max-h-60 overflow-y-auto border rounded p-2">
              {existingOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between py-1 border-b text-sm"
                >
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span>₹{item.total}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right text-sm">
              <p>
                <b>Subtotal:</b> ₹{existingOrder.subtotal}
              </p>
              <p>
                <b>GST:</b> ₹{existingOrder.gst}
              </p>
              <p className="text-lg font-bold">
                Total: ₹{existingOrder.grandTotal}
              </p>
            </div>

            <button
              onClick={() => setViewOrderModal(null)}
              className="mt-5 bg-red-600 text-white py-2 rounded-lg w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default WaiterDashboard;
