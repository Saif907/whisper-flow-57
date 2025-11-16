import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, DollarSign, Clock, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFounderCheck } from "@/hooks/useFounderCheck";
import { InternalLayout } from "@/components/InternalLayout";
import { useQuery } from "@tanstack/react-query"; // IMPORTED: For caching

// Interface for what the component needs
interface SystemMetricsData {
    uptime: string;
    avgLatency: number;
    aiRequests: number;
    aiCosts: number;
    latencyData: { time: string, ms: number }[];
    aiCostData: { day: string, cost: number }[];
}

// Function to simulate fetching system metrics (MOCK)
const fetchSystemMetrics = async (roleLoading: boolean, isFounder: boolean): Promise<SystemMetricsData> => {
    if (roleLoading || !isFounder) {
        throw new Error("Access Denied");
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500)); 

    // MOCK DATA (to be replaced by actual backend/monitoring endpoints)
    return {
        uptime: "99.98%",
        avgLatency: 187,
        aiRequests: 2847,
        aiCosts: 123.80,
        latencyData: [
            { time: "00:00", ms: 145 },
            { time: "04:00", ms: 132 },
            { time: "08:00", ms: 189 },
            { time: "12:00", ms: 234 },
            { time: "16:00", ms: 267 },
            { time: "20:00", ms: 198 },
        ],
        aiCostData: [
            { day: "Mon", cost: 12.5 },
            { day: "Tue", cost: 18.3 },
            { day: "Wed", cost: 15.7 },
            { day: "Thu", cost: 21.4 },
            { day: "Fri", cost: 24.8 },
            { day: "Sat", cost: 16.2 },
            { day: "Sun", cost: 14.9 },
        ],
    };
};

export default function SystemMetrics() {
  const { isFounder, loading: roleLoading } = useFounderCheck();

  // 1. Use useQuery to handle fetching, loading, and caching
  const { 
    data: metrics, 
    isLoading, 
    isError 
  } = useQuery<SystemMetricsData>({
    queryKey: ['internal-system-metrics'],
    queryFn: () => fetchSystemMetrics(roleLoading, isFounder),
    enabled: isFounder && !roleLoading,
    staleTime: 60 * 1000, // 1 minute stale time for real-time metrics
    refetchOnWindowFocus: true,
  });

  const currentMetrics = metrics || { 
      uptime: "0%", 
      avgLatency: 0, 
      aiRequests: 0, 
      aiCosts: 0, 
      latencyData: [], 
      aiCostData: [] 
  };


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
             <p className="text-muted-foreground mt-2">Could not retrieve system metrics. This is usually due to permission issues or a backend fault.</p>
          </div>
        </InternalLayout>
      );
  }

  return (
    <InternalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Metrics</h1>
          <p className="text-muted-foreground mt-1">Monitor platform performance and costs</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{currentMetrics.uptime}</div>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.avgLatency}ms</div>
              <p className="text-xs text-muted-foreground mt-1">API response time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.aiRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Costs</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${currentMetrics.aiCosts.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>API Latency (24h)</CardTitle>
              <CardDescription>Average response time throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentMetrics.latencyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="ms" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Model Costs</CardTitle>
              <CardDescription>Daily AI inference costs this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentMetrics.aiCostData}>
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
                  <Line type="monotone" dataKey="cost" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Health Summary</CardTitle>
            <CardDescription>AI-generated infrastructure insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="text-sm">
                ✅ <strong>Excellent uptime</strong> - 99.98% availability maintained with no major incidents
              </p>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="text-sm">
                ⚡ <strong>Peak load periods</strong> - Highest traffic 12PM-4PM IST, consider scaling during
                these hours
              </p>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="text-sm">
                💰 <strong>AI cost efficiency improving</strong> - Cost per request down 8% through
                optimizations
              </p>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="text-sm">
                📊 <strong>Database performance</strong> - Query times under 50ms, no optimization needed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </InternalLayout>
  );
}