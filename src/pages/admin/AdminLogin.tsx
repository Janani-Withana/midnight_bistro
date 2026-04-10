import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyAuthResponse, login, register } from "@/lib/api";
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
      if (applyAuthResponse(data)) {
        navigate("/admin", { replace: true });
        window.location.reload();
      } else {
        setError("Invalid response from server");
      }
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as Error).message) : "Sign in failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
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
          {isRegister ? "Create admin account" : "Admin sign in"}
        </h1>
        <p className="text-sm text-muted-foreground font-body mb-6">
          {isRegister
            ? "Use the ADMIN_SECRET from the server environment to authorize the first (or additional) admin account."
            : "Email and password for an admin account."}
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
                placeholder="Your name"
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
              <label className="text-xs tracking-wider uppercase text-muted-foreground">Admin secret</label>
              <Input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="bg-background border-border"
                placeholder="ADMIN_SECRET from .env"
                required
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive font-body">{error}</p>}
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </Button>
        </form>
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError(null);
          }}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground font-body"
        >
          {isRegister ? "Already have an account? Sign in" : "Need an account? Create admin"}
        </button>
      </motion.div>
    </div>
  );
}
