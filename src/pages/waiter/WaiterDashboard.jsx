// src/pages/waiter/WaiterDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import {
  getTables,
  updateTableStatus,
} from "@/api/tableApi"; // expects tableNumber or _id per your api
import { getOrderByTable, finalizeOrder } from "@/api/orderApi";

const currency = (v) =>
  typeof v === "number" ? `₹${v.toFixed(2)}` : v ?? "₹0.00";

export default function WaiterDashboard() {
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTableNumber, setSelectedTableNumber] = useState(null); // use tableNumber (1,2..)
  const [viewOrderModal, setViewOrderModal] = useState(null); // holds tableNumber to view
  const [existingOrder, setExistingOrder] = useState(null);
  const [isTaking, setIsTaking] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Load tables on mount
  useEffect(() => {
    const load = async () => {
      setLoadingTables(true);
      try {
        const data = await getTables();
        setTables(data || []);
      } catch (err) {
        console.error("Failed to load tables:", err);
      } finally {
        setLoadingTables(false);
      }
    };
    load();
  }, []);

  // When selected table changes, fetch its active order (if any)
  useEffect(() => {
    if (!selectedTableNumber) {
      setExistingOrder(null);
      return;
    }
    let mounted = true;
    const loadOrder = async () => {
      try {
        const order = await getOrderByTable(selectedTableNumber);
        if (mounted) setExistingOrder(order);
      } catch (err) {
        console.error("Failed to fetch order for table", selectedTableNumber, err);
        if (mounted) setExistingOrder(null);
      }
    };
    loadOrder();
    return () => (mounted = false);
  }, [selectedTableNumber]);

  // When view modal changes, load order for that table (separate state)
  useEffect(() => {
    if (!viewOrderModal) return;
    let mounted = true;
    const loadOrder = async () => {
      try {
        const order = await getOrderByTable(viewOrderModal);
        if (mounted) setExistingOrder(order);
      } catch {
        if (mounted) setExistingOrder(null);
      }
    };
    loadOrder();
    return () => (mounted = false);
  }, [viewOrderModal]);

  // Take order -> mark table occupied on backend and navigate to take-order page
  const handleTakeOrder = async () => {
    if (!selectedTableNumber) {
      alert("Please select a table first.");
      return;
    }
    try {
      setIsTaking(true);
      await updateTableStatus(selectedTableNumber, "occupied");
      // locally update UI
      setTables((prev) =>
        prev.map((t) =>
          t.tableNumber === selectedTableNumber ? { ...t, status: "occupied" } : t
        )
      );
      navigate(`/waiter/order/${selectedTableNumber}`);
    } catch (err) {
      console.error("Failed to lock table:", err);
      alert("Could not occupy table. Try again.");
    } finally {
      setIsTaking(false);
    }
  };

  // Finalize order (close and unlock table)
  const handleFinalize = async () => {
    if (!existingOrder) {
      alert("No active order to finalize for this table.");
      return;
    }
    try {
      setIsFinalizing(true);
      await finalizeOrder(existingOrder._id);
      alert("Order finalized and table unlocked.");
      // update UI
      setTables((prev) =>
        prev.map((t) =>
          t.tableNumber === existingOrder.tableNumber ? { ...t, status: "available" } : t
        )
      );
      setExistingOrder(null);
      setViewOrderModal(null);
    } catch (err) {
      console.error("Finalize failed:", err);
      alert("Failed to finalize order.");
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-semibold mb-4">Waiter Dashboard</h1>
        <p className="text-sm text-gray-500 mb-6">
          Tap a table to select it. Use <span className="font-medium">Take Order</span> to start KOT,
          or <span className="font-medium">View Order</span> to inspect existing KOTs.
        </p>

        {/* TABLE GRID */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {loadingTables ? (
            <div className="col-span-full text-center p-10 bg-white/30 backdrop-blur rounded-2xl">
              Loading tables...
            </div>
          ) : (
            tables.map((table) => {
              const isSelected = selectedTableNumber === table.tableNumber;
              return (
                <div
                  key={table._id}
                  className="relative p-4 rounded-2xl backdrop-blur bg-white/20 border border-white/30 shadow-lg"
                >
                  <button
                    onClick={() => setSelectedTableNumber(table.tableNumber)}
                    className={`w-full text-left p-3 rounded-xl transition ${
                      isSelected ? "ring-2 ring-blue-400" : "hover:scale-[1.02]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">Table {table.tableNumber}</div>
                        <div className="text-xs text-gray-600 mt-1">Seats — (standard)</div>
                      </div>

                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          table.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {table.status === "available" ? "Available" : "Occupied"}
                      </div>
                    </div>
                  </button>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setViewOrderModal(table.tableNumber)}
                      className="flex-1 bg-white/10 px-3 py-1 rounded-md text-sm border border-white/20 hover:bg-white/20"
                    >
                      View Order
                    </button>

                    <button
                      onClick={async () => {
                        // quick lock without selecting
                        setSelectedTableNumber(table.tableNumber);
                        try {
                          await updateTableStatus(table.tableNumber, "occupied");
                          setTables((prev) =>
                            prev.map((t) =>
                              t.tableNumber === table.tableNumber
                                ? { ...t, status: "occupied" }
                                : t
                            )
                          );
                          navigate(`/waiter/order/${table.tableNumber}`);
                        } catch (err) {
                          console.error("Lock failed:", err);
                          alert("Failed to occupy table.");
                        }
                      }}
            
                      className={`px-3 py-1 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700`}
                      
                    >
                      Take Order
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

       

        {/* VIEW ORDER MODAL */}
        {viewOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => {
                setViewOrderModal(null);
                setExistingOrder(null);
              }}
            />
            <div className="relative w-full max-w-md p-6 rounded-2xl backdrop-blur bg-white/20 border border-white/30 shadow-2xl">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold">Order — Table {viewOrderModal}</h3>
                <button
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    setViewOrderModal(null);
                    setExistingOrder(null);
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 max-h-64 overflow-y-auto space-y-3">
                {!existingOrder ? (
                  <div className="text-center text-sm text-gray-500 py-6">
                    No active order for this table.
                  </div>
                ) : (
                  existingOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-white/10 p-3 rounded-md"
                    >
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-xs text-gray-500">Qty: {it.qty}</div>
                      </div>
                      <div className="font-semibold">{currency(it.total)}</div>
                    </div>
                  ))
                )}
              </div>

              {existingOrder && (
                <div className="mt-4 border-t pt-3 text-right">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{currency(existingOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">GST</span>
                    <span className="font-medium">{currency(existingOrder.gst)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2">
                    <span>Total</span>
                    <span>{currency(existingOrder.grandTotal)}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                      onClick={() => {
                        setViewOrderModal(null);
                        setExistingOrder(null);
                      }}
                    >
                      Close
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg bg-red-600 text-white"
                      onClick={handleFinalize}
                    >
                      Finalize & Unlock
                    </button>
                  </div>
                </div>
              )}

              {!existingOrder && (
                <div className="mt-4 text-right">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    onClick={() => setViewOrderModal(null)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
