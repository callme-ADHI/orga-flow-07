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
    if (authLoading) return;
    
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (profile) {
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
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to complete your profile",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let orgId: string | null = null;
      let resumeUrl: string | null = null;

      // Upload resume if provided (for non-CEO roles)
      if (resumeFile && formData.role !== "CEO") {
        setUploadingResume(true);
        const fileExt = resumeFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, resumeFile);

        if (uploadError) {
          console.error("Resume upload error:", uploadError);
          throw new Error("Failed to upload resume: " + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(filePath);

        resumeUrl = publicUrl;
        setUploadingResume(false);
      }

      if (formData.role === "CEO") {
        // Validate CEO form
        if (!formData.orgName.trim()) {
          throw new Error("Organization name is required");
        }
        if (!formData.orgPassword.trim()) {
          throw new Error("Organization password is required");
        }

        // CEO creates organization
        const { data: org, error: orgError } = await supabase
          .from("organizations")
          .insert({
            org_name: formData.orgName.trim(),
            org_password: formData.orgPassword,
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
        // Validate Employee/Manager form
        if (!formData.existingOrgId.trim()) {
          throw new Error("Organization name is required");
        }
        if (!formData.existingOrgPassword.trim()) {
          throw new Error("Organization password is required");
        }

        // Join existing organization by name
        const { data: org, error: orgError } = await supabase
          .from("organizations")
          .select("*")
          .eq("org_name", formData.existingOrgId.trim())
          .single();

        if (orgError || !org) {
          throw new Error("Organization not found. Please check the organization name.");
        }

        // Verify password
        if (formData.existingOrgPassword !== org.org_password) {
          throw new Error("Invalid organization password");
        }
        
        orgId = org.id;
      }

      // Create profile - CEO is auto-approved by database trigger
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: user.id,
        name: formData.name.trim(),
        email: user.email!,
        role: formData.role,
        org_id: orgId,
        rank: formData.rank.trim() || null,
        resume_url: resumeUrl,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        throw new Error(profileError.message || "Failed to create profile");
      }

      // Refresh profile in context
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
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadingResume(false);
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
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
              placeholder="Enter your full name"
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

          {/* CEO: Create Organization */}
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
                  placeholder="Enter organization name"
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
                  placeholder="Create a password for employees to join"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Share this password with employees so they can join your organization.
                </p>
              </div>
            </>
          )}

          {/* Manager/Employee: Join Organization */}
          {formData.role !== "CEO" && (
            <>
              <div>
                <Label htmlFor="existingOrgId">Organization Name</Label>
                <Input
                  id="existingOrgId"
                  value={formData.existingOrgId}
                  onChange={(e) =>
                    setFormData({ ...formData, existingOrgId: e.target.value })
                  }
                  required
                  className="mt-1"
                  placeholder="Enter your organization's name"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ask your CEO for the exact organization name.
                </p>
              </div>
              <div>
                <Label htmlFor="existingOrgPassword">Organization Password</Label>
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
                  placeholder="Enter the organization password"
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
                  placeholder="e.g., Senior Developer, Marketing Lead"
                />
              </div>
              <div>
                <Label htmlFor="resume">Upload Resume (PDF, Optional)</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10485760) {
                        toast({
                          title: "File too large",
                          description: "Resume must be less than 10MB",
                          variant: "destructive",
                        });
                        e.target.value = '';
                        return;
                      }
                      setResumeFile(file);
                    }
                  }}
                  className="mt-1"
                />
                {resumeFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {resumeFile.name}
                  </p>
                )}
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-gold text-primary-foreground"
            disabled={loading || uploadingResume}
          >
            {(loading || uploadingResume) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {uploadingResume 
              ? "Uploading Resume..." 
              : loading 
                ? "Processing..." 
                : formData.role === "CEO" 
                  ? "Create Organization & Go to Dashboard" 
                  : "Submit for Approval"}
          </Button>
        </form>

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
