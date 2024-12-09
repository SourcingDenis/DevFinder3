import { useState, useEffect } from 'react';
import { SearchForm } from '@/components/search/SearchForm';
import { UserList } from '@/components/user/UserList';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { searchUsers } from '@/lib/github-api';
import { Pagination } from '@/components/pagination/Pagination';
import { ExportButton } from '@/components/search/ExportButton';
import { SortOptions, type SortOption } from '@/components/search/SortOptions';
import { SignInPrompt } from '@/components/search/SignInPrompt';
import { useAuth } from '@/components/auth/AuthProvider';
import type { GitHubUser, UserSearchParams } from '@/types';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'react-router-dom';
import { SearchHistory } from '@/components/search/SearchHistory';

interface SearchContainerProps {
  onSearch?: () => void;
}

export function SearchContainer({ onSearch }: SearchContainerProps) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<GitHubUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    // Initialize current page from URL or default to 1
    const pageParam = searchParams.get('page');
    return pageParam ? Number(pageParam) : 1;
  });
  const [totalResults, setTotalResults] = useState(0);
  const [lastSearchParams, setLastSearchParams] = useState<Omit<UserSearchParams, 'page'> | null>(null);
  const [currentSort, setCurrentSort] = useState<SortOption>({ 
    label: 'Best match', 
    value: '', 
    direction: 'desc' 
  });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [noResultsFound, setNoResultsFound] = useState(false);

  // Centralized function to build and normalize search parameters
  const buildSearchParams = (params: Partial<Omit<UserSearchParams, 'page'>>): URLSearchParams => {
    const urlParams = new URLSearchParams();
    
    // Ensure query is always set, defaulting to a space if empty
    urlParams.set('query', params.query?.trim() || ' ');
    
    // Conditionally add other parameters with type checking
    if (params.language) urlParams.set('language', params.language);
    if (params.locations?.length) urlParams.set('locations', params.locations.join(','));
    if (params.sort) urlParams.set('sort', params.sort);
    if (params.order) urlParams.set('order', params.order);
    if (params.per_page) urlParams.set('per_page', params.per_page.toString());
    if (params.hireable !== undefined) urlParams.set('hireable', params.hireable.toString());
    
    // Always reset to first page when building new search params
    urlParams.set('page', '1');
    
    return urlParams;
  };

  const handleSaveSearch = async () => {
    if (!user || !lastSearchParams) return;

    try {
      await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name: searchName || `Search on ${new Date().toLocaleDateString()}`,
          search_params: lastSearchParams
        });

      setSaveDialogOpen(false);
      setSearchName('');
      
      // Optional: Show a toast or notification that search was saved
    } catch (error) {
      console.error('Error saving search:', error);
      // Optional: Show error notification
    }
  };

  // Handle URL parameters
  useEffect(() => {
    const query = searchParams.get('query');
    const pageParam = searchParams.get('page');
    const currentPage = pageParam ? Number(pageParam) : 1;

    if (query) {
      const params: UserSearchParams = {
        query,
        language: searchParams.get('language') || undefined,
        locations: searchParams.get('locations')?.split(',').filter((loc): loc is string => Boolean(loc)) || [],
        sort: searchParams.get('sort') || undefined,
        order: (searchParams.get('order') as UserSearchParams['order']) || undefined,
        page: currentPage,
        per_page: searchParams.get('per_page') ? Number(searchParams.get('per_page')) : undefined,
        hireable: searchParams.get('hireable') ? searchParams.get('hireable') === 'true' : undefined
      };

      // Update sort if present in URL
      if (params.sort && params.order) {
        setCurrentSort({
          label: params.sort.charAt(0).toUpperCase() + params.sort.slice(1),
          value: params.sort,
          direction: params.order
        });
      }

      // Perform search with the current page
      const searchWithPage = async () => {
        setIsLoading(true);
        try {
          const results = await searchUsers(params);
          
          setUsers(results.items);
          setTotalResults(results.total_count);
          setCurrentPage(currentPage);
          
          // Separate the page from other search params
          const { page, ...searchParamsWithoutPage } = params;
          setLastSearchParams(searchParamsWithoutPage);
        } catch (err) {
          setError('Failed to fetch users. Please try again.');
          console.error('Error fetching users:', err);
        } finally {
          setIsLoading(false);
        }
      };

      searchWithPage();
    }
  }, [searchParams]);

  const handleSearch = async (params: Partial<Omit<UserSearchParams, 'page'>>) => {
    setIsLoading(true);
    setError(null);
    setNoResultsFound(false);
    setCurrentPage(1);
    onSearch?.();
    
    // Build comprehensive search query
    let searchQuery = '';
    if (params.query) {
      searchQuery += params.query;
    }
    if (params.language) {
      searchQuery += ` language:${params.language}`;
    }
    
    // MODIFICATION: Deduplicate locations
    const uniqueLocations = params.locations ? [...new Set(params.locations)] : [];
    if (uniqueLocations.length) {
      searchQuery += ` ${uniqueLocations.map(loc => `location:${loc}`).join(' ')}`;
    }

    const searchParams: Omit<UserSearchParams, 'page'> = {
      query: searchQuery.trim() || ' ',
      sort: params.sort || currentSort.value,
      order: params.order || currentSort.direction,
      locations: uniqueLocations, // Use deduplicated locations
      language: params.language,
      per_page: params.per_page,
      hireable: params.hireable
    };
    
    setLastSearchParams(searchParams);
    
    // Use centralized parameter building
    const urlParams = buildSearchParams(searchParams);
    setSearchParams(urlParams);
    
    try {
      // Save to recent searches if user is logged in
      if (user && params.query) {
        await supabase
          .from('recent_searches')
          .insert({
            user_id: user.id,
            query: params.query,
            search_params: searchParams
          })
          .select();
      }

      const { items: searchResults, total_count } = await searchUsers({ 
        ...searchParams,
        page: 1
      });
      
      setUsers(searchResults);
      setTotalResults(total_count);
      setNoResultsFound(searchResults.length === 0 && total_count === 0);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    if (!lastSearchParams) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await searchUsers({ 
        ...lastSearchParams, 
        page,
        sort: currentSort.value,
        order: currentSort.direction
      });
      setUsers(results.items);
      setCurrentPage(page);

      // Preserve existing URL parameters and update page
      const urlParams = buildSearchParams(lastSearchParams);
      urlParams.set('page', page.toString());
      setSearchParams(urlParams);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = async (sortOption: SortOption) => {
    if (!lastSearchParams) return;
    
    setCurrentSort(sortOption);
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await searchUsers({
        ...lastSearchParams,
        page: currentPage,
        sort: sortOption.value,
        order: sortOption.direction
      });
      setUsers(results.items);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showSignInPrompt = !user && currentPage >= 3 && users.length > 0;
  const totalPages = Math.min(Math.ceil(totalResults / 10), 100); // GitHub API limits to 1000 results

  return (
    <div className="space-y-8">
      <SearchForm onSearch={handleSearch} />
      
      {error && (
        <div className="text-red-500 text-center p-4 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      
      {!isLoading && users.length === 0 && user && (
        <div className="mt-4">
          <SearchHistory onSearch={() => {
            setUsers([]);
            setIsLoading(true);
            onSearch?.();
          }} />
        </div>
      )}
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {users.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  {/* Removed Available for hire checkbox */}
                </div>
                <SortOptions
                  currentSort={currentSort}
                  onSortChange={handleSortChange}
                />
              </div>
              {lastSearchParams && (
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Save Search</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Search</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label htmlFor="searchName" className="block text-sm font-medium text-gray-700">
                          Search Name
                        </label>
                        <Input
                          id="searchName"
                          value={searchName}
                          onChange={(e) => setSearchName(e.target.value)}
                          placeholder="Enter a name for this search"
                          className="mt-1"
                        />
                      </div>
                      <Button
                        onClick={handleSaveSearch}
                      >
                        Save
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <ExportButton
                currentUsers={users}
                searchParams={lastSearchParams}
                disabled={isLoading}
              />
            </div>
          )}
          <UserList users={users} searchExecuted={noResultsFound} />
          {showSignInPrompt && <SignInPrompt />}
          {users.length > 0 && !showSignInPrompt && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}