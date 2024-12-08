export interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  avatar_url: string;
  html_url: string;
  bio?: string;
  blog?: string;
  company?: string;
  location?: string;
  email?: string;
  hireable?: boolean;
  twitter_username?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  languages?: string[];
  topLanguage?: string | null;
  available_for_hire?: boolean;
}

export interface UserSearchParams {
  q: string;
  query?: string;
  location?: string;
  locations?: string[];
  language?: string;
  sort?: 'followers' | 'repositories' | 'joined';
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
  hireable?: boolean;
  followersMin?: number;
  followersMax?: number;
  reposMin?: number;
  reposMax?: number;
}

export interface SavedProfile {
  id: string;
  user_id: string;
  github_username: string;
  created_at: string;
  github_data: GitHubUser;
}

export interface SearchResponse<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}
