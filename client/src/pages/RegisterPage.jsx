import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api as myApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast.jsx";
import { saveAuth } from "@/lib/auth";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTranslation } from "react-i18next";

function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "farmer",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const register = useAction(api.auth.register);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await register({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      const { token, user } = res;
      saveAuth(token, user);
      setMessage({ type: "success", text: `Registered as ${user.role} (${user.email})` });
      toast({ title: t("toast.registered"), description: t("toast.welcome", { name: user.username || user.email }) });
      navigate("/");
    } catch (err) {
      const msg = err.message || t("toast.regFailed");
      toast({ variant: "destructive", title: t("toast.regFailed"), description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      {/* Updated Card */}
      <Card className="w-full max-w-md border border-border bg-card shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {t("register.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("register.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="space-y-1.5">
              <Label htmlFor="username">{t("register.username")}</Label>
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
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("register.email")}</Label>
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
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("register.password")}</Label>
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
            <div className="space-y-1.5">
              <Label htmlFor="role">{t("register.role")}</Label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="farmer">{t("register.roleFarmer")}</option>
                <option value="buyer">{t("register.roleBuyer")}</option>
                <option value="admin">{t("register.roleAdmin")}</option>
              </select>
            </div>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" type="submit" disabled={loading}>
              {loading ? t("register.btnLoading") : t("register.btn")}
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