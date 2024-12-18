export interface UserSearchParams {
  query: string;
  language?: string;
  locations?: string[];
  sort?: string;
  order?: 'asc' | 'desc';
  page: number;
  per_page?: number;
  hireable?: boolean;
  followersMin?: number;
  followersMax?: number;
  reposMin?: number;
  reposMax?: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  search_params: UserSearchParams;
  created_at: string;
  updated_at: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  search_params: UserSearchParams;
  created_at: string;
  updated_at: string;
}
