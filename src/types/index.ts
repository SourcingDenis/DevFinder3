export interface UserSearchParams {
  query: string;
  language?: string;
  locations?: string[];
  page: number;
  sort?: string;
  order?: 'asc' | 'desc';
  per_page?: number;
  hireable?: boolean;
  followersMin?: number;
  followersMax?: number;
  reposMin?: number;
  reposMax?: number;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  bio?: string;
  name?: string;
  email?: string;
  location?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  company?: string;
  blog?: string;
  topLanguage?: string | null;
  hireable?: boolean;
  languages?: string[];
}

export interface SearchResponse<T> {
  items: T[];
  total_count: number;
  incomplete_results?: boolean;
}

export interface ProfileList {
  id: number;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface SavedProfile {
  id: number;
  user_id: string;
  username: string;
  email?: string | null;
  email_source?: 'public_events_commit' | 'github_profile' | 'manual_input';
  github_url?: string;
  github_data: GitHubUser;
  created_at: string;
  updated_at?: string;
  list_id?: number;
}