import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { Toaster } from "sonner";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import WaiterDashboard from "./pages/waiter/WaiterDashboard";
import KitchenDashboard from "./pages/kitchen/KitchenDashboard.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import TakeOrder from "./pages/waiter/TakeOrder.jsx";
import WaiterTables from "./pages/waiter/WaiterTables.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import KitchenCompletedOrder from "./pages/kitchen/KitchenCompletedOrders.jsx";

// Optional: ProtectedRoute for future dashboards
const ProtectedRoute = ({ children, role }) => {
  // Example: get role from localStorage or context
  const userRole = localStorage.getItem("role");
  if (!userRole || (role && userRole !== role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <Toaster richColors />
      <Router>
        <AuthProvider>
          {/* Global Navbar */}
          <Navbar />

          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Example protected dashboard routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <ProtectedRoute role="admin">
                  <AdminProducts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute role="admin">
                  <AdminOrders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute role="admin">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute role="admin">
                  <AdminCategories />
                </ProtectedRoute>
              }
            />
            {/* protected waiter routes start */}
            <Route
              path="/waiter"
              element={
                <ProtectedRoute role="waiter">
                  <WaiterDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/waiter/order/:tableId"
              element={
                <ProtectedRoute role="waiter">
                  <TakeOrder />
                </ProtectedRoute>
              }
            />

            {/* protected waiter routes end */}

            <Route
              path="/kitchen"
              element={
                <ProtectedRoute role="kitchen">
                  <KitchenDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/kitchen/completed-orders"
              element={
                <ProtectedRoute role="kitchen">
                  <KitchenCompletedOrder />
                </ProtectedRoute>
              }
            />

            {/* Redirect any unknown routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
