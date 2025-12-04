import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertCircle, Info, UserPlus, ClipboardList, Check } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case "task_assigned": return <ClipboardList className="w-5 h-5 text-primary" />;
      case "task_completed": return <CheckCircle className="w-5 h-5 text-success" />;
      case "task_overdue": return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "member_approved": return <UserPlus className="w-5 h-5 text-success" />;
      case "pending_approval": return <UserPlus className="w-5 h-5 text-warning" />;
      case "deadline_approaching": return <AlertCircle className="w-5 h-5 text-warning" />;
      default: return <Bell className="w-5 h-5 text-primary" />;
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
              Notifications
            </h1>
            <p className="text-muted-foreground">Stay updated with your activity</p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <Check className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="bg-gradient-card border-border/50 p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
            <p className="text-muted-foreground">You're all caught up!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`bg-gradient-card border-border/50 p-6 cursor-pointer transition-colors ${!notification.read ? 'border-l-4 border-l-primary hover:bg-primary/5' : 'hover:bg-muted/50'}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.read && (
                        <Badge variant="default" className="ml-2">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
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

export default Notifications;
