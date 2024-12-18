import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session to confirm the OAuth flow completed successfully
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          navigate('/', { replace: true });
          return;
        }

        if (!session) {
          console.error('No session found');
          navigate('/', { replace: true });
          return;
        }

        // Store the tokens in the database
        if (session.provider_token) {
          const { error: insertError } = await supabase
            .from('user_tokens')
            .upsert({
              user_id: session.user.id,
              provider: 'github',
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token || null,
              expires_at: new Date(Date.now() + 55 * 60 * 1000).toISOString(), // 55 minutes from now
            }, {
              onConflict: 'user_id,provider'
            });

          if (insertError) {
            console.error('Failed to store tokens:', insertError);
            // Continue anyway as the session is still valid
          }
        }

        console.log('Auth completed successfully:', {
          user: session.user?.id,
          expires_at: session.expires_at,
          provider_token: !!session.provider_token,
          access_token: !!session.access_token
        });

        // Redirect to home page after successful authentication
        navigate('/home', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Completing Authentication...</h1>
        <p className="text-muted-foreground">Please wait while we finish setting up your account.</p>
      </div>
    </div>
  );
}
