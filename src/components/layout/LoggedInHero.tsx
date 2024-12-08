import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function LoggedInHero() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">
        Welcome, {user?.email || 'Developer'}
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Ready to find your next collaboration or hire?
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/search" className="inline-block">
          <Button>
            Start Searching
          </Button>
        </Link>
        <Link to="/bookmarks" className="inline-block">
          <Button variant="secondary">
            Saved Profiles
          </Button>
        </Link>
      </div>
    </div>
  );
}
