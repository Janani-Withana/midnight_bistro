import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarCheck,
  Image,
  LogOut,
  Menu,
  X,
  ClipboardList,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  logoutAdmin,
  refreshAdminSession,
  getAdminReservations,
  getAdminMenuItems,
  getAdminGallery,
  getAdminCategories,
} from "@/lib/api";
import { AdminReservations } from "@/components/admin/AdminReservations";
import { AdminMenuManager } from "@/components/admin/AdminMenuManager";
import { AdminGalleryManager } from "@/components/admin/AdminGalleryManager";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "reservations", label: "Reservations", icon: CalendarCheck },
  { id: "menu", label: "Menu Items", icon: UtensilsCrossed },
  { id: "gallery", label: "Gallery", icon: Image },
];

const ADMIN_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

type AdminReservationRow = {
  id: number;
  name: string;
  date: string;
  time: string;
  guests?: string;
  status?: string;
  createdAt?: string;
};

function todayLocalYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function timeAgo(iso: string | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`;
  return `${Math.floor(sec / 86400)} day(s) ago`;
}

function formatTodayHeading() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      refreshAdminSession();
    }, ADMIN_REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "reservations":
        return <AdminReservations />;
      case "menu":
        return <AdminMenuManager />;
      case "gallery":
        return <AdminGalleryManager />;
      default:
        return <OverviewContent onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h1 className="font-display text-xl tracking-wider text-gradient-gold">
              EMBER <span className="text-xs text-muted-foreground font-body tracking-normal">Admin</span>
            </h1>
            <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body transition-all duration-200 ${
                  activeSection === item.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <button
              type="button"
              onClick={async () => {
                await logoutAdmin();
                window.location.href = "/admin";
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-destructive transition-colors font-body"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-display text-lg capitalize tracking-wide text-foreground">
              {navItems.find((n) => n.id === activeSection)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function OverviewContent({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    todayReservations: 0,
    pendingReservations: 0,
    menuItems: 0,
    gallery: 0,
    categories: 0,
    totalReservations: 0,
  });
  const [activities, setActivities] = useState<
    { key: string; at: number; text: string; sub: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [reservations, menuItems, gallery, categories] = await Promise.all([
          getAdminReservations(),
          getAdminMenuItems(),
          getAdminGallery(),
          getAdminCategories(),
        ]);
        if (cancelled) return;

        const resList = reservations as AdminReservationRow[];
        const ymd = todayLocalYmd();
        const todayRes = resList.filter((r) => String(r.date || "").trim() === ymd).length;
        const pending = resList.filter((r) => String(r.status || "").toLowerCase() === "pending").length;

        setStats({
          todayReservations: todayRes,
          pendingReservations: pending,
          menuItems: menuItems.length,
          gallery: gallery.length,
          categories: categories.length,
          totalReservations: resList.length,
        });

        const rows: { key: string; at: number; text: string; sub: string }[] = [];
        for (const r of resList) {
          rows.push({
            key: `r-${r.id}`,
            at: r.createdAt ? new Date(r.createdAt).getTime() : 0,
            text: `${r.name} · ${r.date} at ${r.time} · ${r.guests ?? "?"} guests`,
            sub: timeAgo(r.createdAt),
          });
        }
        rows.sort((a, b) => b.at - a.at);
        setActivities(rows.slice(0, 8));
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e && typeof e === "object" && "message" in e ? String((e as Error).message) : "Failed to load overview";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statCards = [
    {
      label: "Today’s seatings",
      hint: "Bookings for today",
      value: stats.todayReservations,
      icon: CalendarCheck,
      accent: "from-primary/20 to-primary/5",
      iconBg: "bg-primary/15 text-primary",
    },
    {
      label: "Awaiting reply",
      hint: "Pending requests",
      value: stats.pendingReservations,
      icon: ClipboardList,
      accent: "from-amber-500/15 to-transparent",
      iconBg: "bg-amber-500/15 text-amber-400",
    },
    {
      label: "Menu & categories",
      hint: `${stats.categories} categories · ${stats.menuItems} dishes`,
      value: stats.menuItems,
      icon: UtensilsCrossed,
      accent: "from-accent/20 to-transparent",
      iconBg: "bg-accent/15 text-accent",
    },
    {
      label: "Gallery",
      hint: "Ambiance photos",
      value: stats.gallery,
      icon: Image,
      accent: "from-emerald-500/15 to-transparent",
      iconBg: "bg-emerald-500/15 text-emerald-400",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse max-w-6xl mx-auto">
        <div className="h-36 rounded-2xl bg-muted/40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted/30" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-muted/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto bg-destructive/10 border border-destructive/30 rounded-2xl p-6 text-sm text-destructive font-body">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.07] px-6 py-8 sm:px-8 sm:py-10 shadow-sm"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-body text-primary mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Ember Bistro · Back office
            </div>
            <h2 className="font-display text-2xl sm:text-3xl tracking-wide text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground font-body mt-2">{formatTodayHeading()}</p>
            <p className="text-xs text-muted-foreground/90 font-body mt-3 max-w-md">
              Track guest reservations, keep the menu and gallery in sync—everything guests see on the site flows from here.
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-body">All-time bookings</p>
            <p className="font-display text-3xl text-foreground tabular-nums">{stats.totalReservations}</p>
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`group relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br ${stat.accent} p-5 transition-all hover:border-primary/25 hover:shadow-md`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className={`rounded-xl p-2.5 ${stat.iconBg}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-4 font-display text-3xl tabular-nums text-foreground tracking-tight">{stat.value}</p>
            <p className="text-sm font-medium text-foreground/90 font-body mt-1">{stat.label}</p>
            <p className="text-xs text-muted-foreground font-body mt-0.5">{stat.hint}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Guest activity */}
        <div className="lg:col-span-3 rounded-2xl border border-border/80 bg-card/50 backdrop-blur-sm p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="font-display text-lg tracking-wide text-foreground">Latest reservations</h3>
              <p className="text-xs text-muted-foreground font-body mt-1">Newest guest requests first</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("reservations")}
              className="text-xs font-body text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              Open list <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {activities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 py-12 px-4 text-center">
              <CalendarCheck className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground font-body">No reservations yet. They’ll appear here when guests book.</p>
            </div>
          ) : (
            <ul className="space-y-0 divide-y divide-border/60">
              {activities.map((activity, idx) => (
                <li key={activity.key} className="flex gap-4 py-4 first:pt-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary font-body">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground font-body leading-snug">{activity.text}</p>
                    {activity.sub ? <p className="text-xs text-muted-foreground font-body mt-1">{activity.sub}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-gradient-to-b from-card to-muted/20 p-6 sm:p-7">
          <div className="flex items-center gap-2 mb-5">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="font-display text-lg tracking-wide text-foreground">Jump to</h3>
          </div>
          <div className="space-y-2">
            {[
              { id: "reservations" as const, label: "Reservations", sub: "Review and manage bookings", icon: CalendarCheck },
              { id: "menu" as const, label: "Menu", sub: "Categories & dishes", icon: UtensilsCrossed },
              { id: "gallery" as const, label: "Gallery", sub: "Photos on the site", icon: Image },
            ].map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => onNavigate(action.id)}
                className="group w-full flex items-center gap-4 rounded-xl border border-border/60 bg-background/60 px-4 py-3.5 text-left transition-all hover:border-primary/35 hover:bg-primary/5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/80 text-foreground group-hover:bg-primary/15 group-hover:text-primary transition-colors">
                  <action.icon className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-foreground font-body">{action.label}</span>
                  <span className="block text-xs text-muted-foreground font-body mt-0.5">{action.sub}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
