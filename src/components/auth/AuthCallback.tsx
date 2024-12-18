import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session after the OAuth redirect
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

        // Store the tokens if they exist
        if (session.provider_token) {
          const expiresAt = new Date(Date.now() + (session.expires_in ? session.expires_in * 1000 : 3600 * 1000));
          
          const { error: tokenError } = await supabase
            .from('user_tokens')
            .upsert({
              user_id: session.user.id,
              provider: 'github',
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token || null,
              expires_at: expiresAt.toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,provider'
            });

          if (tokenError) {
            console.error('Error storing tokens:', tokenError);
            toast({
              title: 'Warning',
              description: 'Successfully authenticated but had trouble saving credentials. Some features may be limited.',
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Success',
              description: 'Successfully connected your GitHub account.',
            });
          }
        } else {
          console.error('No provider token received');
          toast({
            title: 'Limited Access',
            description: 'Authentication succeeded but with limited GitHub access. Some features may not work.',
            variant: 'default'
          });
        }

        // Redirect to search page after successful authentication
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
