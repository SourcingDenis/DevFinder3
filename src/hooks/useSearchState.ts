import { useReducer, useCallback } from 'react';
import { UserSearchParams } from '@/types';
import { SortOption } from '@/components/search/SortSelect';

interface SearchState {
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalResults: number;
  currentSort: SortOption;
  saveDialogOpen: boolean;
  searchName: string;
  searchParams: UserSearchParams;
}

type SearchAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_TOTAL'; payload: number }
  | { type: 'SET_SORT'; payload: SortOption }
  | { type: 'SET_SAVE_DIALOG'; payload: boolean }
  | { type: 'SET_SEARCH_NAME'; payload: string }
  | { type: 'UPDATE_SEARCH_PARAMS'; payload: Partial<UserSearchParams> }
  | { type: 'RESET_SEARCH' };

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PAGE':
      return { 
        ...state, 
        currentPage: action.payload,
        searchParams: {
          ...state.searchParams,
          page: action.payload
        }
      };
    case 'SET_TOTAL':
      return { ...state, totalResults: action.payload };
    case 'SET_SORT':
      return { 
        ...state, 
        currentSort: action.payload,
        searchParams: {
          ...state.searchParams,
          sort: action.payload.value,
          order: action.payload.direction as UserSearchParams['order']
        }
      };
    case 'SET_SAVE_DIALOG':
      return { ...state, saveDialogOpen: action.payload };
    case 'SET_SEARCH_NAME':
      return { ...state, searchName: action.payload };
    case 'UPDATE_SEARCH_PARAMS':
      return {
        ...state,
        searchParams: {
          ...state.searchParams,
          ...action.payload
        },
        // Reset page when search params change (except for page itself)
        ...(action.payload.page ? {} : { currentPage: 1 })
      };
    case 'RESET_SEARCH':
      return {
        ...state,
        currentPage: 1,
        totalResults: 0,
        error: null,
        searchParams: {
          query: '',
          page: 1,
          per_page: 30
        }
      };
    default:
      return state;
  }
}

const DEFAULT_PER_PAGE = 30;

export function useSearchState(initialSearchParams?: Partial<UserSearchParams>) {
  const [state, dispatch] = useReducer(searchReducer, {
    isLoading: false,
    error: null,
    currentPage: initialSearchParams?.page || 1,
    totalResults: 0,
    currentSort: { label: 'Best match', value: '', direction: 'desc' },
    saveDialogOpen: false,
    searchName: '',
    searchParams: {
      query: initialSearchParams?.query || '',
      page: initialSearchParams?.page || 1,
      per_page: initialSearchParams?.per_page || DEFAULT_PER_PAGE,
      language: initialSearchParams?.language,
      locations: initialSearchParams?.locations,
      sort: initialSearchParams?.sort,
      order: initialSearchParams?.order,
      hireable: initialSearchParams?.hireable
    }
  });

  const updateSearchParams = useCallback((params: Partial<UserSearchParams>) => {
    dispatch({ type: 'UPDATE_SEARCH_PARAMS', payload: params });
  }, []);

  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const setSort = useCallback((sort: SortOption) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  }, []);

  const resetSearch = useCallback(() => {
    dispatch({ type: 'RESET_SEARCH' });
  }, []);

  return {
    state,
    dispatch,
    updateSearchParams,
    setPage,
    setSort,
    resetSearch
  };
}
