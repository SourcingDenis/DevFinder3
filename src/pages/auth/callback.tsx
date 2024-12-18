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

        console.log('Session obtained:', {
          user: session.user?.id,
          expires_at: session.expires_at,
          provider_token: !!session.provider_token,
          access_token: !!session.access_token
        });

        // Redirect to home page after successful authentication
        navigate('/home', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        // Redirect to login page on error
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
