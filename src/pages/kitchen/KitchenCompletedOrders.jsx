import { useEffect, useState } from "react";
import { getOrders } from "@/api/orderApi";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import socket from "../../socket";


const KitchenCompletedOrder = () => {
  const [orders, setOrders] = useState([]);

  // Fetch initial orders
  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      const availableProducts =data.filter((p)=>p.status === "Completed");
      setOrders(availableProducts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const handleNewOrder = (order) => {
      setOrders((prev) => [order, ...prev]);
    };

    const handleUpdateOrder = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    };
    socket.on("newOrder", handleNewOrder);
    socket.on("updateOrder", handleUpdateOrder);

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("updateOrder", handleUpdateOrder);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Kitchen Dashboard</h1>

        {orders.length === 0 && (
          <p className="text-center text-gray-500 mt-20 text-lg">
            No orders available 🍽️
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-pink-300 rounded-2xl shadow-lg border p-5 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">Table {order.tableNumber}</h2>

                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full border bg-yellow-100 text-yellow-800 border-yellow-300`}
                >
                  {order.status}
                </span>
              </div>

              {/* Items List */}
              <div className="mt-3 space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-700">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                    </div>
                    <p className="text-gray-700 font-semibold">₹{item.total}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 border-t pt-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{(Number(order?.subtotal) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST:</span>
                  <span>₹{(Number(order?.gst) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold mt-2 text-lg">
                  <span>Total:</span>
               <span>₹{(Number(order?.grandTotal) || 0).toFixed(2)}</span>
                </div>
              </div>
    
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KitchenCompletedOrder;
