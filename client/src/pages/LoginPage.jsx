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

function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState("admin@agriflow.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const login = useAction(api.auth.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await login({ email, password });
      const { token, user } = res;
      saveAuth(token, user);

      setMessage({ type: "success", text: `Logged in as ${user.role} (${user.email})` });
      toast({ title: t("toast.loggedIn"), description: `${t("toast.welcomeBack")} ${user.username || user.email}` });
      navigate("/");
    } catch (err) {
      const text =
        err.message || "Login failed. Please check your credentials.";
      const msg = err.message || t("toast.loginFailed");
      toast({ variant: "destructive", title: t("toast.loginFailed"), description: msg });
      setMessage({ type: "error", text });
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
            {t("login.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("login.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("login.email")}</Label>
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
              <Label htmlFor="password">{t("login.password")}</Label>
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
              {loading ? t("login.btnLoading") : t("login.btn")}
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
          <p className="text-xs text-muted-foreground mt-4">
            {t("login.testUsers")}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;