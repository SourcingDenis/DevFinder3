import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthProvider';
import { FAQ } from '@/components/faq/FAQ';
import { Hero } from '@/components/layout/Hero';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, BookmarkCheck, History } from 'lucide-react';
import { Github } from 'lucide-react';
import { motion } from "framer-motion";

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
