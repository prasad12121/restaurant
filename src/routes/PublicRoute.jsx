import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const role = localStorage.getItem("role");

  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "waiter") return <Navigate to="/waiter" replace />;
  if (role === "kitchen") return <Navigate to="/kitchen" replace />;

  return children; // user not logged in → allow login/register page
};

export default PublicRoute;
