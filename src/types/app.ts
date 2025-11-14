// src/types/app.ts

// --- Core Data Structures ---

/**
 * Represents a single message in a chat session.
 */
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/**
 * Represents a chat session, used for the sidebar and session list.
 */
export interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

/**
 * Represents a trade log entry.
 */
export interface Trade {
  id: string;
  ticker: string;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  entry_date: string; // ISO date string "YYYY-MM-DD"
  exit_date: string | null; // ISO date string or null
  profit_loss: number | null;
  created_at: string;
  notes: string | null;
}