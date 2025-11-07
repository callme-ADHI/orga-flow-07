import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function CompleteProfile() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && profile) {
      const dashboardPath = 
        profile.role === "CEO" ? "/ceo-dashboard" :
        profile.role === "Manager" ? "/manager-dashboard" :
        profile.approved ? "/employee-dashboard" : "/pending-approval";
      navigate(dashboardPath);
    }
  }, [user, profile, authLoading, navigate]);

  const [formData, setFormData] = useState({
    name: "",
    role: "Employee" as "CEO" | "Manager" | "Employee",
    orgName: "",
    orgPassword: "",
    existingOrgId: "",
    existingOrgPassword: "",
    rank: "",
    resumeUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let orgId = null;

      if (formData.role === "CEO") {
        // CEO creates organization - no resume needed, no hashing on client
        const { data: org, error: orgError } = await supabase
          .from("organizations")
          .insert({
            org_name: formData.orgName,
            org_password: formData.orgPassword, // Store plaintext temporarily - should use edge function
            created_by: user.id,
          })
          .select()
          .single();

        if (orgError) {
          console.error("Organization creation error:", orgError);
          throw new Error(orgError.message || "Failed to create organization");
        }
        orgId = org.id;
      } else {
        // Join existing organization
        const { data: org, error: orgError } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", formData.existingOrgId)
          .single();

        if (orgError) throw new Error("Organization not found");

        // Simple password check - should use edge function for bcrypt
        if (formData.existingOrgPassword !== org.org_password) {
          throw new Error("Invalid organization password");
        }
        orgId = org.id;
      }

      // Create profile - CEO is auto-approved by trigger
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: user.id,
        name: formData.name,
        email: user.email!,
        role: formData.role,
        org_id: orgId,
        rank: formData.rank || null,
        resume_url: formData.resumeUrl || null,
      });

      if (profileError) throw profileError;

      await refreshProfile();

      toast({
        title: "Profile created successfully!",
        description:
          formData.role === "CEO"
            ? "Welcome to your organization!"
            : "Waiting for approval from your organization.",
      });

      // CEO goes directly to dashboard, others wait for approval
      if (formData.role === "CEO") {
        navigate("/ceo-dashboard");
      } else {
        navigate("/pending-approval");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <Card className="bg-gradient-card border-border/50 p-8 shadow-elevated max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-gold bg-clip-text text-transparent">
          Complete Your Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="mt-1"
            />
          </div>

          {/* Role Selection */}
          <div>
            <Label>Select Your Role</Label>
            <RadioGroup
              value={formData.role}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  role: value as "CEO" | "Manager" | "Employee",
                })
              }
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CEO" id="ceo" />
                <Label htmlFor="ceo" className="cursor-pointer">
                  CEO (Create Organization)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Manager" id="manager" />
                <Label htmlFor="manager" className="cursor-pointer">
                  Manager (Join Organization)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Employee" id="employee" />
                <Label htmlFor="employee" className="cursor-pointer">
                  Employee (Join Organization)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* CEO: Create Organization - No resume needed */}
          {formData.role === "CEO" && (
            <>
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={formData.orgName}
                  onChange={(e) =>
                    setFormData({ ...formData, orgName: e.target.value })
                  }
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="orgPassword">Organization Password</Label>
                <Input
                  id="orgPassword"
                  type="password"
                  value={formData.orgPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, orgPassword: e.target.value })
                  }
                  required
                  className="mt-1"
                />
              </div>
            </>
          )}

          {/* Manager/Employee: Join Organization */}
          {formData.role !== "CEO" && (
            <>
              <div>
                <Label htmlFor="existingOrgId">Organization ID</Label>
                <Input
                  id="existingOrgId"
                  value={formData.existingOrgId}
                  onChange={(e) =>
                    setFormData({ ...formData, existingOrgId: e.target.value })
                  }
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="existingOrgPassword">
                  Organization Password
                </Label>
                <Input
                  id="existingOrgPassword"
                  type="password"
                  value={formData.existingOrgPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      existingOrgPassword: e.target.value,
                    })
                  }
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="rank">Rank (Optional)</Label>
                <Input
                  id="rank"
                  value={formData.rank}
                  onChange={(e) =>
                    setFormData({ ...formData, rank: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="resumeUrl">Resume URL (Optional)</Label>
                <Input
                  id="resumeUrl"
                  value={formData.resumeUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, resumeUrl: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-gold text-primary-foreground"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {formData.role === "CEO" ? "Create Organization & Go to Dashboard" : "Submit for Approval"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
