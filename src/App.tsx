import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Home } from '@/pages/Home';
import { Search } from '@/pages/Search';
import { SavedProfiles } from "@/components/saved/SavedProfiles";
import { SavedSearches } from '@/pages/SavedSearches';
import { Settings } from '@/pages/Settings';
import { Toaster } from '@/components/ui/toaster';
import { AuthCallback } from '@/pages/auth/callback';

function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-border/40 w-full">
      <div className="container max-w-screen-2xl mx-auto px-4">
        <div className="backdrop-blur-sm bg-background/30 rounded-lg p-4 text-center text-sm text-muted-foreground">
          Built with <span className="text-red-500">❤</span> by{' '}
          <a
            href="https://sourcingdenis.live/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            @sourcingdenis
          </a>
        </div>
      </div>
    </footer>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/bookmarks" element={<SavedProfiles />} />
          <Route path="/saved-searches" element={<SavedSearches />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
