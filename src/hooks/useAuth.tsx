import { useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // IMPORTED for smooth caching

// Query function to fetch the current session.
// This is the single source of truth for the session state in our app.
const fetchAuth = async (): Promise<{ user: User | null; session: Session | null }> => {
  // Supabase checks local storage and attempts token refresh if necessary.
  const { data: { session } } = await supabase.auth.getSession(); 
  return { user: session?.user ?? null, session: session ?? null };
};

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // 1. Use useQuery to manage fetching and caching the user/session state
  // This is the key to eliminating loading spinners on returning to the tab.
  const { 
      data, 
      isLoading: loading, 
      isError 
  } = useQuery({
      queryKey: ['auth-session'],
      queryFn: fetchAuth,
      // Stale time is set to 1 minute, but refetchOnWindowFocus ensures a fresh check.
      staleTime: 1000 * 60, 
      refetchOnWindowFocus: true, // Crucial for eliminating unnecessary reloads/spinners
  });
  
  const user = data?.user ?? null;
  const session = data?.session ?? null;

  // 2. Set up auth state listener (for real-time login/logout events)
  useEffect(() => {
    // This listener ensures the TanStack Query cache is instantly updated when Supabase's internal state changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Force refetch and re-evaluate the query when any auth event occurs
        queryClient.invalidateQueries({ queryKey: ['auth-session'] }); 
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const signOut = async () => {
    // Optimistically set the data to null in the cache for an instant UI update
    queryClient.setQueryData(['auth-session'], { user: null, session: null }); 
    // Clear all other cached data (chats, trades, internal metrics) to ensure a clean slate on log out
    queryClient.clear();
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return { user, session, loading, isError, signOut };
};