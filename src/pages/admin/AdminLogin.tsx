import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, register, setAuthToken } from "@/lib/api";
import heroBg from "@/assets/hero-bg.jpg";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = isRegister
        ? await register(email, password, name || undefined, adminSecret || undefined)
        : await login(email, password);
      const token = data?.token;
      if (token) {
        setAuthToken(token);
        navigate("/admin", { replace: true });
        window.location.reload();
      } else {
        setError("Invalid response from server");
      }
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as Error).message) : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Same background as landing hero */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover object-center scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
      </div>
      <div className="absolute inset-0 noise-overlay z-[1] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-card/75 border border-border/50 rounded-xl p-8"
      >
        <h1 className="font-display text-2xl tracking-wide text-foreground mb-2">
          {isRegister ? "Register as Admin" : "Admin Sign In"}
        </h1>
        <p className="text-sm text-muted-foreground font-body mb-6">
          {isRegister ? "First time? Enter admin secret to create an admin account." : "Sign in to access the dashboard."}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-2">
              <label className="text-xs tracking-wider uppercase text-muted-foreground">Name (optional)</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background border-border"
                placeholder="Admin name"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs tracking-wider uppercase text-muted-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background border-border"
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs tracking-wider uppercase text-muted-foreground">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background border-border"
              placeholder="••••••••"
            />
          </div>
          {isRegister && (
            <div className="space-y-2">
              <label className="text-xs tracking-wider uppercase text-muted-foreground">Admin Secret</label>
              <Input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="bg-background border-border"
                placeholder="From server ADMIN_SECRET"
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive font-body">{error}</p>}
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? "Please wait…" : isRegister ? "Register" : "Sign In"}
          </Button>
        </form>
        <button
          type="button"
          onClick={() => { setIsRegister(!isRegister); setError(null); }}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground font-body"
        >
          {isRegister ? "Already have an account? Sign in" : "First time? Register as admin"}
        </button>
      </motion.div>
    </div>
  );
}
