export interface Database {
  public: {
    Tables: {
      saved_profiles: {
        Row: {
          id: number;
          user_id: string;
          github_username: string;
          github_data: Record<string, any>;
          created_at: string;
          list_id?: number; // Optional list association
        };
        Insert: {
          id?: number;
          user_id: string;
          github_username: string;
          github_data: Record<string, any>;
          created_at?: string;
          list_id?: number; // Optional list association
        };
        Update: {
          id?: number;
          user_id?: string;
          github_username?: string;
          github_data?: Record<string, any>;
          created_at?: string;
          list_id?: number; // Optional list association
        };
      };
      threads: {
        Row: {
          id: string;
          user_id: string;
          gmail_thread_id: string;
          subject: string;
          last_message_date: string;
          unread_count: number;
          candidate_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          gmail_thread_id: string;
          subject: string;
          last_message_date: string;
          unread_count?: number;
          candidate_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          gmail_thread_id?: string;
          subject?: string;
          last_message_date?: string;
          unread_count?: number;
          candidate_id?: string;
          updated_at?: string;
        };
      };
      user_searches: {
        Row: {
          id: string;
          user_id: string;
          search_query: string;
          language: string | null;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          search_query: string;
          language?: string | null;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          search_query?: string;
          language?: string | null;
          location?: string | null;
          created_at?: string;
        };
      };
      user_emails: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          source?: string;
          confidence_score?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          source?: string;
          confidence_score?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          source?: string;
          confidence_score?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profile_lists: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          description?: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          description?: string;
          created_at?: string;
        };
      };
    };
  };
}

// User Emails Table Type
export type UserEmail = {
  id: string;
  user_id: string;
  email: string;
  source?: string;
  confidence_score?: number;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
};