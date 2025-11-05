import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    additionalInfo: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type (PDF or images)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a PDF or image file");
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Please enter your name");
      return;
    }

    if (!resumeFile) {
      toast.error("Please upload your resume");
      return;
    }

    const orgData = sessionStorage.getItem("pendingOrg");
    if (!orgData) {
      toast.error("Organization data missing");
      navigate("/auth");
      return;
    }

    const { orgName, orgPassword, action } = JSON.parse(orgData);

    setLoading(true);

    try {
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(orgPassword, 10);

      let orgId: string;

      if (action === "create") {
        // Create organization
        const { data: newOrg, error: orgError } = await supabase
          .from("organizations")
          .insert({
            org_name: orgName,
            org_password: hashedPassword,
            created_by: user?.id,
          })
          .select()
          .single();

        if (orgError) {
          throw orgError;
        }

        orgId = newOrg.id;
      } else {
        // Join existing organization
        const { data: existingOrg, error: orgError } = await supabase
          .from("organizations")
          .select("*")
          .eq("org_name", orgName)
          .single();

        if (orgError || !existingOrg) {
          toast.error("Organization not found");
          setLoading(false);
          return;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(orgPassword, existingOrg.org_password);
        if (!passwordMatch) {
          toast.error("Incorrect password");
          setLoading(false);
          return;
        }

        orgId = existingOrg.id;
      }

      // Upload resume
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, resumeFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("resumes")
        .getPublicUrl(fileName);

      // Create profile
      const role = action === "create" ? "CEO" : "Employee";
      
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: user?.id,
          org_id: orgId,
          name: formData.name,
          email: user?.email || "",
          role,
          approved: action === "create", // Auto-approve CEO
          resume_url: publicUrl,
        });

      if (profileError) {
        throw profileError;
      }

      sessionStorage.removeItem("pendingOrg");
      await refreshProfile();

      if (action === "create") {
        toast.success("Organization created successfully!");
        navigate("/ceo-dashboard");
      } else {
        toast.success("Profile submitted for approval!");
        navigate("/pending-approval");
      }
    } catch (error: any) {
      console.error("Profile completion error:", error);
      toast.error(error.message || "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-gradient-card border-border/50 p-8 shadow-elevated">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-gold rounded-xl flex items-center justify-center shadow-gold">
              <UserCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Provide your details to proceed
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Tell us about yourself"
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                className="bg-background/50 border-border/50 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Upload Resume (PDF or Image) *</Label>
              <div className="relative">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="bg-background/50 border-border/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {resumeFile && (
                  <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {resumeFile.name}
                  </p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-gold text-primary-foreground font-semibold hover:shadow-gold"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Profile"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
