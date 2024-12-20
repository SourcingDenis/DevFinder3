import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Github, Star } from 'lucide-react';
import type { GitHubUser } from '@/types';
import axios from 'axios';

export function DemoSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [demoResults, setDemoResults] = useState<GitHubUser[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get(`https://api.github.com/search/users`, {
        params: {
          q: query.trim(),
          per_page: 3
        }
      });
      
      const results = response.data;
      setDemoResults(results.items);
      setHasSearched(true);
    } catch (error) {
      console.error('Demo search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold">
          Try DevFinder Now
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Search for developers by name, username, or skills. This is a preview of our powerful search capabilities.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Try searching for 'john nodejs' or 'sarah react'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <Search className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2">Search</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4">
          {demoResults.length > 0 ? (
            <>
              <div className="grid gap-4">
                {demoResults.map((user) => (
                  <DemoUserCard key={user.id} user={user} />
                ))}
              </div>
              <div className="text-center pt-8">
                <p className="text-muted-foreground mb-4">
                  Want to see more results and unlock powerful features?
                </p>
                <Button size="lg" className="bg-primary">
                  Sign Up for Full Access
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No results found. Try a different search term.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function DemoUserCard({ user }: { user: GitHubUser }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <img
            src={user.avatar_url}
            alt={`${user.login}'s avatar`}
            className="w-16 h-16 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">
                {user.name || user.login}
              </h3>
              {user.login && (
                <a
                  href={`https://github.com/${user.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
            </div>
            {user.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {user.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {user.location && (
                <Badge variant="secondary">
                  📍 {user.location}
                </Badge>
              )}
              {user.followers > 0 && (
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1" />
                  {user.followers} followers
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
