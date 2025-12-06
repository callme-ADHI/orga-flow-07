import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, Plus, CheckCircle, Clock, Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Complaint {
  id: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  submitted_by: string;
  resolved_by: string | null;
  submitter_name?: string;
  resolver_name?: string;
}

const Complaints = () => {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const isCEO = profile?.role === "CEO";
  const isManager = profile?.role === "Manager";
  const isManagerOrCEO = isCEO || isManager;

  useEffect(() => {
    if (profile?.org_id) {
      fetchComplaints();
    }
  }, [profile?.org_id]);

  const fetchComplaints = async () => {
    if (!profile?.org_id) return;
    setLoading(true);

    try {
      // Build query based on role
      // For employees: RLS already filters to only their own complaints
      // For managers/CEO: RLS allows viewing all in org
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          submitter:submitted_by (name),
          resolver:resolved_by (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedComplaints: Complaint[] = (data || []).map((c: any) => ({
        id: c.id,
        subject: c.subject,
        description: c.description,
        status: c.status,
        created_at: c.created_at,
        resolved_at: c.resolved_at,
        submitted_by: c.submitted_by,
        resolved_by: c.resolved_by,
        // CEO can see submitter name, Manager cannot, Employee sees their own
        submitter_name: isCEO ? (c.submitter?.name || "Unknown") : 
                        isManager ? "Anonymous" : 
                        (c.submitter?.name || "You"),
        resolver_name: c.resolver?.name || null,
      }));

      setComplaints(formattedComplaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!profile?.id || !profile?.org_id || !subject.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("complaints").insert({
        org_id: profile.org_id,
        submitted_by: profile.id,
        subject: subject.trim(),
        description: description.trim(),
        status: "pending",
      });

      if (error) throw error;

      toast.success("Complaint submitted successfully");
      setSubject("");
      setDescription("");
      setDialogOpen(false);
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (complaintId: string) => {
    if (!profile?.id) return;

    setResolvingId(complaintId);
    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          status: "resolved",
          resolved_by: profile.id,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", complaintId);

      if (error) throw error;

      toast.success("Complaint marked as resolved");
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.message || "Failed to resolve complaint");
    } finally {
      setResolvingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "resolved") {
      return <Badge className="bg-success/10 text-success">Resolved</Badge>;
    }
    return <Badge className="bg-amber-500/10 text-amber-500">Pending</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
              Complaints
            </h1>
            <p className="text-muted-foreground">
              {isCEO ? "View and manage all complaints from employees" : 
               isManager ? "View and manage anonymous complaints" : 
               "Submit and track your complaints"}
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Complaint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit a Complaint</DialogTitle>
                <DialogDescription>
                  Your complaint will be reviewed by management.
                  {isManager && " Managers cannot see who submitted complaints."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief summary of your complaint"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your complaint..."
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Complaint
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {complaints.length === 0 ? (
          <Card className="bg-gradient-card border-border/50 p-12 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Complaints</h3>
            <p className="text-muted-foreground">
              {isManagerOrCEO ? "No complaints have been submitted yet" : "You haven't submitted any complaints yet"}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint) => (
              <Card key={complaint.id} className="bg-gradient-card border-border/50 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{complaint.subject}</h3>
                      {getStatusBadge(complaint.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{complaint.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      {/* Show submitter info - CEO sees name, Manager sees "Anonymous", Employee sees "You" */}
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>From: {complaint.submitter_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                      </div>
                      {complaint.resolver_name && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>Resolved by: {complaint.resolver_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isManagerOrCEO && complaint.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolve(complaint.id)}
                      disabled={resolvingId === complaint.id}
                    >
                      {resolvingId === complaint.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Resolved
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Complaints;