import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, CreditCard, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useFounderCheck } from "@/hooks/useFounderCheck";
import { InternalLayout } from "@/components/InternalLayout";
import { useQuery } from "@tanstack/react-query"; // IMPORTED: For caching and robust fetching
import { supabase } from "@/integrations/supabase/client"; // IMPORTED: To fetch data

// Interface for what the component needs
interface BillingData {
  monthlyRevenue: number;
  paidUsers: number;
  avgRevenuePerUser: number;
  churnRate: number;
}

// Function to fetch and process data for caching
// NOTE: This currently uses mock data. Replace with real API calls when ready.
const fetchInternalBilling = async (roleLoading: boolean, isFounder: boolean): Promise<BillingData> => {
    if (roleLoading || !isFounder) {
        return { monthlyRevenue: 0, paidUsers: 0, avgRevenuePerUser: 0, churnRate: 0 };
    }

    // --- MOCK DATA ---
    // In a real application, you would replace this with API calls to your
    // backend, which would then fetch data from Supabase or Stripe.
    // We use a short delay to simulate a network request.
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    // Example (if you had this data in Supabase):
    // const { count: paidUsersCount } = await supabase.from("profiles").select("*", { count: "exact" }).eq("plan", "pro");
    // const { data: revenue } = await supabase.rpc("calculate_mrr");
    
    return {
        monthlyRevenue: 42580,
        paidUsers: 32,
        avgRevenuePerUser: 1330,
        churnRate: 4.2,
    };
    // --- END MOCK DATA ---
};


export default function Billing() {
  const { isFounder, loading: roleLoading } = useFounderCheck();

  // 1. Use useQuery to handle fetching, loading, and caching
  const { 
    data: billingData, 
    isLoading, 
    isError 
  } = useQuery<BillingData>({
      queryKey: ['internal-billing'],
      queryFn: () => fetchInternalBilling(roleLoading, isFounder),
      enabled: isFounder && !roleLoading,
      staleTime: 60 * 1000 * 5, // 5 minutes stale time (smooth functioning)
      refetchOnWindowFocus: true,
  });

  const currentMetrics = billingData || { monthlyRevenue: 0, paidUsers: 0, avgRevenuePerUser: 0, churnRate: 0 };

  // Placeholder data for charts
  const planDistribution = [
    { name: "Free", value: 68, color: "hsl(var(--chart-1))" },
    { name: "Pro", value: 24, color: "hsl(var(--primary))" },
    { name: "Team", value: 8, color: "hsl(var(--chart-3))" },
  ];

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
             <p className="text-muted-foreground mt-2">Could not retrieve billing data. This is usually due to permission issues or a backend fault.</p>
          </div>
        </InternalLayout>
      );
  }

  return (
    <InternalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Plans</h1>
          <p className="text-muted-foreground mt-1">Revenue tracking and subscription analytics</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{currentMetrics.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-green-500 mt-1">+18% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.paidUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">32% conversion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Revenue/User</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{currentMetrics.avgRevenuePerUser.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Per paid user</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.churnRate}%</div>
              <p className="text-xs text-green-500 mt-1">-1.3% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>Current subscription breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upgrade Opportunities</CardTitle>
              <CardDescription>Users likely to upgrade based on AI analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-card rounded-lg border border-border">
                <p className="text-sm font-semibold">High Activity Free Users</p>
                <p className="text-xs text-muted-foreground mt-1">
                  12 users logging 30+ trades/month on free plan
                </p>
                <p className="text-xs text-primary mt-1">Conversion potential: High</p>
              </div>
              <div className="p-3 bg-card rounded-lg border border-border">
                <p className="text-sm font-semibold">Pro Users Using Team Features</p>
                <p className="text-xs text-muted-foreground mt-1">
                  5 Pro users showing collaboration behavior patterns
                </p>
                <p className="text-xs text-primary mt-1">Upsell potential: Medium</p>
              </div>
              <div className="p-3 bg-card rounded-lg border border-border">
                <p className="text-sm font-semibold">Approaching Limits</p>
                <p className="text-xs text-muted-foreground mt-1">
                  8 free users at 45+ trades (near 50 trade limit)
                </p>
                <p className="text-xs text-primary mt-1">Timing: Excellent</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Insights</CardTitle>
            <CardDescription>AI-generated financial analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="text-sm">
                📈 <strong>Revenue growth accelerating</strong> - 18% MoM growth driven by Pro plan
                conversions
              </p>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="text-sm">
                🎯 <strong>Low churn rate</strong> - 4.2% churn is excellent, indicates strong product-market
                fit
              </p>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="text-sm">
                💰 <strong>Optimize Team plan</strong> - Only 8% adoption, consider pricing or feature
                adjustments
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </InternalLayout>
  );
}