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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
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
    staleTime: 60 * 1000 * 5, // 5 minutes stale time
    refetchOnWindowFocus: true,
  });

  // Query for the currently selected chat's messages
  const { 
    data: activeChatData,
    isLoading: isLoadingActiveChat,
    isError: isErrorActiveChat,
    isFetching: isFetchingActiveChat, // Used here for the fix
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
      const newChatData: Chat = {
        id: newChat.id,
        title: newChat.title,
        timestamp: new Date(newChat.created_at),
        messages: [],
      };
      queryClient.setQueryData(['chats'], (old: Chat[] = []) => [newChatData, ...old]);
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
      queryClient.setQueryData(['chat', variables.chatId], (oldData: Chat | undefined) => {
        if (!oldData) return oldData;
        
        const filteredMessages = oldData.messages.filter(m => !m.id.startsWith('temp-'));
        const userMessage = { id: `user-${Date.now()}`, role: "user", content: variables.message } as Message;
        const finalAiMessage = { id: `ai-${Date.now()}-final`, role: "assistant", content: response.message } as Message;

        return {
          ...oldData,
          messages: [...filteredMessages, userMessage, finalAiMessage],
        } as Chat;
      });

      queryClient.invalidateQueries({ queryKey: ['chats'] }); 
      
      if (response.trade_extracted) {
        toast.success("Trade logged successfully!");
        queryClient.invalidateQueries({ queryKey: ['trades'] }); 
      }
    },
    onError: (error, variables) => {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      
      queryClient.setQueryData(['chat', variables.chatId], (oldData: Chat | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          messages: oldData.messages.filter(m => !m.id.startsWith('temp-')),
        } as Chat;
      });
    },
    onMutate: async ({ chatId, message }) => {
      await queryClient.cancelQueries({ queryKey: ['chat', chatId] }); 

      const userMessage: Message = { id: `temp-${Date.now()}-user`, role: "user", content: message };
      const typingMessage: Message = { id: `temp-${Date.now()}-ai`, role: "assistant", content: "Processing your message..." };

      queryClient.setQueryData(['chat', chatId], (oldData: Chat | undefined) => {
        if (!oldData) return oldData;
        
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
    
    if (!targetChatId) {
      const tempChatTitle = content.slice(0, 50);
      const newChatResponse = await createChatMutation.mutateAsync(tempChatTitle);
      targetChatId = newChatResponse.id;
      setActiveChat(newChatResponse.id);
      
      queryClient.setQueryData(['chat', targetChatId], (oldData: Chat | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, title: tempChatTitle } as Chat;
      });
    }

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
  }, [activeChatData]); 


  // --- 4. Render Logic with Loading/Error States (FIX APPLIED) ---

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Global loading state (only show spinner on initial auth or initial chat list load)
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
  
  // FIX: Only show the content loading state if we are loading/fetching AND we have NO data cached yet.
  const isContentLoading = !currentChat && (isLoadingActiveChat || isFetchingActiveChat);

  const chatMessagesContent = isContentLoading ? (
    <div className="flex flex-col flex-1 items-center justify-center h-96">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground mt-3">Loading chat history...</p>
    </div>
  ) : (
    <ScrollArea className="flex-1" ref={scrollRef}>
      <div className="space-y-0">
        {/* currentChat? is necessary because activeChatData might be undefined during initial fetch */}
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
      chats={chats}
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