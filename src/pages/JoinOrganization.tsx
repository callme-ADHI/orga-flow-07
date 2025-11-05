import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const JoinOrganization = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    orgName: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.orgName || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    // TODO: Implement organization join with Supabase
    toast.success("Request submitted! Awaiting approval...");
    navigate("/employee-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="bg-gradient-card border-border/50 p-8 shadow-elevated">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-gold rounded-xl flex items-center justify-center shadow-gold">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Join Organization</h1>
            <p className="text-muted-foreground">
              Enter credentials to request access
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="password">Organization Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter organization password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-background/50 border-border/50"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-gold text-primary-foreground font-semibold hover:shadow-gold"
            >
              Request Access
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default JoinOrganization;
