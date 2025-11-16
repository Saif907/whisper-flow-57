import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Info, XCircle, Loader2 } from "lucide-react";
import { useFounderCheck } from "@/hooks/useFounderCheck";
import { InternalLayout } from "@/components/InternalLayout";
import { useQuery } from "@tanstack/react-query"; // IMPORTED: For caching

// Interface for the data being displayed
interface LogEntry {
  id: number;
  timestamp: string;
  level: 'error' | 'info' | 'warning' | 'success';
  message: string;
  source: string;
}

interface LogData {
    logs: LogEntry[];
    errors24h: number;
    warnings24h: number;
    infoEvents: number;
    successRate: string;
}

// Function to simulate fetching logs (MOCK)
const fetchInternalLogs = async (roleLoading: boolean, isFounder: boolean): Promise<LogData> => {
    if (roleLoading || !isFounder) {
        throw new Error("Access Denied");
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600)); 

    // MOCK DATA (to be replaced by actual backend/monitoring endpoints)
    const mockLogs: LogEntry[] = [
        {
            id: 1,
            timestamp: "2024-01-15 14:32:18",
            level: "error",
            message: "Failed to process AI request for user ID: 8f3a2...",
            source: "AI Service",
        },
        {
            id: 2,
            timestamp: "2024-01-15 14:28:45",
            level: "info",
            message: "New user signup: user@example.com",
            source: "Auth Service",
        },
        {
            id: 3,
            timestamp: "2024-01-15 14:15:03",
            level: "warning",
            message: "High latency detected in database queries (avg 450ms)",
            source: "Database",
        },
        {
            id: 4,
            timestamp: "2024-01-15 13:52:21",
            level: "success",
            message: "Backup completed successfully",
            source: "System",
        },
        {
            id: 5,
            timestamp: "2024-01-15 13:45:12",
            level: "error",
            message: "Payment processing failed for subscription renewal",
            source: "Billing",
        },
        {
            id: 6,
            timestamp: "2024-01-15 13:30:08",
            level: "info",
            message: "Deployment completed: v2.3.1",
            source: "System",
        },
        {
            id: 7,
            timestamp: "2024-01-15 12:18:45",
            level: "warning",
            message: "Rate limit approaching for user ID: 2b9c1...",
            source: "API Gateway",
        },
        {
            id: 8,
            timestamp: "2024-01-15 11:42:33",
            level: "success",
            message: "Email digest sent to 87 users",
            source: "Email Service",
        },
    ];

    return {
        logs: mockLogs,
        errors24h: 12,
        warnings24h: 34,
        infoEvents: 487,
        successRate: "99.2%",
    };
};


export default function Logs() {
  const { isFounder, loading: roleLoading } = useFounderCheck();

  // 1. Use useQuery to handle fetching, loading, and caching
  const { 
    data: logData, 
    isLoading, 
    isError 
  } = useQuery<LogData>({
    queryKey: ['internal-logs'],
    queryFn: () => fetchInternalLogs(roleLoading, isFounder),
    enabled: isFounder && !roleLoading,
    staleTime: 15 * 1000, // Shorter cache time for logs (15 seconds)
    refetchOnWindowFocus: true,
  });
  
  const logs = logData?.logs || [];
  const currentMetrics = logData || { errors24h: 0, warnings24h: 0, infoEvents: 0, successRate: "0%" };


  const getLogIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogBadge = (level: string) => {
    const variants: any = {
      error: "destructive",
      warning: "outline",
      success: "default",
      info: "secondary",
    };
    return variants[level] || "secondary";
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
             <p className="text-muted-foreground mt-2">Could not retrieve system logs. This is usually due to permission issues or a backend fault.</p>
          </div>
        </InternalLayout>
      );
  }

  return (
    <InternalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Logs</h1>
          <p className="text-muted-foreground mt-1">Monitor errors, events, and platform activity</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors (24h)</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.errors24h}</div>
              <p className="text-xs text-muted-foreground mt-1">Down from 18 yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings (24h)</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.warnings24h}</div>
              <p className="text-xs text-muted-foreground mt-1">Mostly performance alerts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Info Events</CardTitle>
              <Info className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.infoEvents}</div>
              <p className="text-xs text-muted-foreground mt-1">Standard activity logs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{currentMetrics.successRate}</div>
              <p className="text-xs text-muted-foreground mt-1">API success rate</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
            <CardDescription>Latest system events and errors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{getLogIcon(log.level)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {log.timestamp}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getLogBadge(log.level)}>{log.level}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">{log.message}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.source}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </InternalLayout>
  );
}