import { supabase } from './supabase';
import { toast } from 'react-toastify';

interface TokenState {
  provider_token: string | null;
  refresh_token: string | null;
  expiresAt: number | null;
}

interface RefreshResult {
  token: string;
  error?: Error;
}

class AuthService {
  public readonly supabase = supabase;

  private tokenState: TokenState = {
    provider_token: null,
    refresh_token: null,
    expiresAt: null,
  };

  private isRefreshing = false;
  private refreshSubscribers: Array<(result: RefreshResult) => void> = [];
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer before actual expiry
  private readonly TOKEN_VALIDITY = 55 * 60 * 1000; // GitHub tokens last 1 hour, we use 55 minutes

  private subscribeTokenRefresh(cb: (result: RefreshResult) => void) {
    this.refreshSubscribers.push(cb);
  }

  private onTokenRefreshed(result: RefreshResult) {
    this.refreshSubscribers.forEach(cb => cb(result));
    this.refreshSubscribers = [];
  }

  public async getValidToken(): Promise<string> {
    // If token exists and is not near expiry, return it
    if (
      this.tokenState.provider_token &&
      this.tokenState.expiresAt &&
      Date.now() + this.TOKEN_EXPIRY_BUFFER < this.tokenState.expiresAt
    ) {
      return this.tokenState.provider_token;
    }

    // Token needs refresh
    return this.refreshToken();
  }

  private async refreshToken(): Promise<string> {
    if (this.isRefreshing) {
      // Wait for the ongoing refresh
      return new Promise((resolve, reject) => {
        this.subscribeTokenRefresh(result => {
          if (result.error) reject(result.error);
          else resolve(result.token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      // First try to get the current session
      const { data: session, error: sessionError } = await this.supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to get session');
      }

      if (!session?.session) {
        console.error('No active session found');
        throw new Error('No active session');
      }

      // Try to refresh the session first
      const { data: refreshData, error: refreshError } = await this.supabase.auth.refreshSession();
      
      if (!refreshError && refreshData.session?.provider_token) {
        const token = refreshData.session.provider_token;
        this.tokenState = {
          provider_token: token,
          refresh_token: refreshData.session.provider_refresh_token ?? null,
          expiresAt: Date.now() + this.TOKEN_VALIDITY,
        };

        this.onTokenRefreshed({ token });
        return token;
      }

      // If session refresh failed, try to get stored tokens
      const { data: storedTokens, error: tokensError } = await this.supabase
        .from('user_tokens')
        .select('access_token, refresh_token, expires_at')
        .eq('user_id', session.session.user.id)
        .eq('provider', 'github')
        .single();

      if (tokensError || !storedTokens?.access_token) {
        console.error('Token retrieval error:', tokensError);
        throw new Error('No valid tokens found');
      }

      // Check if stored token is expired
      const expiresAt = storedTokens.expires_at ? new Date(storedTokens.expires_at).getTime() : null;
      if (expiresAt && Date.now() >= expiresAt) {
        console.error('Stored token is expired');
        throw new Error('Token expired');
      }

      // Update token state with stored tokens
      this.tokenState = {
        provider_token: storedTokens.access_token,
        refresh_token: storedTokens.refresh_token,
        expiresAt,
      };

      this.onTokenRefreshed({ token: storedTokens.access_token });
      return storedTokens.access_token;

    } catch (error) {
      const isExpiredError = error instanceof Error && 
        (error.message.includes('expired') || error.message.includes('No valid tokens'));
      
      if (isExpiredError) {
        // Only sign out if the token is actually expired
        console.error('Token expired, signing out:', error);
        toast.error('Your session has expired. Please sign in again.');
        await this.supabase.auth.signOut();
      } else {
        // For other errors, just show an error message
        console.error('Token refresh error:', error);
        toast.error('There was a problem refreshing your session. Please try again.');
      }
      
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  public async clearToken() {
    this.tokenState = {
      provider_token: null,
      refresh_token: null,
      expiresAt: null,
    };
    this.refreshSubscribers = [];
    this.isRefreshing = false;
  }
}

export const authService = new AuthService();
