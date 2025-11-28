import { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const navigate = useNavigate();

  const login = (userData) => {
    setUser(userData);

    localStorage.setItem("role", userData.role);
    localStorage.setItem("user", JSON.stringify(userData));

    // Redirect based on role
    switch (userData.role) {
      case "admin":
        console.log("➡️ Redirecting to /admin/AdminDashboard");
        navigate("/admin");
       
        break;
      case "waiter":
        console.log("➡️ Redirecting to /waiter/WaiterDashboard");
        navigate("/waiter");
        break;
        
      
      case "kitchen":
        console.log("➡️ Redirecting to /kitchen/KitchenDashboard");
        navigate("/kitchen");
        break;
      default:
        navigate("/login");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
