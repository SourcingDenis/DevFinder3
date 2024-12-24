import { supabase } from './supabase';

interface TokenRefreshSchedule {
  userId: string;
  nextRefresh: Date;
  timeoutId?: NodeJS.Timeout;
}

const REFRESH_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const activeSchedules = new Map<string, TokenRefreshSchedule>();

/**
 * Schedules a token refresh for a user
 * @param userId - The user's ID
 */
export async function scheduleTokenRefresh(userId: string): Promise<void> {
  // Clear existing schedule if any
  clearTokenRefresh(userId);

  const schedule: TokenRefreshSchedule = {
    userId,
    nextRefresh: new Date(Date.now() + REFRESH_INTERVAL)
  };

  // Schedule the refresh
  schedule.timeoutId = setTimeout(async () => {
    await refreshUserToken(userId);
  }, REFRESH_INTERVAL);

  activeSchedules.set(userId, schedule);
}

/**
 * Clears a scheduled token refresh for a user
 * @param userId - The user's ID
 */
export function clearTokenRefresh(userId: string): void {
  const schedule = activeSchedules.get(userId);
  if (schedule?.timeoutId) {
    clearTimeout(schedule.timeoutId);
    activeSchedules.delete(userId);
  }
}

/**
 * Refreshes the GitHub token for a user
 * @param userId - The user's ID
 */
async function refreshUserToken(userId: string): Promise<void> {
  try {
    // First try to refresh the session
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error('Failed to refresh session:', refreshError);
      throw refreshError;
    }

    if (!refreshData.session) {
      console.error('No session after refresh');
      throw new Error('Session refresh failed - no session returned');
    }

    // Check if we have a valid provider token
    if (!refreshData.session.provider_token) {
      console.error('No provider token after refresh');
      
      // Try to re-authenticate with GitHub
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'read:user read:email'
        }
      });

      if (signInError) {
        throw signInError;
      }
      
      return; // The auth flow will handle the rest
    }

    // Store the refreshed token
    const expiresAt = new Date(Date.now() + REFRESH_INTERVAL);
    await supabase
      .from('user_tokens')
      .upsert({
        user_id: userId,
        provider: 'github',
        access_token: refreshData.session.provider_token,
        refresh_token: refreshData.session.provider_refresh_token || null,
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'user_id,provider'
      });

    // Schedule next refresh
    scheduleTokenRefresh(userId);
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Clear the schedule on error to prevent retry loops
    clearTokenRefresh(userId);
    throw error;
  }
}
