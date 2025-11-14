import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Loader2 } from "lucide-react";
import { useFounderCheck } from "@/hooks/useFounderCheck";
import { InternalLayout } from "@/components/InternalLayout";
import { useQuery } from "@tanstack/react-query"; // IMPORTED: For caching and robust fetching

// Interface for what the client fetches and combines
interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  user_email: string;
  message_count: number;
}

// Function that handles the complex fetching logic for useQuery
const fetchChatSessions = async (roleLoading: boolean, isFounder: boolean): Promise<ChatSession[]> => {
    // SECURITY CHECK: This request uses the client's token. 
    // RLS policies must allow founder to view all chats and messages.
    if (roleLoading || !isFounder) return [];

    try {
      // Step 1: Fetch Chats and related Profiles (assuming RLS allows founder via policy)
      const { data: chats, error: chatsError } = await supabase
          .from("chats")
          // The select here implicitly requests all columns from 'chats' and the 'email' from the joined 'profiles'
          .select("*, profiles(email)") 
          .order("created_at", { ascending: false });

      if (chatsError) {
          console.error("Error fetching chats:", chatsError);
          throw new Error(chatsError.message || "Failed to fetch chat sessions");
      }

      // Step 2: Fetch message counts for each chat (N+1 query pattern)
      // NOTE: This is inherently slow but preserved to maintain existing functionality.
      const sessionsWithCounts = await Promise.all(
          (chats || []).map(async (chat: any) => {
              const { count } = await supabase
                  .from("messages")
                  .select("*", { count: "exact", head: true })
                  .eq("chat_id", chat.id);

              return {
                  id: chat.id,
                  title: chat.title,
                  created_at: chat.created_at,
                  user_id: chat.user_id,
                  user_email: (chat.profiles as any)?.email || "Unknown", 
                  message_count: count || 0,
              } as ChatSession;
          })
      );
      
      return sessionsWithCounts;
    } catch (error) {
        throw new Error(`Failed to fetch session data: ${error instanceof Error ? error.message : String(error)}`);
    }
};


export default function Sessions() {
  const { isFounder, loading: roleLoading } = useFounderCheck();
  
  // 1. Use useQuery for caching and automatic re-fetching
  const { data: sessions, isLoading, isError } = useQuery<ChatSession[]>({
    queryKey: ['internal-sessions'],
    queryFn: () => fetchChatSessions(roleLoading, isFounder),
    // Only run the query if permissions are verified
    enabled: isFounder && !roleLoading, 
    staleTime: 60 * 1000, // 1 minute stale time (smooth functioning)
    refetchOnWindowFocus: true,
  });

  const allSessions = sessions || [];
  
  // 2. Statistics calculation (now uses the cached data)
  const totalMessages = allSessions.reduce((sum, session) => sum + session.message_count, 0);
  const avgMessagesPerSession =
    allSessions.length > 0 ? (totalMessages / allSessions.length).toFixed(1) : 0;

  // 3. Consolidate Loading and Error States
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
             <p className="text-muted-foreground mt-2">Could not retrieve internal session data. This is usually due to permission issues or a backend fault.</p>
          </div>
        </InternalLayout>
      );
  }


  return (
    <InternalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Chat Sessions</h1>
          <p className="text-muted-foreground mt-1">Monitor chat activity and AI engagement</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allSessions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All-time chat sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMessages}</div>
              <p className="text-xs text-muted-foreground mt-1">User + AI messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per Session</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgMessagesPerSession}</div>
              <p className="text-xs text-muted-foreground mt-1">Messages per chat</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Latest AI chat interactions across all users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-center">Messages</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.title}</TableCell>
                      <TableCell className="text-muted-foreground">{session.user_email}</TableCell>
                      <TableCell className="text-center font-semibold">
                        {session.message_count}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(session.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={session.message_count > 5 ? "default" : "secondary"}>
                          {session.message_count > 5 ? "Active" : "Brief"}
                        </Badge>
                      </TableCell>
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