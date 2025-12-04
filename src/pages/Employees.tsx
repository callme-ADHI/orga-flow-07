import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Search, FileText, Edit2, Loader2 } from "lucide-react";
import { useOrgData } from "@/hooks/useOrgData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Employees = () => {
  const { employees, loading, refreshData } = useOrgData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterRank, setFilterRank] = useState<string>("all");
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [newRank, setNewRank] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || emp.role === filterRole;
    const matchesRank = filterRank === "all" || emp.rank === filterRank;
    return matchesSearch && matchesRole && matchesRank;
  });

  const handleUpdateRank = async (employeeId: string) => {
    if (!newRank) {
      toast.error("Please select a rank");
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ rank: newRank })
        .eq("id", employeeId);

      if (error) throw error;

      toast.success("Rank updated successfully");
      setEditingEmployee(null);
      setNewRank("");
      refreshData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update rank");
    } finally {
      setUpdating(false);
    }
  };

  const getRankColor = (rank: string | null) => {
    switch (rank) {
      case "S": return "bg-gradient-gold text-primary-foreground";
      case "A": return "bg-success/20 text-success";
      case "B": return "bg-primary/20 text-primary";
      case "C": return "bg-muted text-muted-foreground";
      case "D": return "bg-warning/20 text-warning";
      case "E": return "bg-destructive/20 text-destructive";
      default: return "bg-muted text-muted-foreground";
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            Employees
          </h1>
          <p className="text-muted-foreground">Manage your organization's team members</p>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-card border-border/50 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="CEO">CEO</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRank} onValueChange={setFilterRank}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranks</SelectItem>
                <SelectItem value="S">S - Highest</SelectItem>
                <SelectItem value="A">A - High</SelectItem>
                <SelectItem value="B">B - Above Avg</SelectItem>
                <SelectItem value="C">C - Average</SelectItem>
                <SelectItem value="D">D - Below Avg</SelectItem>
                <SelectItem value="E">E - Lowest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Employee List */}
        {filteredEmployees.length === 0 ? (
          <Card className="bg-gradient-card border-border/50 p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Employees Found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="bg-gradient-card border-border/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {employee.custom_id || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {employee.role}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Badge className={getRankColor(employee.rank)}>
                          Rank: {employee.rank || "N/A"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {employee.resume_url && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(employee.resume_url!, "_blank")}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      )}
                      <Dialog open={editingEmployee === employee.id} onOpenChange={(open) => {
                        if (open) {
                          setEditingEmployee(employee.id);
                          setNewRank(employee.rank || "C");
                        } else {
                          setEditingEmployee(null);
                          setNewRank("");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Rank for {employee.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Select New Rank
                              </label>
                              <Select value={newRank} onValueChange={setNewRank}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="S">S - Highest</SelectItem>
                                  <SelectItem value="A">A - High</SelectItem>
                                  <SelectItem value="B">B - Above Average</SelectItem>
                                  <SelectItem value="C">C - Average</SelectItem>
                                  <SelectItem value="D">D - Below Average</SelectItem>
                                  <SelectItem value="E">E - Lowest</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              className="w-full" 
                              onClick={() => handleUpdateRank(employee.id)}
                              disabled={updating}
                            >
                              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Update Rank
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Employees;
