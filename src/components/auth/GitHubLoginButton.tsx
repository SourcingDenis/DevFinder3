import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { GithubIcon } from 'lucide-react';

export function GitHubLoginButton() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  return (
    <Button onClick={handleLogin} variant="outline">
      <GithubIcon className="mr-2 h-4 w-4" />
      Continue with GitHub
    </Button>
  );
}
