import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast.jsx";
import { saveAuth } from "@/lib/auth";

function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("buyer1@test.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;
      saveAuth(token, user);

      setMessage({ type: "success", text: `Logged in as ${user.role} (${user.email})` });
      toast({ title: "Logged in", description: `Welcome back, ${user.username || user.email}` });
      navigate("/");
    } catch (err) {
      const text =
        err.response?.data?.message || "Login failed. Please check your credentials.";
      setMessage({ type: "error", text });
      toast({ title: "Login failed", description: text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      
      {/* Updated Card colors */}
      <Card className="w-full max-w-md shadow-2xl border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to AgriFlow to manage listings and marketplace activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              {/* Updated Input colors */}
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-input text-foreground"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-input text-foreground"
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
          {message && (
            <p
              className={
                message.type === "success"
                  ? "text-sm text-primary font-medium"
                  : "text-sm text-destructive font-medium"
              }
            >
              {message.text}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Test users: e.g. <code className="bg-muted px-1 py-0.5 rounded">buyer1@test.com / 123456</code> or any account you
            created in Postman.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;