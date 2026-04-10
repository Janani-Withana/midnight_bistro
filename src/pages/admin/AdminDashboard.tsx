import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarCheck,
  Image,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAdmin, refreshAdminSession } from "@/lib/api";
import { AdminReservations } from "@/components/admin/AdminReservations";
import { AdminMenuManager } from "@/components/admin/AdminMenuManager";
import { AdminGalleryManager } from "@/components/admin/AdminGalleryManager";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "reservations", label: "Reservations", icon: CalendarCheck },
  { id: "menu", label: "Menu Items", icon: UtensilsCrossed },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "customers", label: "Customers", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

const stats = [
  { label: "Today's Reservations", value: "24", change: "+12%", icon: CalendarCheck, color: "text-primary" },
  { label: "Revenue This Week", value: "$18,420", change: "+8.3%", icon: DollarSign, color: "text-accent" },
  { label: "Avg. Wait Time", value: "12 min", change: "-5%", icon: Clock, color: "text-emerald-400" },
  { label: "Customer Rating", value: "4.9", change: "+0.2", icon: Star, color: "text-amber-400" },
];

const recentActivity = [
  { time: "2 min ago", text: "New reservation: Table for 4 at 8:00 PM", type: "reservation" },
  { time: "15 min ago", text: "Menu item updated: Wagyu A5 Tataki", type: "menu" },
  { time: "1 hr ago", text: "5-star review from James W.", type: "review" },
  { time: "2 hr ago", text: "Reservation cancelled: Table 12", type: "cancel" },
  { time: "3 hr ago", text: "New gallery photo uploaded", type: "gallery" },
];

const ADMIN_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

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
        return <OverviewContent />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h1 className="font-display text-xl tracking-wider text-gradient-gold">
              EMBER <span className="text-xs text-muted-foreground font-body tracking-normal">Admin</span>
            </h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
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

          {/* Footer */}
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

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
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

        {/* Page content */}
        <main className="flex-1 p-6">
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

function OverviewContent() {
  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-body">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-display tracking-wide text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h3 className="font-display text-base tracking-wide text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-foreground font-body">{activity.text}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-display text-base tracking-wide text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              variant="elegant"
              className="w-full justify-start gap-2"
              onClick={() => {}}
            >
              <CalendarCheck className="w-4 h-4" /> New Reservation
            </Button>
            <Button
              variant="elegant"
              className="w-full justify-start gap-2"
              onClick={() => {}}
            >
              <UtensilsCrossed className="w-4 h-4" /> Add Menu Item
            </Button>
            <Button
              variant="elegant"
              className="w-full justify-start gap-2"
              onClick={() => {}}
            >
              <Image className="w-4 h-4" /> Upload Photo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
