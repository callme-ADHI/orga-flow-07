import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FolderKanban } from "lucide-react";
import { useMyGroups } from "@/hooks/useOrgData";

const MyGroups = () => {
  const { groups, loading } = useMyGroups();

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
            My Groups
          </h1>
          <p className="text-muted-foreground">View the groups you belong to</p>
        </div>

        {groups.length === 0 ? (
          <Card className="bg-gradient-card border-border/50 p-12 text-center">
            <FolderKanban className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Groups</h3>
            <p className="text-muted-foreground">You are not a member of any groups yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="bg-gradient-card border-border/50 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{group.group_name}</h3>
                      <p className="text-sm text-muted-foreground">{group.member_count} members</p>
                    </div>
                  </div>
                  {group.group_rank && <Badge variant="outline">Rank {group.group_rank}</Badge>}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Leader:</span>
                  <span className="font-medium">{group.leader_name}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyGroups;
