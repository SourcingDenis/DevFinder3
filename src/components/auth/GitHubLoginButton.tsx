import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GitHubLoginButtonProps {
  className?: string;
}

export function GitHubLoginButton({ className }: GitHubLoginButtonProps) {
  const handleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: import.meta.env.VITE_GITHUB_CALLBACK_URL
        }
      });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      className={className}
      variant="outline"
    >
      <Github className="h-4 w-4 mr-2" />
      Sign in with GitHub
    </Button>
  );
}
