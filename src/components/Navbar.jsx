import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null; // hide navbar when logged OUT (login/register page)

  return (
    <nav className="w-full bg-primary text-primary-foreground px-6 py-3 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">🍽 Restaurant System</h1>

      <div className="flex items-center gap-6">
        <div className="text-sm">
          <p className="font-medium">{user.name}</p>
          <p className="text-xs opacity-80">Role: {user.role}</p>
        </div>

        <Button variant="secondary" onClick={logout}>
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
