import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast.jsx";
import { saveAuth } from "@/lib/auth";

function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "farmer",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post("/auth/register", form);
      const { token, user } = res.data;
      saveAuth(token, user);
      setMessage({ type: "success", text: `Registered as ${user.role} (${user.email})` });
      toast({ title: "Registered", description: `Welcome, ${user.username || user.email}` });
      navigate("/");
    } catch (err) {
      const text = err.response?.data?.message || "Registration failed.";
      setMessage({ type: "error", text });
      toast({ title: "Registration failed", description: text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      {/* Updated Card */}
      <Card className="w-full max-w-md border border-border bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-foreground">Create your account</CardTitle>
          <CardDescription className="text-muted-foreground">Connect to the live API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="farmer_ahmed"
                value={form.username}
                onChange={handleChange}
                className="bg-background border-input"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="you@example.com"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="bg-background border-input"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="bg-background border-input"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                required
              >
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
              </select>
            </div>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 items-start">
          {message && (
            <p className={message.type === "success" ? "text-sm text-primary" : "text-sm text-destructive"}>
              {message.text}
            </p>
          )}
          <p className="text-xs text-muted-foreground text-left">
            On success, your JWT and user info are saved to localStorage.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default RegisterPage;