import { Plus, Search, MessageSquare, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({
  isOpen,
  onToggle,
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
}: ChatSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen bg-[hsl(var(--sidebar-bg))] border-r border-border z-50 flex flex-col transition-all duration-300 ease-in-out",
          isOpen ? "w-64 translate-x-0" : "w-0 lg:w-16 -translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hover:bg-[hsl(var(--hover-bg))] transition-colors"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          {isOpen && (
            <Button
              onClick={onNewChat}
              className="flex-1 ml-2 bg-transparent hover:bg-[hsl(var(--hover-bg))] text-foreground border border-border"
            >
              <Plus className="h-4 w-4 mr-2" />
              New chat
            </Button>
          )}
        </div>

        {/* Search (when expanded) */}
        {isOpen && (
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                className="pl-9 bg-[hsl(var(--message-ai-bg))] border-border focus-visible:ring-accent"
              />
            </div>
          </div>
        )}

        {/* Chat history */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {isOpen ? (
              chats.length > 0 ? (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onChatSelect(chat.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg transition-all duration-200 group",
                      activeChat === chat.id
                        ? "bg-[hsl(var(--message-user-bg))] text-foreground"
                        : "text-muted-foreground hover:bg-[hsl(var(--hover-bg))] hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm truncate">{chat.title}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No chats yet
                </div>
              )
            ) : (
              <div className="flex flex-col items-center gap-4 py-4">
                {chats.slice(0, 3).map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onChatSelect(chat.id)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      activeChat === chat.id
                        ? "bg-[hsl(var(--message-user-bg))] text-accent"
                        : "text-muted-foreground hover:bg-[hsl(var(--hover-bg))] hover:text-foreground"
                    )}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
