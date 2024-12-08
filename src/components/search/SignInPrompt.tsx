import { Button } from '@/components/ui/button';
import { Github, Download, BookmarkCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { supabase } from '@/lib/supabase';

export function SignInPrompt() {
  const user = useAuthRedirect();

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

  if (user) return null;

  return (
    <div className="relative my-8 p-6 rounded-lg border bg-gradient-to-r from-primary/10 via-background to-primary/10">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-black/10" />
      <div className="relative">
        <h3 className="text-xl font-semibold mb-3">
          Want to see more results?
        </h3>
        <p className="text-muted-foreground mb-6">
          Sign in with GitHub to unlock additional features:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Download className="h-4 w-4 text-primary" />
            <span>Export results as CSV</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookmarkCheck className="h-4 w-4 text-primary" />
            <span>Save profiles for later</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Github className="h-4 w-4 text-primary" />
            <span>View more search results</span>
          </div>
        </div>

        <Button
          onClick={handleSignIn}
          className="flex items-center gap-2"
        >
          <Github className="h-4 w-4" />
          Sign in with GitHub
        </Button>
      </div>
    </div>
  );
}