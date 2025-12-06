import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Search, User, ClipboardList, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentItem {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  profile_name: string;
  profile_id: string;
  type: "resume" | "task_file" | "complaint";
  task_title?: string;
  complaint_subject?: string;
}

const Documents = () => {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (profile?.org_id) {
      fetchAllDocuments();
    }
  }, [profile?.org_id]);

  const fetchAllDocuments = async () => {
    if (!profile?.org_id) return;
    setLoading(true);

    try {
      // Fetch resumes from profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name, resume_url")
        .eq("org_id", profile.org_id)
        .not("resume_url", "is", null);

      const resumeDocs: DocumentItem[] = (profilesData || []).map((p) => ({
        id: `resume-${p.id}`,
        file_name: `${p.name}_resume.pdf`,
        file_url: p.resume_url || "",
        uploaded_at: "",
        profile_name: p.name,
        profile_id: p.id,
        type: "resume" as const,
      }));

      // Fetch task files
      const { data: taskFilesData } = await supabase
        .from("task_files")
        .select(`
          id,
          file_name,
          file_url,
          uploaded_at,
          profile_id,
          task_id,
          profiles:profile_id (name),
          tasks:task_id (title, org_id)
        `)
        .order("uploaded_at", { ascending: false });

      const taskDocs: DocumentItem[] = (taskFilesData || [])
        .filter((tf: any) => tf.tasks?.org_id === profile.org_id)
        .map((tf: any) => ({
          id: tf.id,
          file_name: tf.file_name,
          file_url: tf.file_url,
          uploaded_at: tf.uploaded_at || "",
          profile_name: tf.profiles?.name || "Unknown",
          profile_id: tf.profile_id,
          type: "task_file" as const,
          task_title: tf.tasks?.title || "Unknown Task",
        }));

      // Fetch complaints
      const { data: complaintsData } = await supabase
        .from("complaints")
        .select(`
          id,
          subject,
          description,
          status,
          created_at,
          submitted_by,
          profiles:submitted_by (name)
        `)
        .eq("org_id", profile.org_id)
        .order("created_at", { ascending: false });

      const complaintDocs: DocumentItem[] = (complaintsData || []).map((c: any) => ({
        id: `complaint-${c.id}`,
        file_name: c.subject,
        file_url: "",
        uploaded_at: c.created_at || "",
        profile_name: c.profiles?.name || "Unknown",
        profile_id: c.submitted_by,
        type: "complaint" as const,
        complaint_subject: c.subject,
      }));

      setDocuments([...resumeDocs, ...taskDocs, ...complaintDocs]);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.profile_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "resumes") return matchesSearch && doc.type === "resume";
    if (activeTab === "task_files") return matchesSearch && doc.type === "task_file";
    if (activeTab === "complaints") return matchesSearch && doc.type === "complaint";
    return matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    if (type === "resume") return <User className="w-4 h-4" />;
    if (type === "task_file") return <ClipboardList className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getTypeBadge = (type: string) => {
    if (type === "resume") return <Badge className="bg-primary/10 text-primary">Resume</Badge>;
    if (type === "task_file") return <Badge className="bg-success/10 text-success">Task Document</Badge>;
    return <Badge className="bg-amber-500/10 text-amber-500">Complaint</Badge>;
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            Documents
          </h1>
          <p className="text-muted-foreground">View all documents, resumes, and complaints</p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({documents.length})</TabsTrigger>
            <TabsTrigger value="resumes">
              Resumes ({documents.filter(d => d.type === "resume").length})
            </TabsTrigger>
            <TabsTrigger value="task_files">
              Task Docs ({documents.filter(d => d.type === "task_file").length})
            </TabsTrigger>
            <TabsTrigger value="complaints">
              Complaints ({documents.filter(d => d.type === "complaint").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredDocuments.length === 0 ? (
              <Card className="bg-gradient-card border-border/50 p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Documents Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "No documents match your search" : "No documents uploaded yet"}
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="bg-gradient-card border-border/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate mb-1">{doc.file_name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          From: {doc.profile_name}
                        </p>
                        {doc.task_title && (
                          <p className="text-xs text-muted-foreground mb-2">
                            Task: {doc.task_title}
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          {getTypeBadge(doc.type)}
                          {doc.file_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc.file_url, "_blank")}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                        {doc.uploaded_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Documents;