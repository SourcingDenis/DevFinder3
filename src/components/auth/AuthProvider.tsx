import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';
import { scheduleTokenRefresh, clearTokenRefresh } from '@/lib/token-refresh';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signInWithGitHub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  error: null,
  signInWithGitHub: async () => {} 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const signInWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'read:user read:email',
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (err) {
      console.error('Sign in error:', err);
      toast.error('Failed to sign in with GitHub');
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            await scheduleTokenRefresh(session.user.id);
          }
          setLoading(false);
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state change:', {
            event,
            hasSession: !!session,
            userId: session?.user?.id,
          });

          if (mounted) {
            setUser(session?.user ?? null);
            if (session?.user) {
              await scheduleTokenRefresh(session.user.id);
            } else {
              clearTokenRefresh(session?.user?.id ?? '');
            }
            setLoading(false);
          }
        });

        return () => {
          mounted = false;
          subscription.unsubscribe();
          if (session?.user) {
            clearTokenRefresh(session.user.id);
          }
        };
      } catch (err) {
        console.error('Auth error:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Authentication failed'));
          setLoading(false);
          toast.error('Authentication error. Please try refreshing the page.');
        }
      }
    }

    initializeAuth();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600">Authentication Error</h1>
          <p className="mt-2 text-gray-600">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGitHub }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};