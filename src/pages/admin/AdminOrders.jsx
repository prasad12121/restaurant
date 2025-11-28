import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { getOrders, updateOrderStatus } from "@/api/orderApi";
import socket from "@/socket";

const statusColors = {
  Pending: "bg-yellow-200 text-yellow-800",
  Preparing: "bg-blue-200 text-blue-800",
  Ready: "bg-green-200 text-green-800",
  Served: "bg-gray-200 text-gray-800",
  Completed: "bg-green-300 text-green-900",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [viewItemsOrder, setViewItemsOrder] = useState(null);

  const loadOrders = async () => {
    const data = await getOrders();
    setOrders(data);
  };

  useEffect(() => {
    loadOrders();

    const handleNewOrder = (order) => {
      setOrders((prev) => [...prev, order]);
    };

    const handleUpdateOrder = (updated) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      );
    };

    socket.on("newOrder", handleNewOrder);
    socket.on("updateOrder", handleUpdateOrder);

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("updateOrder", handleUpdateOrder);
    };
  }, []);

  // 🔥 FIX: MERGE DUPLICATE ORDERS USING SAME ORDER ID
  const groupedOrders = Object.values(
    orders.reduce((acc, order) => {
      if (!acc[order._id]) {
        acc[order._id] = { ...order, items: [...order.items] };
      } else {
        acc[order._id].items.push(...order.items);
      }
      return acc;
    }, {})
  );

  const changeStatus = async (orderId, status) => {
    await updateOrderStatus(orderId, status);
  };

  return (
    <DashboardLayout>
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-5">All Orders</h1>

        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="p-3 border">Order Id</th>
                <th className="p-3 border">Table</th>
                <th className="p-3 border">Items</th>
                <th className="p-3 border">Subtotal</th>
                <th className="p-3 border">GST</th>
                <th className="p-3 border">Total</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {groupedOrders.map((order) => (
                <tr key={order._id} className="border">
                  <td className="p-3 border font-bold">
                    # {order._id}
                  </td>
                  <td className="p-3 border font-bold">
                    Table {order.tableNumber}
                  </td>

                  <td className="p-3 border">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => setViewItemsOrder(order)}
                    >
                      View Items
                    </button>
                  </td>

                  <td className="p-3 border">₹{order.subtotal?.toFixed(2)}</td>
                  <td className="p-3 border">₹{order.gst?.toFixed(2)}</td>
                  <td className="p-3 border font-semibold">
                    ₹{order.grandTotal?.toFixed(2)}
                  </td>

                  <td className="p-3 border">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="p-3 border">
                    <select
                      className="border rounded px-2 py-1"
                      value={order.status}
                      onChange={(e) => changeStatus(order._id, e.target.value)}
                    >
                      <option>Pending</option>
                      <option>Preparing</option>
                      <option>Ready</option>
                      <option>Served</option>
                      <option>Completed</option>
                    </select>
                  </td>
                </tr>
              ))}

              {groupedOrders.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center p-4 text-gray-500 italic"
                  >
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ITEMS MODAL */}
        {viewItemsOrder && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-96 p-5 rounded-lg shadow-xl">
              <h2 className="text-xl font-bold mb-3">
                Items (Table {viewItemsOrder.tableNumber})
              </h2>

              <div className="space-y-2">
                {viewItemsOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b pb-1">
                    <span>
                      {item.name} x{item.qty}
                    </span>
                    <span>₹{item.total}</span>
                  </div>
                ))}
              </div>

              <button
                className="mt-4 bg-red-500 text-white px-4 py-1 rounded"
                onClick={() => setViewItemsOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
