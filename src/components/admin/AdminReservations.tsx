import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, X, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAdminReservations } from "@/lib/api";

function formatTime(timeStr: string) {
  if (!timeStr) return timeStr;
  const match = String(timeStr).match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeStr;
  const h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

const statusConfig: Record<string, { color: string; icon: typeof Check }> = {
  confirmed: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: Check },
  pending: { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
  cancelled: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: X },
};

export function AdminReservations() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: reservations = [], isLoading, error } = useQuery({
    queryKey: ["admin", "reservations"],
    queryFn: getAdminReservations,
  });

  const list = Array.isArray(reservations) ? reservations : [];
  const filtered = list.filter((r: { name: string; status: string }) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (error) {
    return (
      <div className="text-destructive font-body py-4">
        Failed to load reservations. You may need to sign in again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reservations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2">
          {["all", "confirmed", "pending", "cancelled"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "elegant"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Guest", "Party", "Date", "Time", "Status", "Notes", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground font-body">
                    Loading reservations…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground font-body">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                (filtered as Array<{ id: number; name: string; phone: string; guests: string; date: string; time: string; status: string; notes: string }>).map((res, i) => {
                  const status = statusConfig[res.status] || statusConfig.pending;
                  return (
                    <motion.tr
                      key={res.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-foreground font-body">{res.name}</p>
                        <p className="text-xs text-muted-foreground font-body">{res.phone}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground font-body">{res.guests}</td>
                      <td className="px-5 py-4 text-sm text-foreground font-body">{res.date}</td>
                      <td className="px-5 py-4 text-sm text-foreground font-body">{formatTime(res.time)}</td>
                      <td className="px-5 py-4">
                        <Badge variant="outline" className={`${status.color} text-xs capitalize`}>
                          {res.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground font-body max-w-[200px] truncate">
                        {res.notes || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:text-emerald-300">
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
