import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthProvider';
import { FAQ } from '@/components/faq/FAQ';
import { Hero } from '@/components/layout/Hero';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, BookmarkCheck, History } from 'lucide-react';
import { GitHubLoginButton } from '@/components/auth/GitHubLoginButton';
import { Github } from 'lucide-react';
import { motion } from "framer-motion";

const GitHubIcon = () => (
  <div className="relative w-16 h-16 -mt-2">
    <div className="absolute inset-0">
      <svg viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path fillRule="evenodd" clipRule="evenodd" 
          d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" 
          className="text-primary"
          fill="currentColor"
        />
      </svg>
    </div>
  </div>
);

export function Home() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container max-w-screen-2xl">
        <div className="py-6">
          <Hero />
          <div className="my-24">
            <FAQ />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-2xl py-6">
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
        </div>
        
        <div className="md:hidden bg-gradient-to-br from-primary/20 via-background to-primary/10 rounded-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-bold text-primary">
              GitHub Search on Steroids
            </h1>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Github className="w-12 h-12 text-primary/80" />
            </motion.div>
          </div>
          <p className="text-lg text-muted-foreground">
            Supercharged GitHub search with advanced filters, analytics, and deep insights into developers and repositories.
          </p>
        </div>
        <div className={user ? "hidden md:block" : "block"}>
          <Hero />
        </div>
        
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
    </div>
  );
}
