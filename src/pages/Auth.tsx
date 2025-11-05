import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get("action") || "create";
  const { signIn, signUp, user } = useAuth();
  
  const [step, setStep] = useState<"org" | "auth">("org");
  const [formData, setFormData] = useState({
    orgName: "",
    orgPassword: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/complete-profile");
    }
  }, [user, navigate]);

  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.orgName || !formData.orgPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setStep("auth");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // First sign up/in
      const authResult = await signUp(formData.email, formData.password);
      
      if (authResult.error) {
        // Try sign in instead
        const signInResult = await signIn(formData.email, formData.password);
        if (signInResult.error) {
          toast.error(signInResult.error.message);
          setLoading(false);
          return;
        }
      }

      // Store org info in session storage for profile completion
      sessionStorage.setItem("pendingOrg", JSON.stringify({
        orgName: formData.orgName,
        orgPassword: formData.orgPassword,
        action,
      }));

      navigate("/complete-profile");
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => step === "auth" ? setStep("org") : navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="bg-gradient-card border-border/50 p-8 shadow-elevated">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-gold rounded-xl flex items-center justify-center shadow-gold">
              {action === "create" ? (
                <Building2 className="w-8 h-8 text-primary-foreground" />
              ) : (
                <Users className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {action === "create" ? "Create Organization" : "Join Organization"}
            </h1>
            <p className="text-muted-foreground">
              {step === "org" 
                ? (action === "create" ? "Establish your organizational hierarchy" : "Enter organization credentials")
                : "Create your account"}
            </p>
          </div>

          {step === "org" ? (
            <form onSubmit={handleOrgSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="Enter organization name"
                  value={formData.orgName}
                  onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgPassword">
                  Organization Password
                </Label>
                <Input
                  id="orgPassword"
                  type="password"
                  placeholder={action === "create" ? "Create a secure password" : "Enter password"}
                  value={formData.orgPassword}
                  onChange={(e) => setFormData({ ...formData, orgPassword: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
                {action === "create" && (
                  <p className="text-xs text-muted-foreground">
                    Members will use this password to join your organization
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-gold text-primary-foreground font-semibold hover:shadow-gold"
              >
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-gold text-primary-foreground font-semibold hover:shadow-gold"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
