import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function PendingApproval() {
  const { profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.approved) {
      const dashboardPath = 
        profile.role === "CEO" ? "/ceo-dashboard" :
        profile.role === "Manager" ? "/manager-dashboard" :
        "/employee-dashboard";
      navigate(dashboardPath);
    }

    // Check for approval every 5 seconds
    const interval = setInterval(() => {
      refreshProfile();
    }, 5000);

    return () => clearInterval(interval);
  }, [profile, navigate, refreshProfile]);

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <Card className="bg-gradient-card border-border/50 p-8 shadow-elevated max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-warning/10 rounded-xl flex items-center justify-center">
          <Clock className="w-8 h-8 text-warning" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Pending Approval</h1>
        <p className="text-muted-foreground mb-6">
          Your profile has been submitted for review. The CEO or Manager will approve your request shortly.
        </p>

        <div className="bg-background/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-primary" />
            <p className="font-semibold">Organization</p>
          </div>
          <p className="text-sm text-muted-foreground">{profile?.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{profile?.email}</p>
        </div>

        <Button
          variant="outline"
          onClick={signOut}
          className="w-full"
        >
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
