import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const role = user?.role; // admin / waiter / kitchen

  const menus = {
    admin: [
      { name: "Dashboard", path: "/admin" },
      { name: "Items", path: "/admin/products" },
      { name: "Categories", path: "/admin/categories" },
      { name: "Orders", path: "/admin/orders" },
      { name: "Users", path: "/admin/users" },
     
    ],
    waiter: [
      { name: "Dashboard", path: "/waiter" },
      { name: "Take Order", path: "/waiter/order" },
    ],
    kitchen: [
      { name: "Dashboard", path: "/kitchen" },
      { name: "Completed Orders", path: "/kitchen/completed-orders" },
    ],
  };

  const items = menus[role] || [];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 md:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={onClose}
      />

      <aside
        className={`
          fixed z-40 top-0 left-0 h-full w-64 
          bg-white shadow-lg border-r transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
        `}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg capitalize">{role} Panel</h2>
          <button className="md:hidden" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* MENU LIST */}
        <nav className="px-4 py-4 space-y-1">
          {items.map((item) => {
            //const isActive = location.pathname.startsWith(item.path);

            const isActive =
              location.pathname === item.path ||
              (item.path !== `/${role}` &&
                location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  block px-4 py-2 rounded-md font-medium transition
                  ${
                    isActive
                      ? "bg-primary text-white shadow"
                      : "hover:bg-gray-200 text-gray-700"
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
