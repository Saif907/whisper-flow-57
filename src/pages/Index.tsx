import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ChatWelcome } from "@/components/ChatWelcome";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { chatAPI } from "@/lib/api";
import { Message, Chat } from "@/types/app";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // ADDED

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // ADDED
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- 1. Queries for Reading Data (Chat List & Active Chat Messages) ---
  
  // Query for all chat sessions
  const { data: chats = [], isLoading: isLoadingChats, isError: isErrorChats } = useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: chatAPI.getChats,
    enabled: !!user && !authLoading,
    select: (data) => data.map((chat: any) => ({
      ...chat,
      timestamp: new Date(chat.created_at),
      messages: [], // Messages will be populated by the dedicated chat query
    }) as Chat),
    // Use stale-while-revalidate strategy (default 0, but important for UX)
    staleTime: 60 * 1000 * 5, // 5 minutes stale time
    refetchOnWindowFocus: true, // Auto-refetch on tab focus (eliminates manual reloads)
  });

  // Query for the currently selected chat's messages
  const { 
    data: activeChatData,
    isLoading: isLoadingActiveChat,
    isError: isErrorActiveChat,
    isFetching: isFetchingActiveChat,
  } = useQuery<any>({
    queryKey: ['chat', activeChat],
    queryFn: () => chatAPI.getChat(activeChat!),
    enabled: !!activeChat, // Only fetch if a chat is selected
    select: (data) => ({
      ...data.chat,
      messages: data.messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content
      })) as Message[],
    } as Chat),
  });

  // --- 2. Mutations for Writing Data (Create Chat & Send Message) ---

  const createChatMutation = useMutation({
    mutationFn: (initialTitle: string) => chatAPI.createChat(initialTitle),
    onSuccess: (newChat) => {
      // Manually add the new chat to the cache for immediate display (optimistic UI)
      const newChatData: Chat = {
        id: newChat.id,
        title: newChat.title,
        timestamp: new Date(newChat.created_at),
        messages: [],
      };
      queryClient.setQueryData(['chats'], (old: Chat[] = []) => [newChatData, ...old]);
      
      // Select the new chat
      setActiveChat(newChat.id);
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    }
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, message }: { chatId: string, message: string }) => 
      chatAPI.sendMessage(chatId, message),
    onSuccess: (response, variables) => {
      // 1. Manually update the active chat cache to append the new message instantly
      queryClient.setQueryData(['chat', variables.chatId], (oldData: Chat | undefined) => {
        if (!oldData) return oldData;
        
        // Filter out the temporary messages we added optimistically
        const filteredMessages = oldData.messages.filter(m => !m.id.startsWith('temp-'));
        
        // Re-add the user message (retaining optimistic content) and the final AI response
        const userMessage = { id: `user-${Date.now()}`, role: "user", content: variables.message } as Message;
        const finalAiMessage = { id: `ai-${Date.now()}-final`, role: "assistant", content: response.message } as Message;

        return {
          ...oldData,
          messages: [...filteredMessages, userMessage, finalAiMessage],
        } as Chat;
      });

      // 2. Invalidate chat query (for message count) and the chat list (for title updates)
      queryClient.invalidateQueries({ queryKey: ['chats'] }); 
      
      if (response.trade_extracted) {
        toast.success("Trade logged successfully!");
        // Also invalidate trades list so Dashboard/Trades pages update
        queryClient.invalidateQueries({ queryKey: ['trades'] }); 
      }
    },
    onError: (error, variables) => {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      
      // On error, revert the optimistic update by removing temp messages
      queryClient.setQueryData(['chat', variables.chatId], (oldData: Chat | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          messages: oldData.messages.filter(m => !m.id.startsWith('temp-')),
        } as Chat;
      });
    },
    onMutate: async ({ chatId, message }) => {
      // Optimistic update: instantly show user message and typing indicator
      await queryClient.cancelQueries({ queryKey: ['chat', chatId] }); // Stop any active fetching

      const userMessage: Message = { id: `temp-${Date.now()}-user`, role: "user", content: message };
      const typingMessage: Message = { id: `temp-${Date.now()}-ai`, role: "assistant", content: "Processing your message..." };

      queryClient.setQueryData(['chat', chatId], (oldData: Chat | undefined) => {
        if (!oldData) return oldData;
        
        // Find existing messages (excluding old temp messages)
        const currentMessages = oldData.messages.filter(m => !m.id.startsWith('temp-'));
        
        return {
          ...oldData,
          messages: [...currentMessages, userMessage, typingMessage],
        } as Chat;
      });

      setIsTyping(true);
    },
    onSettled: () => {
      setIsTyping(false);
    }
  });


  // --- 3. Unified Handlers (Connecting UI to Mutations/Queries) ---

  const handleNewChat = (initialTitle = "New chat") => {
    if (!user) return;
    createChatMutation.mutate(initialTitle);
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
  };

  const handleSendMessage = async (content: string) => {
    if (!user || isTyping) return;

    let targetChatId = activeChat;
    
    // Step 1: Handle Chat Creation if no chat is active
    if (!targetChatId) {
      // NOTE: Mutation handlers for optimistic update are in sendMessageMutation now.
      // We start with a simplified process here to get the chat ID quickly.
      const tempChatTitle = content.slice(0, 50);
      const newChatResponse = await createChatMutation.mutateAsync(tempChatTitle);
      targetChatId = newChatResponse.id;
      setActiveChat(newChatResponse.id);
      
      // Optimistically update chat title in the newly created chat
      queryClient.setQueryData(['chat', targetChatId], (oldData: Chat | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, title: tempChatTitle } as Chat;
      });
    }

    // Step 2: Send Message
    sendMessageMutation.mutate({ chatId: targetChatId!, message: content });
  };
  
  const handleSuggestionClick = (text: string) => {
    handleSendMessage(text);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // Dependency only needs to be the chat data, not the messages list itself
  }, [activeChatData]); 


  // --- 4. Render Logic with Loading/Error States ---

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Global loading state (only show spinner on initial auth or initial chat load)
  if (authLoading || isLoadingChats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentChat = activeChatData;
  const isInitialState = !currentChat || currentChat.messages.length === 0;

  // Show a simpler loading/error for messages while the list is already loaded
  const chatMessagesContent = (isLoadingActiveChat || isFetchingActiveChat) ? (
    <div className="flex flex-col flex-1 items-center justify-center h-96">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground mt-3">Loading chat history...</p>
    </div>
  ) : (
    <ScrollArea className="flex-1" ref={scrollRef}>
      <div className="space-y-0">
        {currentChat?.messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role as "user" | "assistant"}
            content={message.content}
          />
        ))}
      </div>
    </ScrollArea>
  );

  return (
    <Layout
      sidebarOpen={sidebarOpen}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      chats={chats} // Passing cached chat list
      activeChat={activeChat}
      onChatSelect={handleChatSelect}
      onNewChat={handleNewChat}
    >
      <div className="flex-1 flex flex-col h-screen">
        {isInitialState ? (
          <ChatWelcome onSuggestionClick={handleSuggestionClick} />
        ) : (
          chatMessagesContent
        )}

        <ChatInput 
          onSend={handleSendMessage} 
          disabled={isTyping || sendMessageMutation.isPending || createChatMutation.isPending} 
        />
      </div>
    </Layout>
  );
};

export default Index;