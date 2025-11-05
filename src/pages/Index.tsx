import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Users, BarChart3, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile?.approved) {
      const dashboardPath = 
        profile.role === "CEO" ? "/ceo-dashboard" :
        profile.role === "Manager" ? "/manager-dashboard" :
        "/employee-dashboard";
      navigate(dashboardPath);
    }
  }, [user, profile, navigate]);

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
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Next-generation organizational workflow platform with intelligent task delegation and hierarchical management
            </p>
          </div>

          {/* CTA Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-20">
            <Card 
              className="bg-gradient-card border-border/50 p-8 hover:shadow-gold transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/auth?action=create')}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Create Organization</h2>
                <p className="text-muted-foreground mb-6">
                  Start your organizational hierarchy as CEO
                </p>
                <Button className="w-full bg-gradient-gold text-primary-foreground font-semibold hover:shadow-gold">
                  Create
                </Button>
              </div>
            </Card>

            <Card 
              className="bg-gradient-card border-border/50 p-8 hover:shadow-gold transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/auth?action=join')}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Join Organization</h2>
                <p className="text-muted-foreground mb-6">
                  Become part of an existing organization
                </p>
                <Button variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
                  Join
                </Button>
              </div>
            </Card>
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
