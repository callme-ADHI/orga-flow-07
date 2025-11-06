import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Employees = () => {
  const employees = [
    { id: 1, name: "John Smith", role: "Employee", rank: "Senior", email: "john@example.com", tasks: 12 },
    { id: 2, name: "Sarah Johnson", role: "Manager", rank: "Lead", email: "sarah@example.com", tasks: 8 },
    { id: 3, name: "Mike Chen", role: "Employee", rank: "Junior", email: "mike@example.com", tasks: 15 },
    { id: 4, name: "Emma Wilson", role: "Employee", rank: "Mid", email: "emma@example.com", tasks: 10 },
    { id: 5, name: "David Brown", role: "Manager", rank: "Senior", email: "david@example.com", tasks: 6 },
  ];

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            Employees
          </h1>
          <p className="text-muted-foreground">View and manage all organization members</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search employees..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Employee List */}
        <div className="grid gap-4">
          {employees.map((employee) => (
            <Card key={employee.id} className="bg-gradient-card border-border/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {employee.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">{employee.role}</Badge>
                    <p className="text-sm text-muted-foreground">{employee.rank} Level</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{employee.tasks}</p>
                    <p className="text-xs text-muted-foreground">Active Tasks</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Employees;
