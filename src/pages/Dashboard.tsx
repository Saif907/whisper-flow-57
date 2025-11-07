import { Library, BookOpen, History, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const stats = [
    {
      icon: Library,
      title: "Total Chats",
      value: "24",
      description: "Conversations saved",
    },
    {
      icon: BookOpen,
      title: "Topics Explored",
      value: "12",
      description: "Different subjects",
    },
    {
      icon: History,
      title: "This Week",
      value: "8",
      description: "New conversations",
    },
    {
      icon: Settings,
      title: "Active Models",
      value: "2",
      description: "AI models in use",
    },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--chat-bg))] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Overview of your activity and saved conversations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-6 bg-[hsl(var(--message-ai-bg))] border-border hover:border-accent transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
                <p className="text-sm font-medium text-foreground">{stat.title}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-[hsl(var(--message-ai-bg))] border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--hover-bg))] transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Chat session completed</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-[hsl(var(--message-ai-bg))] border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Popular Topics</h2>
            <div className="space-y-3">
              {["Code Assistance", "Creative Writing", "Research"].map((topic, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[hsl(var(--hover-bg))] transition-colors"
                >
                  <span className="text-sm text-foreground">{topic}</span>
                  <span className="text-xs text-muted-foreground">{8 - idx * 2} chats</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
