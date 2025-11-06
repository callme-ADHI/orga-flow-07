import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";

const Groups = () => {
  const groups = [
    { id: 1, name: "Development Team", members: 8, leader: "Sarah Johnson", rank: "Senior" },
    { id: 2, name: "Marketing Team", members: 5, leader: "John Doe", rank: "Mid" },
    { id: 3, name: "Design Team", members: 4, leader: "Emma Wilson", rank: "Senior" },
    { id: 4, name: "Sales Team", members: 6, leader: "Mike Chen", rank: "Lead" },
  ];

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
              Groups
            </h1>
            <p className="text-muted-foreground">Manage team groups and assignments</p>
          </div>
          <Button className="bg-gradient-gold text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="bg-gradient-card border-border/50 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">{group.members} members</p>
                  </div>
                </div>
                <Badge variant="outline">{group.rank}</Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Leader:</span>
                  <span className="font-medium">{group.leader}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Members
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit Group
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Groups;
