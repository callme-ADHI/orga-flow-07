import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Ban, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Banned() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <Card className="bg-gradient-card border-destructive/50 p-8 shadow-elevated max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ban className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-destructive mb-2">
            You Are Fired
          </h1>
          <p className="text-muted-foreground">
            You have been removed from this organization and are no longer allowed to access it.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you believe this is a mistake, please contact your organization's administrator directly.
          </p>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
