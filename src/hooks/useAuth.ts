import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth-service';
import { toast } from 'react-toastify';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        toast.error('Error getting session. Please try signing in again.');
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        await authService.clearToken();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Pre-fetch initial token
        try {
          await authService.getValidToken();
        } catch (error) {
          console.error('Error getting initial token:', error);
          toast.error('Error initializing session. Please try signing in again.');
        }
      }
      
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await authService.clearToken();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out. Please try again.');
      throw error;
    }
  };

  return {
    user,
    loading,
    signOut,
  };
}
