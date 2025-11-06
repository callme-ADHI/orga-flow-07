import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";

const MyGroups = () => {
  const groups = [
    { 
      id: 1, 
      name: "Development Team", 
      members: 8, 
      leader: "Sarah Johnson", 
      rank: "Senior",
      members_list: ["John", "Mike", "Emma", "David", "Anna", "Tom", "Lisa", "You"]
    },
    { 
      id: 2, 
      name: "Project Alpha Team", 
      members: 5, 
      leader: "John Doe", 
      rank: "Mid",
      members_list: ["Sarah", "Mike", "You", "Chris", "Alex"]
    },
  ];

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            My Groups
          </h1>
          <p className="text-muted-foreground">View groups you're a member of</p>
        </div>

        <div className="grid gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="bg-gradient-card border-border/50 p-6">
              <div className="flex items-start justify-between mb-6">
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
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Team Leader:</span>
                  <span className="font-medium">{group.leader}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-3">Team Members</p>
                <div className="flex flex-wrap gap-2">
                  {group.members_list.map((member, idx) => (
                    <Avatar key={idx} className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {member.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyGroups;
