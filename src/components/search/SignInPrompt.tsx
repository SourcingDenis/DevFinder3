import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

export function SignInPrompt() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Sign In to Continue</h2>
      <p className="text-muted-foreground mb-6">
        Please sign in to access advanced search features and save profiles.
      </p>
      <Button>
        <Github className="h-4 w-4" />
        Sign in with GitHub
      </Button>

      <div className="mt-8 text-sm text-muted-foreground">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Github className="h-4 w-4 text-primary" />
            <span>Export results as CSV</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Github className="h-4 w-4 text-primary" />
            <span>Save profiles for later</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Github className="h-4 w-4 text-primary" />
            <span>View more search results</span>
          </div>
        </div>
      </div>
    </div>
  );
}