import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { registerUser } from "../api/auth/authApi";
import { toast } from "sonner"; // ✅ Sonner toast
import { useNavigate } from "react-router-dom"; // ✅ for redirect

export const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(form);
      console.log(res); // handle register success/failure
      setForm({ name: "", email: "", password: "" });
        navigate("/");
        toast.success("Registration successful!", {
          description: "Your account has been created.",
          duration: 3000, // 3 seconds
        });

    } catch (error) {
      console.error(error);
      toast.error("Registration failed. Please try again.", {
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
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
            value={form.password}
            onChange={handleChange}
            required
          />
          <Button type="submit">Register</Button>
        </form>
      </Card>
    </div>
  );
};
