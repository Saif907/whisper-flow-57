import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// REMOVED: import { supabase } from "@/integrations/supabase/client";
import { Users, MessageSquare, TrendingUp, Zap, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFounderCheck } from "@/hooks/useFounderCheck";
import { InternalLayout } from "@/components/InternalLayout";
import { useQuery } from "@tanstack/react-query"; // IMPORTED
import { internalAPI } from "@/lib/api"; // IMPORTED

// Interface matching the backend's OverviewMetrics model
interface MetricsData {
    totalUsers: number;
    activeUsersWeek: number;
    totalTrades: number;
    totalChats: number;
}

// Function to fetch metrics from the dedicated backend endpoint
const fetchInternalMetrics = async (roleLoading: boolean, isFounder: boolean): Promise<MetricsData> => {
    if (roleLoading || !isFounder) {
        throw new Error("Access Denied");
    }
    // Call the new dedicated, efficient API endpoint
    return internalAPI.getOverviewMetrics();
};


export default function Overview() {
  const { isFounder, loading: roleLoading } = useFounderCheck();

  // 1. Use useQuery to fetch and cache metrics
  const { 
    data: metrics, 
    isLoading, 
    isError
  } = useQuery<MetricsData>({
    queryKey: ['internal-overview-metrics'],
    queryFn: () => fetchInternalMetrics(roleLoading, isFounder),
    enabled: isFounder && !roleLoading,
    staleTime: 60 * 1000, // Cache for 1 minute
    refetchOnWindowFocus: true,
  });

  // Mock Data (Placeholder for charts - these would eventually come from a different API)
  const userGrowth = [
    { date: "Mon", users: 12 },
    { date: "Tue", users: 19 },
    { date: "Wed", users: 25 },
    { date: "Thu", users: 31 },
    { date: "Fri", users: 42 },
    { date: "Sat", users: 38 },
    { date: "Sun", users: 45 },
  ];

  const tradeActivity = [
    { day: "Mon", trades: 34 },
    { day: "Tue", trades: 52 },
    { day: "Wed", trades: 41 },
    { day: "Thu", trades: 67 },
    { day: "Fri", trades: 88 },
  ];
  
  const currentMetrics = metrics || { totalUsers: 0, activeUsersWeek: 0, totalTrades: 0, totalChats: 0 };


  // 2. Consolidate Loading and Error States
  if (roleLoading || isLoading) {
    return (
      <InternalLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </InternalLayout>
    );
  }

  if (!isFounder || isError) {
      return (
        <InternalLayout>
          <div className="text-center py-12">
             <h2 className="text-xl font-bold text-destructive">Access Denied or Data Error</h2>
             <p className="text-muted-foreground mt-2">Could not retrieve platform metrics. This is usually due to permission issues or a backend fault.</p>
          </div>
        </InternalLayout>
      );
  }

  const stats = [
    {
      title: "Total Users",
      value: currentMetrics.totalUsers,
      change: "+12%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Active This Week",
      value: currentMetrics.activeUsersWeek,
      change: "+8%",
      trend: "up",
      icon: Zap,
    },
    {
      title: "Total Trades",
      value: currentMetrics.totalTrades,
      change: "+23%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "AI Sessions",
      value: currentMetrics.totalChats,
      change: "+15%",
      trend: "up",
      icon: MessageSquare,
    },
  ];

  return (
    <InternalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor key metrics and system health</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {stat.trend === "up" ? (
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                    {stat.change}
                  </span>{" "}
                  from last week
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trade Activity</CardTitle>
              <CardDescription>Trades logged per day this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tradeActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="trades" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              AI-Generated Insights
            </CardTitle>
            <CardDescription>Automatic analysis of platform behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="text-sm">
                📈 <strong>User engagement rose 12% this week</strong> - Most active during market hours
                (9:30 AM - 4:00 PM EST)
              </p>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="text-sm">
                💹 <strong>Most traded instruments:</strong> NIFTY and BANKNIFTY account for 68% of all
                trades logged
              </p>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="text-sm">
                🎯 <strong>Trading confidence improving:</strong> Sentiment analysis shows 23% increase in
                positive journal entries
              </p>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="text-sm">
                ⚠️ <strong>Churn risk detected:</strong> 5 users haven't logged trades in 14+ days -
                consider engagement campaign
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </InternalLayout>
  );
}