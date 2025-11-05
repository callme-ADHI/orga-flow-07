import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Bell, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const location = useLocation();
  const { profile } = useAuth();

  const getDashboardPath = () => {
    if (profile?.role === "CEO") return "/ceo-dashboard";
    if (profile?.role === "Manager") return "/manager-dashboard";
    return "/employee-dashboard";
  };

  const getTasksPath = () => {
    if (profile?.role === "CEO" || profile?.role === "Manager") return "/all-tasks";
    return "/my-tasks";
  };

  const links = [
    { to: getDashboardPath(), icon: LayoutDashboard, label: "Dashboard" },
    { to: getTasksPath(), icon: ClipboardList, label: "Tasks" },
    { to: "/notifications", icon: Bell, label: "Alerts" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-4 flex-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
