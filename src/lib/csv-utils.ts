import { GitHubUser } from '@/types';

export interface CSVExportOptions {
  onProgress?: (progress: number) => void;
  filename?: string;
}

export async function convertToCSV(
  users: GitHubUser[], 
  options: CSVExportOptions = {}
): Promise<string> {
  const { 
    onProgress = () => {}, 
  } = options;

  const headers = [
    'Username',
    'Name',
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

  // Use a string builder approach for better memory efficiency
  const rows: string[] = [headers.join(',')];
  const totalUsers = users.length;
  const chunkSize = 50;
  
  try {
    for (let i = 0; i < totalUsers; i += chunkSize) {
      const chunk = users.slice(i, i + chunkSize);
      
      for (const user of chunk) {
        const row = [
          user.login,
          (user.name || '').replace(/"/g, '""'),
          (user.bio || '').replace(/"/g, '""'),
          (user.location || '').replace(/"/g, '""'),
          (user.company || '').replace(/"/g, '""'),
          user.blog || '',
          user.public_repos.toString(),
          user.followers.toString(),
          user.following.toString(),
          new Date(user.created_at).toLocaleDateString(),
          user.html_url,
          user.topLanguage || ''
        ].map(value => `"${value}"`).join(',');

        rows.push(row);
      }

      // Update progress
      const progress = Math.min(100, Math.round((i + chunk.length) / totalUsers * 100));
      onProgress(progress);

      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    return rows.join('\n');
  } catch (error) {
    console.error('Error converting users to CSV:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to convert users to CSV: ${error.message}`
        : 'Failed to convert users to CSV'
    );
  } finally {
    onProgress(100);
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
    filename = 'github_users.csv'
  } = options;

  try {
    // Input validation
    if (!users?.length) {
      throw new Error('No users to export');
    }

    // Create a wrapper for progress to handle both conversion and download
    let conversionComplete = false;
    const progressTracker = (progress: number) => {
      // Scale progress to 90% for conversion, leaving 10% for download
      const scaledProgress = conversionComplete ? 90 + (progress * 0.1) : progress * 0.9;
      onProgress(Math.round(scaledProgress));
    };

    // Convert to CSV
    const csvContent = await convertToCSV(users, { 
      onProgress: progressTracker 
    });
    conversionComplete = true;

    // Validate CSV content
    if (!csvContent?.trim()) {
      throw new Error('Generated CSV is empty');
    }

    // Download CSV
    try {
      downloadCSV(csvContent, filename);
      progressTracker(100);
    } catch (downloadError) {
      throw new Error(
        downloadError instanceof Error 
          ? `Failed to download CSV: ${downloadError.message}`
          : 'Failed to download CSV'
      );
    }
  } catch (error) {
    console.error('CSV export failed:', error);
    throw new Error(
      error instanceof Error 
        ? `Export failed: ${error.message}`
        : 'Export failed: Unknown error'
    );
  }
}