import { useState, useEffect } from 'react';
import SearchForm from '@/components/search/SearchForm';
import { UserList } from '@/components/user/UserList';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { searchUsers } from '@/lib/github-api';
import { Pagination } from '@/components/pagination/Pagination';
import { ExportButton } from '@/components/search/ExportButton';
import { SortOptions, type SortOption } from '@/components/search/SortOptions';
import { SignInPrompt } from '@/components/search/SignInPrompt';
import { useAuth } from '@/hooks/useAuth';
import type { GitHubUser, UserSearchParams } from '@/types/github';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'react-router-dom';

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
  const [lastSearchParams, setLastSearchParams] = useState<UserSearchParams | null>(null);
  const [currentSort, setCurrentSort] = useState<SortOption>({ 
    label: 'Best match', 
    value: '', 
    direction: 'desc' 
  });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [noResultsFound, setNoResultsFound] = useState(false);

  // Handle URL parameters
  useEffect(() => {
    const query = searchParams.get('query');
    const pageParam = searchParams.get('page');
    const currentPage = pageParam ? Number(pageParam) : 1;

    if (query) {
      const params: UserSearchParams = {
        q: query,
        language: searchParams.get('language') || undefined,
        locations: searchParams.get('locations')?.split(',').filter((loc): loc is string => Boolean(loc)) || [],
        sort: (searchParams.get('sort') as UserSearchParams['sort']) || undefined,
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

  const handleSearch = async (params: UserSearchParams) => {
    setIsLoading(true);
    setError(null);
    setNoResultsFound(false);
    setCurrentPage(1);

    try {
      const results = await searchUsers({
        ...params,
        page: 1
      });

      setUsers(results.items);
      setTotalResults(results.total_count);
      setNoResultsFound(results.items.length === 0);
      setLastSearchParams(params);

      // Update URL with search parameters
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('query', params.q);
      if (params.language) newSearchParams.set('language', params.language);
      if (params.locations?.length) newSearchParams.set('locations', params.locations.join(','));
      if (params.sort) newSearchParams.set('sort', params.sort);
      if (params.order) newSearchParams.set('order', params.order);
      if (params.per_page) newSearchParams.set('per_page', params.per_page.toString());
      if (params.hireable !== undefined) newSearchParams.set('hireable', params.hireable.toString());
      newSearchParams.set('page', '1');
      setSearchParams(newSearchParams);

      onSearch?.();
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
        page
      });

      setUsers(results.items);
      setTotalResults(results.total_count);
      setCurrentPage(page);

      // Update URL with new page number
      searchParams.set('page', page.toString());
      setSearchParams(searchParams);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (newSort: SortOption) => {
    if (!lastSearchParams) return;

    const params: UserSearchParams = {
      ...lastSearchParams,
      sort: newSort.value as UserSearchParams['sort'],
      order: newSort.direction,
      page: 1
    };

    setCurrentSort(newSort);
    handleSearch(params);
  };

  const handleSaveSearch = async () => {
    if (!user || !lastSearchParams || !searchName.trim()) return;

    try {
      const { error } = await supabase.from('saved_searches').insert({
        user_id: user.id,
        name: searchName.trim(),
        search_params: lastSearchParams
      });

      if (error) throw error;

      setSaveDialogOpen(false);
      setSearchName('');
    } catch (err) {
      console.error('Error saving search:', err);
      setError('Failed to save search. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <SearchForm onSearch={handleSearch} />

      {isLoading && <LoadingSpinner />}

      {error && (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      )}

      {!isLoading && !error && users.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <SortOptions currentSort={currentSort} onSortChange={handleSortChange} />
              <ExportButton currentUsers={users} searchParams={lastSearchParams} />
            </div>
            {user && lastSearchParams && (
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Save Search</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Search</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Enter a name for this search"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                    />
                    <Button onClick={handleSaveSearch} disabled={!searchName.trim()}>
                      Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <UserList users={users} searchExecuted={noResultsFound} />

          <Pagination
            currentPage={currentPage}
            totalPages={Math.min(Math.ceil(totalResults / 30), 34)}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {!isLoading && !error && noResultsFound && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No results found</p>
        </div>
      )}

      {!user && <SignInPrompt />}
    </div>
  );
}