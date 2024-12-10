import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast({
            title: 'Authentication Error',
            description: 'Failed to complete authentication. Please try again.',
            variant: 'destructive'
          });
          navigate('/', { replace: true });
          return;
        }

        if (!session) {
          console.error('No session after OAuth callback');
          toast({
            title: 'Authentication Failed',
            description: 'No session found. Please try logging in again.',
            variant: 'destructive'
          });
          navigate('/', { replace: true });
          return;
        }

        // Explicitly store tokens in local storage
        if (session.access_token) {
          localStorage.setItem('access_token', session.access_token);
          localStorage.setItem('refresh_token', session.refresh_token || '');
          localStorage.setItem('expires_at', (session.expires_at || Date.now() + 3600 * 1000).toString());
        }

        // Verify we have the necessary tokens
        if (!session.provider_token) {
          console.error('No provider token in session');
          toast({
            title: 'Authentication Error',
            description: 'Missing required GitHub access. Please try again.',
            variant: 'destructive'
          });
          navigate('/', { replace: true });
          return;
        }

        // Store the tokens
        const { error: tokenError } = await supabase
          .from('user_tokens')
          .upsert({
            user_id: session.user.id,
            provider: 'github',
            access_token: session.provider_token,
            refresh_token: session.provider_refresh_token,
            expires_at: new Date(Date.now() + (session.expires_in * 1000)).toISOString()
          }, {
            onConflict: 'user_id,provider'
          });

        if (tokenError) {
          console.error('Error storing tokens:', tokenError);
          toast({
            title: 'Warning',
            description: 'Authenticated successfully but had trouble saving credentials.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Success',
            description: 'Successfully connected your GitHub account.',
            variant: 'default'
          });
        }

        // Redirect to the main app page
        navigate('/search', { replace: true });
      } catch (error) {
        console.error('Error in auth callback:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive'
        });
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we set up your account.</p>
      </div>
    </div>
  );
}
