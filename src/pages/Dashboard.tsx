import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, BarChart3, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      const { data } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setChats(
          data.map((chat) => ({
            id: chat.id,
            title: chat.title,
            timestamp: new Date(chat.created_at),
          }))
        );
      }
    };

    loadChats();
  }, [user]);

  const stats = [
    {
      icon: DollarSign,
      title: "Total P&L",
      value: "+$4,250",
      description: "Overall profit",
      trend: "up",
      percentage: "+12.5%",
    },
    {
      icon: Target,
      title: "Win Rate",
      value: "68%",
      description: "Successful trades",
      trend: "up",
      percentage: "+5%",
    },
    {
      icon: BarChart3,
      title: "Trades Logged",
      value: "47",
      description: "Total positions",
      trend: "neutral",
      percentage: "This month",
    },
    {
      icon: Calendar,
      title: "Active Days",
      value: "18",
      description: "Trading days",
      trend: "neutral",
      percentage: "This month",
    },
  ];

  const recentTrades = [
    { symbol: "AAPL", action: "Sold", profit: "+$245", positive: true, date: "2 hours ago" },
    { symbol: "TSLA", action: "Bought", profit: "-$120", positive: false, date: "5 hours ago" },
    { symbol: "GOOGL", action: "Sold", profit: "+$380", positive: true, date: "Yesterday" },
  ];

  return (
    <Layout
      sidebarOpen={sidebarOpen}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      chats={chats}
      activeChat={null}
      onChatSelect={() => {}}
      onNewChat={() => {}}
    >
      <div className="min-h-screen bg-[hsl(var(--chat-bg))] p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold text-foreground">Trading Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Track your performance and analyze your trading journey
              </p>
            </div>
            <Link to="/chat">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Back to Journal
              </Button>
            </Link>
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
                  {stat.trend === "up" && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      {stat.percentage}
                    </span>
                  )}
                  {stat.trend === "down" && (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <ArrowDownRight className="h-3 w-3" />
                      {stat.percentage}
                    </span>
                  )}
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Recent Trades</h2>
                <Link to="/trades">
                  <Button variant="ghost" size="sm" className="text-accent hover:text-accent/90">
                    View All →
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentTrades.map((trade, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--hover-bg))] transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      trade.positive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {trade.positive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{trade.symbol}</p>
                        <p className={`text-sm font-semibold ${
                          trade.positive ? "text-green-400" : "text-red-400"
                        }`}>
                          {trade.profit}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{trade.action}</p>
                        <p className="text-xs text-muted-foreground">{trade.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-[hsl(var(--message-ai-bg))] border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Trading Insights</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[hsl(var(--hover-bg))]">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-1">Best Performing</p>
                      <p className="text-xs text-muted-foreground">Tech stocks showing strong momentum this week</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-[hsl(var(--hover-bg))]">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent">
                      <Target className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-1">Strategy Tip</p>
                      <p className="text-xs text-muted-foreground">Consider setting stop-losses at 2% below entry</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[hsl(var(--hover-bg))]">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-1">Upcoming Events</p>
                      <p className="text-xs text-muted-foreground">Fed meeting next week - watch market volatility</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
