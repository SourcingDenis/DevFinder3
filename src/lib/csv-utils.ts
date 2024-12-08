import { GitHubUser } from '@/types/github';

export interface CSVExportOptions {
  onProgress?: (progress: number) => void;
  chunkSize?: number;
  filename?: string;
}

function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
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
    'Location',
    'Company',
    'Bio',
    'Public Repos',
    'Followers',
    'Following',
    'Created At',
    'Profile URL',
  ];

  // Process users in chunks to allow progress updates
  const processedRows: string[][] = [];
  
  try {
    for (let i = 0; i < users.length; i += chunkSize) {
      const chunk = users.slice(i, i + chunkSize);
      
      const chunkRows = chunk.map(user => [
        user.login,
        user.name || '',
        user.email || '',
        user.location || '',
        user.company || '',
        user.bio || '',
        user.public_repos.toString(),
        user.followers.toString(),
        user.following.toString(),
        new Date(user.created_at).toLocaleDateString(),
        user.html_url,
      ]);

      processedRows.push(...chunkRows);

      // Update progress
      const progress = Math.min(100, Math.round((i + chunk.length) / users.length * 100));
      onProgress(progress);

      // Allow UI to update and prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const csvContent = [
      headers.join(','),
      ...processedRows.map(row => row.map(escapeCSVField).join(','))
    ].join('\n');

    return csvContent;
  } catch (error) {
    console.error('Error converting users to CSV:', error);
    onProgress(100); // Ensure progress callback is called even on error
    throw error; // Rethrow to allow caller to handle
  }
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
  
  // Revoke the URL to free up memory
  URL.revokeObjectURL(url);
}

export async function exportUsersToCSV(
  users: GitHubUser[], 
  options: CSVExportOptions = {}
): Promise<void> {
  const { 
    onProgress = () => {}, 
    chunkSize = 50,
    filename = 'github_users.csv'
  } = options;

  try {
    // Validate input
    if (!users || users.length === 0) {
      throw new Error('No users to export');
    }

    // Track overall progress
    const progressTracker = (progress: number) => {
      console.log(`Export progress: ${progress}%`);
      onProgress(progress);
    };

    const csvContent = await convertToCSV(users, { 
      ...options, 
      onProgress: progressTracker 
    });

    // Validate CSV content
    if (!csvContent || csvContent.trim().length === 0) {
      throw new Error('Generated CSV is empty');
    }

    // Download CSV with custom filename
    downloadCSV(csvContent, filename);
  } catch (error) {
    console.error('CSV export failed:', error);
    
    // Provide user-friendly error handling
    onProgress(100); // Ensure progress is completed
    throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}