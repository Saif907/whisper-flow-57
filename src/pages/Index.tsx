import { useState, useRef, useEffect } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ChatWelcome } from "@/components/ChatWelcome";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem("chats");
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats.map((chat: any) => ({
        ...chat,
        timestamp: new Date(chat.timestamp),
      })));
    }
  }, []);

  // Save chats to localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("chats", JSON.stringify(chats));
    }
  }, [chats]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat, chats]);

  const currentChat = chats.find((c) => c.id === activeChat);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New chat",
      timestamp: new Date(),
      messages: [],
    };
    setChats([newChat, ...chats]);
    setActiveChat(newChat.id);
  };

  const handleSendMessage = async (content: string) => {
    if (!activeChat) {
      handleNewChat();
      // Wait for state to update
      setTimeout(() => handleSendMessage(content), 100);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat
          ? {
              ...chat,
              title: chat.messages.length === 0 ? content.slice(0, 50) : chat.title,
              messages: [...chat.messages, userMessage],
            }
          : chat
      )
    );

    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I'm a demo assistant. You said: "${content}"\n\nThis is where the AI response would appear. In a real implementation, this would connect to an AI service like OpenAI, Anthropic, or use Lovable AI.`,
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        )
      );
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (text: string) => {
    handleSendMessage(text);
  };

  return (
    <div className="flex h-screen bg-[hsl(var(--chat-bg))] overflow-hidden">
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chats={chats}
        activeChat={activeChat}
        onChatSelect={setActiveChat}
        onNewChat={handleNewChat}
      />

      <div className="flex-1 flex flex-col">
        {!currentChat || currentChat.messages.length === 0 ? (
          <ChatWelcome onSuggestionClick={handleSuggestionClick} />
        ) : (
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="space-y-0">
              {currentChat.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                />
              ))}
              {isTyping && (
                <ChatMessage
                  role="assistant"
                  content="Thinking..."
                />
              )}
            </div>
          </ScrollArea>
        )}

        <ChatInput onSend={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
};

export default Index;
