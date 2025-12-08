import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("CEO" | "Manager" | "Employee")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const [isBanned, setIsBanned] = useState<boolean | null>(null);
  const [checkingBan, setCheckingBan] = useState(true);

  useEffect(() => {
    const checkBanStatus = async () => {
      if (!user) {
        setCheckingBan(false);
        return;
      }

      const { data } = await supabase
        .from("banned_users")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      setIsBanned(data && data.length > 0);
      setCheckingBan(false);
    };

    checkBanStatus();
  }, [user]);

  if (loading || checkingBan) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isBanned) {
    return <Navigate to="/banned" replace />;
  }

  if (!profile?.approved) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    const dashboardPath = 
      profile.role === "CEO" ? "/ceo-dashboard" :
      profile.role === "Manager" ? "/manager-dashboard" :
      "/employee-dashboard";
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
}
