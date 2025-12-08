import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [checkingBan, setCheckingBan] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (loading || checkingBan) return;
    
    const checkBanStatus = async () => {
      if (user && profile?.org_id) {
        setCheckingBan(true);
        // Check if user is banned from their organization
        const { data: banData } = await supabase
          .from("banned_users")
          .select("id")
          .eq("user_id", user.id)
          .eq("org_id", profile.org_id)
          .maybeSingle();

        setCheckingBan(false);
        
        if (banData) {
          navigate("/banned");
          return;
        }
      }

      // Also check if user is banned from any org they were previously in
      if (user && !profile?.org_id) {
        setCheckingBan(true);
        const { data: banData } = await supabase
          .from("banned_users")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        setCheckingBan(false);

        if (banData && banData.length > 0) {
          navigate("/banned");
          return;
        }
      }

      if (user && profile?.approved) {
        const dashboardPath = 
          profile.role === "CEO" ? "/ceo-dashboard" :
          profile.role === "Manager" ? "/manager-dashboard" :
          "/employee-dashboard";
        navigate(dashboardPath);
      } else if (user && profile && !profile.approved) {
        navigate("/pending-approval");
      } else if (user && !profile) {
        navigate("/complete-profile");
      }
    };

    checkBanStatus();
  }, [user, profile, loading, checkingBan, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const { error } = isLogin
        ? await signIn(formData.email, formData.password)
        : await signUp(formData.email, formData.password);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else if (!isLogin) {
        toast({
          title: "Account created!",
          description: "Please complete your profile to continue.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <Card className="bg-gradient-card border-border/50 p-8 shadow-elevated max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? "Sign in to your account" : "Get started with Orga"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="mt-1"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="mt-1"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-gold text-primary-foreground"
            disabled={formLoading}
          >
            {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="text-primary font-semibold">
              {isLogin ? "Sign Up" : "Sign In"}
            </span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </Card>
    </div>
  );
}
