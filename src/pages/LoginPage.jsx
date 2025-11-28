import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { loginUser } from "../api/auth/authApi";
import { Link } from "react-router-dom"; // <-- import Link
import { toast } from "sonner"; // ✅ Sonner toast
import { useAuth } from "@/context/AuthContext.jsx";

export const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await loginUser(form);
    console.log("LOGIN RESPONSE:", res); // ← check frontend response
    if (res?.token) {
      login(res); // Will redirect based on role
   
    } else {
      console.log(res?.message || "Login failed");
      toast.error("Login failed. Please try again.", {
        duration: 3000,
      });
    }
    console.log(res); // handle login success/failure
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
             autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Button type="submit">Login</Button>
        </form>
        {/* Register link */}
        <p className="mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
};
