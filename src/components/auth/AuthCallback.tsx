import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session after the OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (!session) {
          console.error('No session after OAuth callback');
          throw new Error('Authentication failed');
        }

        // Store the tokens if they exist
        if (session.provider_token) {
          const expiresAt = session.expires_in 
            ? new Date(Date.now() + (session.expires_in * 1000))
            : new Date(Date.now() + (3600 * 1000)); // Default to 1 hour if no expiry provided

          const { error: tokenError } = await supabase
            .from('user_tokens')
            .upsert({
              user_id: session.user.id,
              provider: 'github',
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token ?? null,
              expires_at: expiresAt.toISOString()
            }, {
              onConflict: 'user_id,provider'
            });

          if (tokenError) {
            console.error('Error storing tokens:', tokenError);
            throw tokenError;
          }
        } else {
          throw new Error('No provider token received from GitHub');
        }

        // Redirect to search page after successful authentication
        navigate('/search');
      } catch (error) {
        console.error('Error in auth callback:', error);
        toast.error('Authentication failed. Please try again.');
        // Redirect to landing page on authentication failure
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we set up your account.</p>
      </div>
    </div>
  );
}
