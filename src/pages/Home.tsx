import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthProvider';
import { FAQ } from '@/components/faq/FAQ';
import { Hero } from '@/components/layout/Hero';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, BookmarkCheck, History, Github } from 'lucide-react';
import { motion } from "framer-motion";

interface HomeProps {
  isLoggedIn: boolean;
}

export function Home({ isLoggedIn }: HomeProps) {
  const { user } = useAuth();

  // If isLoggedIn is false and user exists, or isLoggedIn is true and no user, return null
  if ((isLoggedIn && !user) || (!isLoggedIn && user)) {
    return null;
  }

  if (!user) {
    return (
      <div>
        <Hero />
        <div className="my-24">
          <FAQ />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {user && (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <h1 className="text-4xl font-bold text-primary">
            Welcome, {user.user_metadata?.full_name || 'Developer'}!
          </h1>
        </div>
      )}
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
            <Link to="/bookmarks">
              View Bookmarks
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
  </div>
  );
}
