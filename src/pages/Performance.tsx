import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Clock, Award } from "lucide-react";

const Performance = () => {
  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            My Performance
          </h1>
          <p className="text-muted-foreground">Track your achievements and progress</p>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-primary" />
              <Badge variant="outline">Excellent</Badge>
            </div>
            <p className="text-2xl font-bold mb-1">96%</p>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-success" />
            </div>
            <p className="text-2xl font-bold mb-1">42</p>
            <p className="text-sm text-muted-foreground">Tasks Completed</p>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-warning" />
            </div>
            <p className="text-2xl font-bold mb-1">2.8 days</p>
            <p className="text-sm text-muted-foreground">Avg. Completion Time</p>
          </Card>

          <Card className="bg-gradient-card border-border/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <p className="text-2xl font-bold mb-1">0</p>
            <p className="text-sm text-muted-foreground">Black Marks</p>
          </Card>
        </div>

        {/* Skills Progress */}
        <Card className="bg-gradient-card border-border/50 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Skills Assessment</h2>
          <div className="space-y-4">
            {[
              { skill: "Task Completion", level: 96 },
              { skill: "Quality of Work", level: 92 },
              { skill: "Time Management", level: 88 },
              { skill: "Team Collaboration", level: 94 },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.skill}</span>
                  <span className="text-sm text-muted-foreground">{item.level}%</span>
                </div>
                <Progress value={item.level} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Achievements */}
        <Card className="bg-gradient-card border-border/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Achievements</h2>
          <div className="space-y-3">
            {[
              { title: "Fast Finisher", description: "Completed 10 tasks ahead of schedule", date: "Nov 1, 2025" },
              { title: "Quality Champion", description: "Maintained 95%+ quality rating for 3 months", date: "Oct 28, 2025" },
              { title: "Team Player", description: "Helped 5 colleagues with their tasks", date: "Oct 15, 2025" },
            ].map((achievement, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-background/30 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{achievement.description}</p>
                  <p className="text-xs text-muted-foreground">{achievement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Performance;
