import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />; // Not logged in
  if (role && user.role !== role) return <Navigate to="/login" replace />; // Role mismatch
  return children;
};
