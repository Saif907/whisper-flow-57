// src/pages/internal/Users.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// REMOVED: import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2 } from "lucide-react";
import { useFounderCheck } from "@/hooks/useFounderCheck";
import { InternalLayout } from "@/components/InternalLayout";
import { useQuery } from "@tanstack/react-query";
import { internalAPI } from "@/lib/api"; // IMPORTED: New internal API

// Interface matching the backend's UserDataInternal model (Efficient API response)
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

export default function Users() {
  const { isFounder, loading: roleLoading } = useFounderCheck();
  const [search, setSearch] = useState("");
  
  // 1. Use useQuery to call the new efficient backend endpoint
  const { data: users, isLoading, isError } = useQuery<UserData[]>({
    queryKey: ['internal-users'],
    queryFn: internalAPI.getUsers, // CALLING THE NEW EFFICIENT API
    // Only run the query if permissions are verified, otherwise the API will return 403 anyway
    enabled: isFounder && !roleLoading, 
    staleTime: 60 * 1000, 
    refetchOnWindowFocus: true,
  });

  const allUsers = users || [];

  const filteredUsers = allUsers.filter((user) => {
    const searchLower = search.toLowerCase();
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
             <p className="text-muted-foreground mt-2">
                Could not retrieve internal user data. 
                {isError ? "This is usually due to a backend fault or network issue." : "Please ensure your user ID has the 'founder' role."}
             </p>
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