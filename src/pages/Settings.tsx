import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Profile Settings */}
          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={profile?.name} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={profile?.email} disabled className="mt-1" />
              </div>
              <div>
                <Label htmlFor="rank">Rank</Label>
                <Input id="rank" defaultValue={profile?.rank || "N/A"} className="mt-1" />
              </div>
              <Button className="bg-gradient-gold text-primary-foreground">
                Save Changes
              </Button>
            </div>
          </Card>

          {/* Notification Preferences */}
          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Task Assignments</p>
                  <p className="text-sm text-muted-foreground">Get notified when tasks are assigned to you</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Deadline Reminders</p>
                  <p className="text-sm text-muted-foreground">Receive reminders before task deadlines</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Team Updates</p>
                  <p className="text-sm text-muted-foreground">Stay informed about team activities</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="bg-gradient-card border-border/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Security</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" className="mt-1" />
              </div>
              <Button variant="outline">
                Change Password
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
