import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ClipboardList, Bell, Settings, UserPlus, BarChart3, FolderKanban, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import orgaLogo from "@/assets/orga-logo.png";

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();

  const ceoLinks = [
    { to: "/ceo-dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/pending-approvals", icon: UserPlus, label: "Approvals" },
    { to: "/employees", icon: Users, label: "Employees" },
    { to: "/all-tasks", icon: ClipboardList, label: "All Tasks" },
    { to: "/groups", icon: FolderKanban, label: "Groups" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/notifications", icon: Bell, label: "Notifications", badge: unreadCount },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const managerLinks = [
    { to: "/manager-dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/pending-approvals", icon: UserPlus, label: "Approvals" },
    { to: "/create-task", icon: ClipboardList, label: "Create Task" },
    { to: "/groups", icon: FolderKanban, label: "Groups" },
    { to: "/employees", icon: Users, label: "Employees" },
    { to: "/all-tasks", icon: ClipboardList, label: "All Tasks" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/notifications", icon: Bell, label: "Notifications", badge: unreadCount },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const employeeLinks = [
    { to: "/employee-dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/my-tasks", icon: ClipboardList, label: "My Tasks" },
    { to: "/my-groups", icon: FolderKanban, label: "My Groups" },
    { to: "/performance", icon: BarChart3, label: "Performance" },
    { to: "/notifications", icon: Bell, label: "Notifications", badge: unreadCount },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const links = profile?.role === "CEO" ? ceoLinks : profile?.role === "Manager" ? managerLinks : employeeLinks;

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-50",
        isExpanded ? "w-[250px]" : "w-[60px]"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-3 border-b border-border">
        <div className="flex items-center gap-3">
          <img 
            src={orgaLogo} 
            alt="ORGA Logo" 
            className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
          />
          {isExpanded && (
            <span className="font-bold text-lg bg-gradient-gold bg-clip-text text-transparent whitespace-nowrap">
              ORGA
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          
          return (
            <Link key={link.to} to={link.to}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {link.badge && link.badge > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                      {link.badge > 9 ? "9+" : link.badge}
                    </span>
                  )}
                </div>
                {isExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {link.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Profile & Logout */}
      <div className="border-t border-border p-4">
        {isExpanded && profile && (
          <div className="mb-3">
            <p className="text-sm font-semibold truncate">{profile.name}</p>
            <p className="text-xs text-muted-foreground">{profile.custom_id}</p>
            <p className="text-xs text-primary">{profile.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size={isExpanded ? "default" : "icon"}
          onClick={signOut}
          className="w-full"
        >
          <LogOut className="w-5 h-5" />
          {isExpanded && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
