import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, AlertCircle, TrendingUp, Copy, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrgData } from "@/hooks/useOrgData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CEODashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { stats, pendingUsers, loading } = useOrgData();
  const [orgInfo, setOrgInfo] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const fetchOrgInfo = async () => {
      if (!profile?.org_id) return;
      
      const { data } = await supabase
        .from("organizations")
        .select("id, org_name")
        .eq("id", profile.org_id)
        .single();
      
      if (data) {
        setOrgInfo({ id: data.id, name: data.org_name });
      }
    };
    
    fetchOrgInfo();
  }, [profile?.org_id]);

  const copyOrgId = () => {
    if (orgInfo?.id) {
      navigator.clipboard.writeText(orgInfo.id);
      toast.success("Organization ID copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            CEO Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {profile?.name}</p>
        </div>

        {/* Organization Info Card */}
        {orgInfo && (
          <Card className="bg-gradient-card border-border/50 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{orgInfo.name}</h2>
                  <p className="text-sm text-muted-foreground">Organization ID: {orgInfo.id.slice(0, 8)}...</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={copyOrgId}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Full ID
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Share this Organization ID with employees so they can join your organization.
            </p>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
                <p className="text-3xl font-bold">{stats.totalEmployees + stats.totalManagers}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Tasks</p>
                <p className="text-3xl font-bold">{stats.activeTasks}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card 
            className="bg-gradient-card border-border/50 p-6 cursor-pointer hover:border-warning/50 transition-colors"
            onClick={() => navigate("/pending-approvals")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Approvals</p>
                <p className="text-3xl font-bold text-warning">{stats.pendingApprovals}</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-success">{stats.completionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Approvals */}
          <Card className="lg:col-span-2 bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Pending Approvals</h2>
              {pendingUsers.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => navigate("/pending-approvals")}>
                  View All
                </Button>
              )}
            </div>
            {pendingUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending approvals</p>
            ) : (
              <div className="space-y-3">
                {pendingUsers.slice(0, 3).map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-4 bg-background/30 rounded-lg">
                    <div>
                      <p className="font-semibold">{person.name}</p>
                      <p className="text-sm text-muted-foreground">{person.email}</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-gradient-gold text-primary-foreground"
                      onClick={() => navigate("/pending-approvals")}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button 
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                onClick={() => navigate("/employees")}
              >
                View All Employees
              </Button>
              <Button 
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                onClick={() => navigate("/all-tasks")}
              >
                View All Tasks
              </Button>
              <Button 
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                onClick={() => navigate("/groups")}
              >
                Manage Groups
              </Button>
              <Button 
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                onClick={() => navigate("/create-task")}
              >
                Create New Task
              </Button>
              <Button 
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                onClick={() => navigate("/settings")}
              >
                Organization Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CEODashboard;
