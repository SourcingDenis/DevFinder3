import { useState, useEffect, useMemo, useCallback } from 'react';
import { SearchForm } from '@/components/search/SearchForm';
import { UserList } from '@/components/user/UserList';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { useAuth } from '@/hooks/useAuth';
import { Pagination } from '@/components/ui/pagination';
import { SortSelect, type SortOption } from '@/components/search/SortSelect';
import { ExportButton } from '@/components/search/ExportButton';
import { supabase } from '@/lib/supabase';
import { searchUsers } from '@/lib/github-api';
import type { UserSearchParams } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'react-router-dom';
import { SearchHistory } from '@/components/search/SearchHistory';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';

interface SearchContainerProps {
  onSearch?: () => void;
}

export function SearchContainer({ onSearch }: SearchContainerProps) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? Number(pageParam) : 1;
  });
  const [totalResults, setTotalResults] = useState(0);
  const [currentSort, setCurrentSort] = useState<SortOption>({ 
    label: 'Best match', 
    value: '', 
    direction: 'desc' 
  });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');

  // Memoize search params with proper types
  const memoizedSearchParams = useMemo(() => ({
    query: searchParams.get('query') || '',
    language: searchParams.get('language') || undefined,
    locations: searchParams.get('locations')?.split(',').filter(Boolean),
    sort: searchParams.get('sort') || undefined,
    order: searchParams.get('order') as UserSearchParams['order'] || undefined,
    page: Number(searchParams.get('page')) || 1,
    per_page: searchParams.get('per_page') ? Number(searchParams.get('per_page')) : undefined,
    hireable: searchParams.get('hireable') ? searchParams.get('hireable') === 'true' : undefined
  }), [searchParams]);

  // Use react-query with proper error handling
  const { data, isLoading: isDataLoading } = useQuery({
    queryKey: ['users', memoizedSearchParams],
    queryFn: () => searchUsers({
      ...memoizedSearchParams,
      language: memoizedSearchParams.language || undefined,
      sort: memoizedSearchParams.sort || undefined
    }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!memoizedSearchParams.query
  });

  // Prefetch next page
  useEffect(() => {
    if (data && currentPage < Math.ceil(data.total_count / (memoizedSearchParams.per_page || 30))) {
      const nextPageParams = {
        ...memoizedSearchParams,
        page: currentPage + 1,
        language: memoizedSearchParams.language || undefined
      };
      queryClient.prefetchQuery({
        queryKey: ['users', nextPageParams],
        queryFn: () => searchUsers(nextPageParams)
      });
    }
  }, [data, currentPage, memoizedSearchParams, queryClient]);

  useEffect(() => {
    if (data) {
      setTotalResults(data.total_count);
    }
  }, [data]);

  // Centralized function to build and normalize search parameters
  const buildSearchParams = (params: Partial<Omit<UserSearchParams, 'page'>>): URLSearchParams => {
    const urlParams = new URLSearchParams();
    
    if (params.query) {
      urlParams.set('query', params.query);
    }
    if (params.language) {
      urlParams.set('language', params.language);
    }
    if (params.locations?.length) {
      urlParams.set('locations', params.locations.join(','));
    }
    if (params.sort) {
      urlParams.set('sort', params.sort);
    }
    if (params.order) {
      urlParams.set('order', params.order);
    }
    if (params.per_page) {
      urlParams.set('per_page', params.per_page.toString());
    }
    if (params.hireable !== undefined) {
      urlParams.set('hireable', params.hireable.toString());
    }
    
    return urlParams;
  };

  const handleSaveSearch = async () => {
    if (!user || !memoizedSearchParams) return;

    try {
      await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name: searchName || `Search on ${new Date().toLocaleDateString()}`,
          search_params: memoizedSearchParams
        });

      setSaveDialogOpen(false);
      toast.success('Search saved successfully');
    } catch (err) {
      console.error('Error saving search:', err);
      toast.error('Failed to save search');
    }
  };

  const handlePageChange = async (page: number) => {
    if (!memoizedSearchParams) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await searchUsers({ 
        ...memoizedSearchParams, 
        page,
        sort: currentSort.value,
        order: currentSort.direction
      });

      setCurrentPage(page);

      // Preserve existing URL parameters and update page
      const urlParams = buildSearchParams(memoizedSearchParams);
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
    if (!memoizedSearchParams) return;
    
    setCurrentSort(sortOption);
    setIsLoading(true);
    setError(null);
    
    try {
      await searchUsers({
        ...memoizedSearchParams,
        page: currentPage,
        sort: sortOption.value,
        order: sortOption.direction
      });
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((params: Partial<Omit<UserSearchParams, 'page'>>) => {
      setIsLoading(true);
      setError(null);
      setCurrentPage(1);
      onSearch?.();
      
      const urlParams = buildSearchParams(params);
      setSearchParams(urlParams);
    }, 300),
    []
  );

  const showSignInPrompt = !user && currentPage >= 3;
  const totalPages = Math.min(Math.ceil(totalResults / 10), 100); // GitHub API limits to 1000 results

  return (
    <div className="space-y-8">
      <SearchForm onSearch={debouncedSearch} />
      
      {error && (
        <div className="text-red-500 text-center p-4 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      
      {!isLoading && !data && user && (
        <div className="mt-4">
          <SearchHistory onSearch={() => {
            setIsLoading(true);
            onSearch?.();
          }} />
        </div>
      )}
      
      {isLoading || isDataLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {data && data.items.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col gap-4">
                <SortSelect
                  currentSort={currentSort}
                  onSortChange={handleSortChange}
                />
              </div>
              {memoizedSearchParams && (
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Save Search</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Search</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="searchName" className="text-sm font-medium">
                          Search Name
                        </label>
                        <Input
                          id="searchName"
                          value={searchName}
                          onChange={(e) => setSearchName(e.target.value)}
                          placeholder="Enter a name for this search"
                        />
                      </div>
                      <Button onClick={handleSaveSearch}>Save</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <ExportButton
                currentUsers={data.items}
                searchParams={memoizedSearchParams}
                disabled={isLoading}
              />
            </div>
          )}
          {data && <UserList users={data.items} />}
          {showSignInPrompt && <SignInPrompt />}
          {data && data.items.length > 0 && !showSignInPrompt && (
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