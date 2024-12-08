import { Database } from './supabase';

// Supabase table types
export type Thread = Database['public']['Tables']['threads']['Row'];
export type ThreadInsert = Database['public']['Tables']['threads']['Insert'];
export type ThreadUpdate = Database['public']['Tables']['threads']['Update'];

// Gmail API response types
export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  internalDate: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    parts?: Array<{
      mimeType: string;
      body: {
        data?: string;
        size?: number;
      };
    }>;
    body?: {
      data?: string;
      size?: number;
    };
  };
}

export interface GmailThread {
  id: string;
  historyId: string;
  messages: GmailMessage[];
}

// Application-specific types
export interface ThreadWithMetadata extends Thread {
  snippet?: string;
  from?: string;
  to?: string;
  hasAttachments?: boolean;
}

export interface EmailMetadata {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  unread: boolean;
  receivedAt: string;
}

// Component prop types
export interface EmailThreadProps {
  thread: ThreadWithMetadata;
  onThreadClick: () => void;
}

// Service types
export interface GmailTokens {
  id?: string;
  user_id?: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  created_at?: string;
  updated_at?: string;
}

// Utility types
export type EmailAddress = {
  name?: string;
  email: string;
};

export type ParsedEmail = {
  raw: string;
  parsed: EmailAddress;
};

export const parseEmailAddress = (raw: string): ParsedEmail => {
  const match = raw.match(/(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/);
  return {
    raw,
    parsed: {
      name: match?.[1],
      email: match?.[2] || raw,
    },
  };
};
