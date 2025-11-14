import { Plus, Search, MessageSquare, Menu, X, Library, User, Settings, LogOut, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Chat } from "@/types/app"; // IMPORTED: Use centralized type

// REMOVED: The local Chat interface definition has been deleted.

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: Chat[]; // Now uses imported Chat interface
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
  const { user, signOut } = useAuth();
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

        {/* Navigation Links */}
        {isOpen ? (
          <div className="space-y-1 mx-3 mt-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-[hsl(var(--hover-bg))] hover:text-foreground transition-all duration-200"
            >
              <Library className="h-5 w-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link
              to="/trades"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-[hsl(var(--hover-bg))] hover:text-foreground transition-all duration-200"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Trades</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-1 mt-3 mx-2">
            <Link
              to="/dashboard"
              className="flex justify-center p-2 rounded-lg text-muted-foreground hover:bg-[hsl(var(--hover-bg))] hover:text-foreground transition-colors"
            >
              <Library className="h-5 w-5" />
            </Link>
            <Link
              to="/trades"
              className="flex justify-center p-2 rounded-lg text-muted-foreground hover:bg-[hsl(var(--hover-bg))] hover:text-foreground transition-colors"
            >
              <TrendingUp className="h-5 w-5" />
            </Link>
          </div>
        )}

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

        {/* User Profile Section */}
        <div className="border-t border-border p-3">
          {isOpen ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[hsl(var(--hover-bg))] transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user?.user_metadata?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <Settings className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[hsl(var(--message-ai-bg))] border-border">
                <DropdownMenuItem className="cursor-pointer hover:bg-[hsl(var(--hover-bg))]">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-[hsl(var(--hover-bg))]">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-[hsl(var(--hover-bg))] text-destructive focus:text-destructive"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button className="w-full flex justify-center p-2 rounded-lg hover:bg-[hsl(var(--hover-bg))] transition-colors">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                <User className="h-4 w-4" />
              </div>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}