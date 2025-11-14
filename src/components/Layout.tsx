import { ReactNode } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { Chat } from "@/types/app"; // IMPORTED: Use centralized type

// REMOVED: The local Chat interface definition has been deleted.

interface LayoutProps {
  children: ReactNode;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  chats: Chat[]; // Now uses imported Chat interface
  activeChat: string | null;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
}

export function Layout({
  children,
  sidebarOpen,
  onSidebarToggle,
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
}: LayoutProps) {
  return (
    <div className="flex h-screen bg-[hsl(var(--chat-bg))] overflow-hidden">
      {/* Mobile header with hamburger */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-[hsl(var(--sidebar-bg))] border-b border-border z-30 flex items-center px-4 lg:hidden">
        <button
          onClick={onSidebarToggle}
          className="p-2 hover:bg-[hsl(var(--hover-bg))] rounded-lg transition-colors"
        >
          <svg
            className="w-6 h-6 text-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="ml-3 text-lg font-semibold text-foreground">Trading Journal</span>
      </div>

      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={onSidebarToggle}
        chats={chats}
        activeChat={activeChat}
        onChatSelect={onChatSelect}
      onNewChat={onNewChat}
      />
      <div className="flex-1 overflow-auto pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  );
}