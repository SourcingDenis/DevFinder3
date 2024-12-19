import { useState, useEffect, useMemo } from 'react';
import { SearchForm } from '@/components/search/SearchForm';
import { UserCard } from '@/components/user/UserCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { useAuth } from '@/hooks/useAuth';
import { Pagination } from '@/components/ui/pagination';
import { SortSelect, type SortOption } from '@/components/search/SortSelect';
import { ExportButton } from '@/components/search/ExportButton';
import { supabase } from '@/lib/supabase';
import { getTotalCount, fetchPageDetails } from '@/lib/github-api';
import type { UserSearchParams, GitHubUser, SearchResponse } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface SearchContainerProps {
  onSearch?: (params: Partial<Omit<UserSearchParams, 'page'>>) => void;
}

export function SearchContainer({ onSearch }: SearchContainerProps) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? Number(pageParam) : 1;
  });
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

  // First query to get total count
  const totalCountQuery = useQuery({
    queryKey: ['users-count', { ...memoizedSearchParams, page: undefined }],
    queryFn: async () => {
      if (!memoizedSearchParams.query?.trim()) return null;
      return getTotalCount(memoizedSearchParams);
    },
    enabled: !!memoizedSearchParams.query?.trim() && !!user
  });

  // Second query to get page details
  const pageDetailsQuery = useQuery<SearchResponse<GitHubUser>, Error>({
    queryKey: ['users-details', memoizedSearchParams],
    queryFn: async () => {
      if (!memoizedSearchParams.query?.trim()) {
        throw new Error('No query provided');
      }
      const result = await fetchPageDetails(memoizedSearchParams);
      if (!result) {
        throw new Error('No results found');
      }
      return result;
    },
    enabled: !!memoizedSearchParams.query?.trim() && !!user && !!totalCountQuery.data
  });

  const isLoading = totalCountQuery.isLoading || pageDetailsQuery.isLoading;
  const queryError = totalCountQuery.error || pageDetailsQuery.error;
  const data = pageDetailsQuery.data ? {
    ...pageDetailsQuery.data,
    total_count: totalCountQuery.data?.total_count || 0
  } : undefined;

  // Add effect to track loading states
  useEffect(() => {
    console.log('Search state:', {
      isLoading,
      hasData: !!data,
      error: queryError,
      params: memoizedSearchParams
    });
  }, [isLoading, data, queryError, memoizedSearchParams]);

  const users = data?.items ?? [];
  const totalPages = Math.min(Math.ceil((data?.total_count || 0) / 30), 34); // GitHub API limits to 1000 results

  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Failed to fetch users');
    } else {
      setError(null);
    }
  }, [queryError]);

  // Prefetch next page
  useEffect(() => {
    if (data && currentPage < Math.ceil(data.total_count / 30)) {
      const nextPageParams = {
        ...memoizedSearchParams,
        page: currentPage + 1
      };
      queryClient.prefetchQuery({
        queryKey: ['users-details', nextPageParams],
        queryFn: () => fetchPageDetails(nextPageParams),
        staleTime: 5 * 60 * 1000
      });
    }
  }, [data, currentPage, memoizedSearchParams, queryClient]);

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

  const handleSearch = async (params: Partial<Omit<UserSearchParams, 'page'>>) => {
    if (!params.query?.trim()) {
      return;
    }

    // Reset states
    setError(null);
    setCurrentPage(1);
    
    // Call the parent's onSearch handler
    onSearch?.(params);

    // Save the recent search if user is authenticated
    if (user) {
      try {
        const { error } = await supabase
          .from('recent_searches')
          .insert({
            user_id: user.id,
            query: params.query,
            search_params: params
          });

        if (error) {
          console.error('Error saving recent search:', error);
          // Only show error toast for non-RLS policy violations
          if (!error.message.includes('policy')) {
            toast.error('Failed to save recent search');
          }
        }
      } catch (err) {
        console.error('Failed to save recent search:', err);
        // Check if it's a network error
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          toast.error('Network error: Please check your connection');
        }
      }
    }

    // Update URL parameters
    const urlParams = buildSearchParams(params);
    urlParams.set('page', '1');
    setSearchParams(urlParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    setCurrentPage(page);
  };

  const handleSortChange = (newSort: SortOption) => {
    setCurrentSort(newSort);
    const newParams = new URLSearchParams(searchParams);
    if (newSort.value) {
      newParams.set('sort', newSort.value);
      newParams.set('order', newSort.direction);
    } else {
      newParams.delete('sort');
      newParams.delete('order');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchForm onSearch={handleSearch} />
      
      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : data?.items.length ? (
        <>
          <div className="flex justify-between items-center my-4">
            <div className="text-sm text-gray-600">
              Found {data.total_count.toLocaleString()} users
            </div>
            <div className="flex gap-4">
              <SortSelect currentSort={currentSort} onSortChange={handleSortChange} />
              <ExportButton 
                currentUsers={users} 
                searchParams={memoizedSearchParams}
                disabled={isLoading} 
              />
              {user && (
                <Button onClick={() => setSaveDialogOpen(true)}>
                  Save Search
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {users.map((user: GitHubUser) => (
              <UserCard 
                key={user.id}
                user={user}
                className="mb-4"
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : data ? (
        <div className="text-center py-8 text-gray-600">
          No users found matching your search criteria
        </div>
      ) : null}

      {!user && <SignInPrompt />}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Enter a name for this search"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <Button onClick={handleSaveSearch}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}