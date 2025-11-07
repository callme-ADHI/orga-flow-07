import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Users, BarChart3, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    
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
  }, [user, profile, loading, navigate]);

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
    <div className="min-h-screen bg-gradient-dark">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gold accent lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary to-transparent" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary to-transparent" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Logo */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center shadow-gold">
                <Building2 className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                ORGA
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Next-generation organizational workflow platform with intelligent task delegation and hierarchical management
            </p>
            <Button
              size="lg"
              className="bg-gradient-gold text-primary-foreground hover:opacity-90"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hierarchical Control</h3>
              <p className="text-sm text-muted-foreground">
                Structured roles with CEO, Manager, and Employee tiers
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Workload Distribution</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered task assignment using advanced algorithms
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Group Management</h3>
              <p className="text-sm text-muted-foreground">
                Dynamic team formation with rank-based assignment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
