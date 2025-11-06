import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertCircle, Info } from "lucide-react";

const Notifications = () => {
  const notifications = [
    { id: 1, type: "task", title: "New Task Assigned", message: "You have been assigned to 'Complete Project Documentation'", time: "2 hours ago", read: false },
    { id: 2, type: "success", title: "Task Completed", message: "Your task 'Review Code Changes' was marked as complete", time: "5 hours ago", read: false },
    { id: 3, type: "warning", title: "Deadline Approaching", message: "Task 'Deploy to Production' is due in 2 days", time: "1 day ago", read: true },
    { id: 4, type: "info", title: "Team Update", message: "New member joined Development Team", time: "2 days ago", read: true },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "task": return <Bell className="w-5 h-5 text-primary" />;
      case "success": return <CheckCircle className="w-5 h-5 text-success" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-warning" />;
      case "info": return <Info className="w-5 h-5 text-primary" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-muted-foreground">Stay updated with your activity</p>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`bg-gradient-card border-border/50 p-6 ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {!notification.read && <Badge variant="default" className="ml-2">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
