import { useState, useEffect } from 'react';
import { SearchContainer } from '@/components/search/SearchContainer';
import { SavedProfiles } from '@/components/saved/SavedProfiles';
import { SavedSearches } from '@/components/saved/SavedSearches';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/layout/Hero';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [hasSearched, setHasSearched] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If there are search params in the URL, switch to search tab
    if (location.search) {
      setActiveTab('search');
      setHasSearched(true);
    }
  }, [location.search]);

  const handleSearch = (): void => {
    setHasSearched(true);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Header />
          {!hasSearched && !user && <Hero />}
          <main className="container max-w-screen-2xl py-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="inline-flex h-10 items-center space-x-1 rounded-none border-b border-border/40 bg-transparent p-0">
                <TabsTrigger 
                  value="search" 
                  className="inline-flex items-center justify-center whitespace-nowrap border-b-2 border-transparent px-3 py-1.5 text-sm font-medium ring-offset-background transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                >
                  Search
                </TabsTrigger>
                <TabsTrigger 
                  value="saved-profiles" 
                  className="inline-flex items-center justify-center whitespace-nowrap border-b-2 border-transparent px-3 py-1.5 text-sm font-medium ring-offset-background transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                >
                  Saved Profiles
                </TabsTrigger>
                <TabsTrigger 
                  value="saved-searches" 
                  className="inline-flex items-center justify-center whitespace-nowrap border-b-2 border-transparent px-3 py-1.5 text-sm font-medium ring-offset-background transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                >
                  Saved Searches
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="mt-6">
                <SearchContainer onSearch={handleSearch} />
              </TabsContent>

              <TabsContent value="saved-profiles" className="mt-6">
                <SavedProfiles />
              </TabsContent>

              <TabsContent value="saved-searches" className="mt-6">
                <SavedSearches />
              </TabsContent>
            </Tabs>
          </main>
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
