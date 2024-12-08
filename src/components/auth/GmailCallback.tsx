import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { GmailService } from '@/services/gmailService';
import { toast } from '@/components/ui/use-toast';

export function GmailCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGmailCallback = async () => {
      try {
        // Retrieve the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.provider_token) {
          // Store Gmail auth state
          await GmailService.setAuthState({
            isAuthorized: true,
            accessToken: session.provider_token,
            refreshToken: session.provider_refresh_token ?? null,
            expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
          });

          toast({
            title: "Gmail Connected",
            description: "Successfully connected your Gmail account."
          });
        }

        // Redirect to inbox
        navigate('/inbox');
      } catch (error) {
        console.error('Gmail callback error:', error);
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Failed to connect Gmail account. Please try again."
        });
        navigate('/inbox');
      }
    };

    handleGmailCallback();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <p>Connecting Gmail...</p>
      </div>
    </div>
  );
}
