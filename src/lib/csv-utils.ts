import { GitHubUser } from '@/types/github';

export interface CSVExportOptions {
  onProgress?: (progress: number) => void;
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
  const { onProgress = () => {} } = options;
  const batchSize = 50;

  const headers = [
    'Username',
    'Name',
    'Email',
    'Location',
    'Company',
    'Bio',
    'Public Repos',
    'Public Gists',
    'Followers',
    'Following',
    'Created At',
    'Updated At',
    'Profile URL',
  ];

  // Process users in chunks to allow progress updates
  const processedRows: string[][] = [];
  
  try {
    for (let i = 0; i < users.length; i += batchSize) {
      const chunk = users.slice(i, i + batchSize);
      
      const chunkRows = chunk.map(user => [
        user.login,
        user.name || '',
        user.email || '',
        user.location || '',
        user.company || '',
        user.bio || '',
        user.public_repos.toString(),
        user.public_gists.toString(),
        user.followers.toString(),
        user.following.toString(),
        user.created_at,
        user.updated_at,
        user.html_url,
      ]);
      
      processedRows.push(...chunkRows);
      
      // Report progress
      onProgress((i + chunk.length) / users.length * 100);
    }
    
    // Convert all rows to CSV format
    const csvRows = [
      headers,
      ...processedRows
    ].map(row => row.map(escapeCSVField).join(','));
    
    return csvRows.join('\n');
  } catch (error) {
    console.error('Error converting users to CSV:', error);
    throw error;
  }
}

function downloadCSV(content: string, filename: string = 'github_users.csv'): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export async function exportUsersToCSV(
  users: GitHubUser[],
  filename: string = 'github_users.csv',
  onProgress?: (progress: number) => void
): Promise<void> {
  try {
    const csvContent = await convertToCSV(users, { 
      onProgress,
      filename 
    });
    downloadCSV(csvContent, filename);
  } catch (error) {
    console.error('Error exporting users to CSV:', error);
    throw error;
  }
}