import { useCallback, useEffect, useMemo } from 'react';
import { SearchForm } from '@/components/search/SearchForm';
import { UserList } from '@/components/user/UserList';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { useAuth } from '@/hooks/useAuth';
import { Pagination } from '@/components/ui/pagination';
import { SortSelect } from '@/components/search/SortSelect';
import { ExportButton } from '@/components/search/ExportButton';
import { searchUsers } from '@/lib/github-api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'react-router-dom';
import { SearchHistory } from '@/components/search/SearchHistory';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchState } from '@/hooks/useSearchState';
import { toast } from 'react-toastify';
import type { SortOption } from '@/components/search/SortSelect';
import type { UserSearchParams } from '@/types/search';
import { supabase } from '@/lib/supabase'; // Assuming supabase is imported from somewhere

const RESULTS_PER_PAGE = 30;
const PREFETCH_THRESHOLD = 0.8;

interface SearchContainerProps {
  onSearch?: () => void;
}

export function SearchContainer({ onSearch }: SearchContainerProps) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const {
    state,
    updateSearchParams,
    setPage,
    setSort,
    dispatch
  } = useSearchState({
    query: searchParams.get('query') || '',
    language: searchParams.get('language') || undefined,
    locations: searchParams.get('locations')?.split(',').filter(Boolean),
    sort: searchParams.get('sort') || undefined,
    order: searchParams.get('order') as any || undefined,
    page: Number(searchParams.get('page')) || 1,
    per_page: RESULTS_PER_PAGE,
    hireable: searchParams.get('hireable') ? searchParams.get('hireable') === 'true' : undefined
  });

  useEffect(() => {
    const newParams = new URLSearchParams();
    Object.entries(state.searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          newParams.set(key, value.join(','));
        } else {
          newParams.set(key, String(value));
        }
      }
    });
    setSearchParams(newParams, { replace: true });
  }, [state.searchParams, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['users', state.searchParams],
    queryFn: async () => {
      try {
        return await searchUsers(state.searchParams);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Search failed';
        toast.error(message);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!state.searchParams.query && !!user
  });

  const prefetchNextPage = useCallback(() => {
    if (!data || !state.searchParams.query) return;

    const totalPages = Math.ceil(data.total_count / RESULTS_PER_PAGE);
    const nextPage = state.currentPage + 1;

    if (nextPage <= totalPages) {
      const nextPageParams = {
        ...state.searchParams,
        page: nextPage
      };

      queryClient.prefetchQuery({
        queryKey: ['users', nextPageParams],
        queryFn: () => searchUsers(nextPageParams),
        staleTime: 5 * 60 * 1000
      });
    }
  }, [data, state.currentPage, state.searchParams, queryClient]);

  useEffect(() => {
    if (data?.items) {
      const currentItemCount = data.items.length;
      if (currentItemCount >= RESULTS_PER_PAGE * PREFETCH_THRESHOLD) {
        prefetchNextPage();
      }
    }
  }, [data, prefetchNextPage]);

  const handleSaveSearch = useCallback(async () => {
    if (!user || !state.searchName.trim() || !state.searchParams.query) {
      toast.error('Please provide a name for your search');
      return;
    }

    try {
      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name: state.searchName.trim(),
          search_params: state.searchParams
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('A search with this name already exists');
        } else {
          throw error;
        }
      } else {
        toast.success('Search saved successfully');
        dispatch({ type: 'SET_SAVE_DIALOG', payload: false });
        dispatch({ type: 'SET_SEARCH_NAME', payload: '' });
      }
    } catch (error) {
      console.error('Error saving search:', error);
      toast.error('Failed to save search');
    }
  }, [user, state.searchName, state.searchParams]);

  const saveRecentSearch = useCallback(async (searchParams: UserSearchParams) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('recent_searches')
        .insert({
          query: searchParams.query,
          search_params: searchParams
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  }, [user]);

  const handleSearch = useCallback((params: Partial<UserSearchParams>) => {
    const updatedParams = {
      ...state.searchParams,
      ...params,
      page: 1 // Reset page when performing new search
    };
    updateSearchParams(updatedParams);
    saveRecentSearch(updatedParams);
    onSearch?.();
  }, [updateSearchParams, onSearch, saveRecentSearch, state.searchParams]);

  const handlePageChange = useCallback((page: number) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setPage]);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSort(sort);
  }, [setSort]);

  const renderContent = useMemo(() => {
    if (!user) {
      return <SignInPrompt />;
    }

    if (isLoading && state.searchParams.query) {
      return <LoadingSpinner />;
    }

    if (!state.searchParams.query) {
      return (
        <div className="text-center mt-8 text-gray-600">
          Enter a search query to find GitHub users
        </div>
      );
    }

    if (!data?.items?.length) {
      return (
        <div className="text-center mt-8 text-gray-600">
          No users found for your search criteria
        </div>
      );
    }

    const totalPages = Math.ceil((data?.total_count || 0) / RESULTS_PER_PAGE);

    return (
      <>
        <div className="flex justify-between items-center my-4">
          <div className="text-sm text-gray-600">
            Found {data.total_count.toLocaleString()} users
          </div>
          <div className="flex items-center gap-4">
            <SortSelect
              currentSort={state.currentSort}
              onSortChange={handleSortChange}
            />
            <ExportButton 
              currentUsers={data?.items || []}
              searchParams={state.searchParams}
              disabled={isLoading}
            />
          </div>
        </div>

        <UserList users={data.items} />

        {totalPages > 1 && (
          <Pagination
            currentPage={state.currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </>
    );
  }, [user, isLoading, data, state.searchParams.query, state.currentSort, handleSortChange, handlePageChange]);

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchForm
        onSearch={handleSearch}
      />
      
      {renderContent}

      <Dialog 
        open={state.saveDialogOpen} 
        onOpenChange={(open) => dispatch({ type: 'SET_SAVE_DIALOG', payload: open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search name"
              value={state.searchName}
              onChange={(e) => dispatch({ type: 'SET_SEARCH_NAME', payload: e.target.value })}
            />
            <Button onClick={handleSaveSearch}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <SearchHistory onSearch={handleSearch} />
    </div>
  );
}