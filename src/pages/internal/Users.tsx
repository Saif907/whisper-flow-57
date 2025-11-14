import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2 } from "lucide-react";
import { useFounderCheck } from "@/hooks/useFounderCheck";
import { InternalLayout } from "@/components/InternalLayout";
import { useQuery } from "@tanstack/react-query"; // IMPORTED: For caching and robust fetching

// Interface for what the client fetches and combines
interface UserData {
  id: string;
  pseudonymous_id: string;
  consent_given: boolean;
  consent_date: string | null;
  created_at: string;
  updated_at: string;
  trades_count: number;
  chats_count: number;
}

// Function that handles the complex fetching logic for useQuery
const fetchInternalUsers = async (roleLoading: boolean, isFounder: boolean): Promise<UserData[]> => {
    // SECURITY CHECK: This request uses the client's token. 
    // RLS policies must allow founder to view all profiles, trades, and chats.
    if (roleLoading || !isFounder) return [];

    try {
      const { data: profiles, error } = await supabase
          .from("profiles")
          .select("*") 
          .order("created_at", { ascending: false });

      if (error) {
          console.error("Error fetching profiles:", error);
          throw new Error(error.message || "Failed to fetch user profiles");
      }

      // WARNING: This section is an inefficient N+1 query.
      // We process it here for functionality, but it is the biggest performance bottleneck.
      const usersWithCounts = await Promise.all(
          (profiles || []).map(async (profile: any) => {
              
              const { count: tradesCount } = await supabase
                  .from("trades")
                  .select("*", { count: "exact", head: true })
                  .eq("user_id", profile.id);

              const { count: chatsCount } = await supabase
                  .from("chats")
                  .select("*", { count: "exact", head: true })
                  .eq("user_id", profile.id);

              return {
                  ...profile,
                  trades_count: tradesCount || 0,
                  chats_count: chatsCount || 0,
              } as UserData;
          })
      );
      
      return usersWithCounts;
    } catch (error) {
        throw new Error(`Failed to fetch user data: ${error instanceof Error ? error.message : String(error)}`);
    }
};


export default function Users() {
  const { isFounder, loading: roleLoading } = useFounderCheck();
  const [search, setSearch] = useState("");
  
  // 1. Use useQuery for caching and automatic re-fetching
  const { data: users, isLoading, isError } = useQuery<UserData[]>({
    queryKey: ['internal-users'],
    queryFn: () => fetchInternalUsers(roleLoading, isFounder),
    // Only run the query if permissions are verified
    enabled: isFounder && !roleLoading, 
    // Aggressive caching policy for administrative data
    staleTime: 60 * 1000, // 1 minute stale time (smooth functioning)
    refetchOnWindowFocus: true,
  });

  const allUsers = users || [];

  const filteredUsers = allUsers.filter((user) => {
    const searchLower = search.toLowerCase();
    // Only search by pseudonymous_id, as per the existing component logic
    return user.pseudonymous_id?.toLowerCase().includes(searchLower);
  });

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
             <p className="text-muted-foreground mt-2">Could not retrieve internal user data. This is usually due to permission issues or a backend fault.</p>
          </div>
        </InternalLayout>
      );
  }


  return (
    <InternalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">
            View and analyze all registered users on the platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
            <CardDescription>
              {allUsers.length} total users • Search by pseudonymous ID
            </CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pseudonymous ID</TableHead>
                    <TableHead>Consent</TableHead>
                    <TableHead className="text-center">Trades</TableHead>
                    <TableHead className="text-center">Sessions</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const isActive = new Date(user.updated_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
                    const shortId = user.pseudonymous_id.slice(0, 8);
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {shortId[0].toUpperCase()}
                              </span>
                            </div>
                            <span className="font-mono text-sm">{shortId}...</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.consent_given ? "default" : "destructive"}>
                            {user.consent_given ? "Granted" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {user.trades_count}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {user.chats_count}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </InternalLayout>
  );
}