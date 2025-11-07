import { useState } from "react";
import { Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-border bg-background">
      <div className="max-w-3xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2 bg-[hsl(var(--message-ai-bg))] rounded-2xl border border-border p-2 focus-within:border-accent transition-colors">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="flex-shrink-0 hover:bg-[hsl(var(--hover-bg))]"
            >
              <Plus className="h-5 w-5" />
            </Button>
            
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              disabled={disabled}
              className="flex-1 min-h-[24px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 resize-none px-2 py-2"
              rows={1}
            />
            
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || disabled}
              className="flex-shrink-0 bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
