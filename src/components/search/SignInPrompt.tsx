import { GitHubLoginButton } from '@/components/auth/GitHubLoginButton';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export function SignInPrompt() {
  const user = useAuthRedirect();

  if (user) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center border rounded-lg bg-muted/50">
      <h3 className="text-lg font-semibold">Sign in to unlock more features</h3>
      <p className="text-sm text-muted-foreground">
        Sign in with GitHub to save your searches, export results, and access advanced features.
      </p>
      <GitHubLoginButton />
    </div>
  );
}