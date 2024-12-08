import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

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

        // Store the tokens
        const { error: tokenError } = await supabase
          .from('user_tokens')
          .upsert({
            user_id: session.user.id,
            provider: 'google',
            access_token: session.provider_token,
            refresh_token: session.provider_refresh_token,
            expires_at: new Date(Date.now() + (session.expires_in * 1000)).toISOString()
          }, {
            onConflict: 'user_id,provider'
          });

        if (tokenError) {
          console.error('Error storing tokens:', tokenError);
          throw tokenError;
        }

        // Redirect to the main app
        navigate('/');
      } catch (error) {
        console.error('Error in auth callback:', error);
        // Redirect to login page or show error
        navigate('/login');
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
