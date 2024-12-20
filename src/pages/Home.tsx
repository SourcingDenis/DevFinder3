import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, BookmarkCheck, History } from 'lucide-react';
import { Hero } from '@/components/layout/Hero';
import { FAQ } from '@/components/faq/FAQ';
import { ActivityFeed } from '@/components/activity/ActivityFeed';

export function Home() {
  const { user } = useAuth();

  // For non-authenticated users
  if (!user) {
    return (
      <div className="space-y-12">
        <Hero />
        <FAQ />
      </div>
    );
  }

  // For authenticated users
  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-primary/10 to-background rounded-2xl p-6 sm:p-8 md:p-12 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-primary">
          Welcome, {user?.user_metadata?.full_name || 'Developer'}!
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground mb-6">
          Ready to discover and connect with top developers? Let's get started.
        </p>
      </div>

      {/* Widgets Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Search className="card-header-icon" />
              <CardTitle className="card-header-title">Search Developers</CardTitle>
            </div>
            <CardDescription>
              Find developers by location, tech stack, experience level, and more. Get detailed insights into their work and contributions.
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button asChild variant="outline" className="w-full group">
              <Link to="/search">
                Start Searching
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <BookmarkCheck className="card-header-icon" />
              <CardTitle className="card-header-title">Saved Profiles</CardTitle>
            </div>
            <CardDescription>
              Keep track of interesting developers. Create custom lists and add notes to organize your talent pool effectively.
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button asChild variant="outline" className="w-full group">
              <Link to="/saved-profiles">
                View Saved Profiles
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <History className="card-header-icon" />
              <CardTitle className="card-header-title">Saved Searches</CardTitle>
            </div>
            <CardDescription>
              Save and reuse your search filters. Get notified when new developers match your saved search criteria.
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto">
            <Button asChild variant="outline" className="w-full group">
              <Link to="/saved-searches">
                View Searches
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Activity Feed Section */}
      <div className="mt-8">
        <ActivityFeed />
      </div>
    </div>
  );
}
