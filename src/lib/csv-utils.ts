import { GitHubUser } from '@/types';

function guessEmail(user: GitHubUser): string {
  // Only guess if no public email is available
  if (user.email) {
    return user.email;
  }
  
  // Create a guess using username@gmail.com
  return `${user.login}@gmail.com`;
}

export interface CSVExportOptions {
  onProgress?: (progress: number) => void;
  chunkSize?: number;
}

export async function convertToCSV(
  users: GitHubUser[], 
  options: CSVExportOptions = {}
): Promise<string> {
  const { 
    onProgress = () => {}, 
    chunkSize = 50 
  } = options;

  const headers = [
    'Username',
    'Name',
    'Email',
    'Email Guess',
    'Bio',
    'Location',
    'Company',
    'Blog',
    'Public Repos',
    'Followers',
    'Following',
    'Created At',
    'Profile URL',
    'Top Language'
  ];

  // Process users in chunks to allow progress updates
  const processedRows: string[][] = [];
  
  for (let i = 0; i < users.length; i += chunkSize) {
    const chunk = users.slice(i, i + chunkSize);
    
    const chunkRows = chunk.map(user => [
      String(user.login),
      String(user.name || ''),
      String(user.email || ''),
      guessEmail(user),
      String(user.bio || '').replace(/"/g, '""'), // Escape quotes in CSV
      String(user.location || ''),
      String(user.company || ''),
      String(user.blog || ''),
      String(user.public_repos),
      String(user.followers),
      String(user.following),
      new Date(user.created_at).toLocaleDateString(),
      String(user.html_url),
      String(user.topLanguage || '')
    ]);

    processedRows.push(...chunkRows);

    // Update progress
    const progress = Math.min(100, Math.round((i + chunk.length) / users.length * 100));
    onProgress(progress);

    // Allow UI to update
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  const csvContent = [
    headers.join(','),
    ...processedRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

export function downloadCSV(
  content: string, 
  filename: string = 'github_users.csv'
): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Async wrapper for CSV export with progress tracking
export async function exportUsersToCSV(
  users: GitHubUser[], 
  options: CSVExportOptions = {}
): Promise<void> {
  const csvContent = await convertToCSV(users, options);
  downloadCSV(csvContent);
}