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
          navigate('/');
          return;
        }

        if (!session) {
          console.error('No session after OAuth callback');
          toast({
            title: 'Authentication Failed',
            description: 'No session found. Please try logging in again.',
            variant: 'destructive'
          });
          navigate('/');
          return;
        }

        // Verify we have the necessary tokens
        if (!session.provider_token) {
          console.error('No provider token in session');
          toast({
            title: 'Authentication Error',
            description: 'Missing required Gmail access. Please try again.',
            variant: 'destructive'
          });
          navigate('/');
          return;
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
          toast({
            title: 'Token Storage Error',
            description: 'Failed to store authentication tokens.',
            variant: 'destructive'
          });
          navigate('/');
          return;
        }

        // Success! Redirect to the app
        toast({
          title: 'Successfully Authenticated',
          description: 'You can now use all features of the app.',
          variant: 'default'
        });
        navigate('/');

      } catch (error) {
        console.error('Callback error:', error);
        toast({
          title: 'Authentication Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive'
        });
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing Authentication...</h2>
        <p className="text-muted-foreground">Please wait while we finish setting up your account.</p>
      </div>
    </div>
  );
}
