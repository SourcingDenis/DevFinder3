import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowRight, Search, BookmarkCheck, History } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to DevFinder</h1>
        <p className="text-xl text-muted-foreground">
          Find and connect with developers based on their skills, location, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <CardTitle>Advanced Search</CardTitle>
            </div>
            <CardDescription>
              Search for developers by location, language, followers, and more.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/search')} className="w-full">
              Start Searching <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookmarkCheck className="h-5 w-5 text-primary" />
              <CardTitle>Save Profiles</CardTitle>
            </div>
            <CardDescription>
              Save interesting profiles to review later or share with your team.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => navigate('/saved-profiles')}
              className="w-full"
            >
              View Saved <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle>Search History</CardTitle>
            </div>
            <CardDescription>
              Access your recent searches and saved search queries.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => navigate('/saved-searches')}
              className="w-full"
            >
              View History <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
