import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { getOrders } from "@/api/orderApi";
import { getAllProducts as getProducts } from "@/api/productApi";
import { getAllUsers } from "@/api/userApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const orders = await getOrders();
      console.log(orders);
      const products = await getProducts();
      const users = await getAllUsers();

      const revenue = orders
        .filter((o) => o.status === "Completed")
        .reduce((sum, o) => sum + o.subtotal, 0);

        console.log(revenue);

      const pendingOrders = orders.filter(
        (o) => o.status === "Pending"
      ).length;

      setStats({
        totalOrders: orders.length,
        pendingOrders,
        totalProducts: products.length,
        totalUsers: users.length,
        revenue,
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Orders */}
        <div className="p-6 bg-white shadow rounded-xl border">
          <p className="text-gray-500 text-sm">Total Orders</p>
          <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
        </div>

        {/* Pending Orders */}
        <div className="p-6 bg-white shadow rounded-xl border">
          <p className="text-gray-500 text-sm">Pending Orders</p>
          <p className="text-3xl font-bold mt-2 text-orange-600">{stats.pendingOrders}</p>
        </div>

        {/* Total Products */}
        <div className="p-6 bg-white shadow rounded-xl border">
          <p className="text-gray-500 text-sm">Items</p>
          <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
        </div>

        {/* Total Users */}
        <div className="p-6 bg-white shadow rounded-xl border">
          <p className="text-gray-500 text-sm">Users</p>
          <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
        </div>

      </div>

      {/* Revenue Box */}
      <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl shadow">
        <p className="text-gray-600 text-sm">Total Revenue</p>
        <p className="text-4xl font-bold text-green-700 mt-2">
          ₹ {stats.revenue}
        </p>
      </div>
    </DashboardLayout>
  );
}
