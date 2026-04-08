import { getAuthToken } from "@/lib/api";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";

export default function AdminGate() {
  const token = getAuthToken();
  if (!token) return <AdminLogin />;
  return <AdminDashboard />;
}
