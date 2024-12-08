import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function GithubAuthButton() {
  const handleLogin = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'read:user user:email repo public_repo'
        }
      });

      if (error) {
        console.error('Error signing in with GitHub:', error.message);
      }
    } catch (err: unknown) {
      console.error('Error signing in with GitHub:', err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Button
      onClick={handleLogin}
      className="w-full gap-2"
    >
      <Github className="h-5 w-5" />
      Continue with GitHub
    </Button>
  );
}
