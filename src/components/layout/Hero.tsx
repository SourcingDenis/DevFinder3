import { useAuth } from '@/hooks/useAuth';
import { LoggedInHero } from './LoggedInHero';
import { GitHubLoginButton } from '../auth/GitHubLoginButton';

export function Hero() {
  const { user } = useAuth();

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
      <div className="flex justify-center">
        <GitHubLoginButton />
      </div>
    </div>
  );
}