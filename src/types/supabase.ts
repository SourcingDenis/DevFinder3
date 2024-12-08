export interface Database {
  public: {
    Tables: {
      saved_profiles: {
        Row: {
          id: string;
          user_id: string;
          github_username: string;
          github_data: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          github_username: string;
          github_data: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          github_username?: string;
          github_data?: Record<string, any>;
          created_at?: string;
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
    };
  };
}