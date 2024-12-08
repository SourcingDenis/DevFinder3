import { useAuth } from '@/hooks/useAuth';
import { LoggedInHero } from './LoggedInHero';
import { GitHubLoginButton } from '../auth/GitHubLoginButton';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Github, Google, Linkedin } from 'lucide-react';

export function Hero() {
  const { user } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
    }
  };

  const handleLinkedInLogin = async () => {
    try {
      // Placeholder for LinkedIn OAuth
      console.log('LinkedIn OAuth not implemented yet');
      // Implement LinkedIn OAuth when available
    } catch (error) {
      console.error('Failed to sign in with LinkedIn:', error);
    }
  };

  if (user) {
    return <LoggedInHero />;
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">
        Discover GitHub Talent
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Find, filter, and connect with developers worldwide
      </p>
      <div className="flex justify-center space-x-4">
        <GitHubLoginButton confetti={true} />
        <Button 
          variant="outline" 
          onClick={handleGoogleLogin} 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md hover:bg-gray-100"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
            <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.32-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
            <path fill="#FBBC05" d="M11.68 28.18c-.75-2.24-1.19-4.65-1.19-7.18s.44-4.94 1.19-7.18V8.13H4.34A23.933 23.933 0 0 0 0 24c0 3.86.93 7.5 2.59 10.73l7.09-5.55z"/>
            <path fill="#EA4335" d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.29 29.93 1 24 1 15.4 1 7.96 5.93 4.34 14.27l7.34 5.7c1.74-5.2 6.59-9.02 12.32-9.02z"/>
          </svg>
          Sign in with Google
        </Button>
        <Button 
          variant="outline" 
          onClick={handleLinkedInLogin} 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md hover:bg-gray-100"
          disabled
        >
          <Linkedin className="w-5 h-5 mr-2" />
          Sign in with LinkedIn
        </Button>
      </div>
    </div>
  );
}