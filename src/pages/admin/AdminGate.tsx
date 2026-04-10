import { useEffect, useState } from "react";
import { getAuthToken, getRefreshToken, refreshAdminSession } from "@/lib/api";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";

export default function AdminGate() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let token = getAuthToken();
      if (!token && getRefreshToken()) {
        await refreshAdminSession();
        token = getAuthToken();
      }
      if (!cancelled) {
        setAuthed(!!token);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-body">
        Loading…
      </div>
    );
  }
  if (!authed) return <AdminLogin />;
  return <AdminDashboard />;
}
