import { memo } from 'react';
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
import { ProductRoadmap } from '@/pages/ProductRoadmap';
import { useAuth } from '@/components/auth/AuthProvider';

// Wrapper component to handle different routes based on auth status
const RootRoute = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/search" replace />;
  }
  
  return <Navigate to="/" replace />;
};

// Memoize AppContent to prevent unnecessary re-renders
const AppContent = memo(() => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full container max-w-screen-2xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/home" element={<Home isLoggedIn={true} />} />
          <Route path="/devfinder.co" element={<Home isLoggedIn={false} />} />
          <Route path="/search" element={<Search />} />
          <Route path="/bookmarks" element={<SavedProfiles />} />
          <Route path="/saved-searches" element={<SavedSearches />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/roadmap" element={<ProductRoadmap />} />
        </Routes>
      </main>
      <footer className="w-full bg-muted text-muted-foreground text-center py-4 text-sm">
        &copy; 2024 Built by <a href="https://sourcingdenis.live" target="_blank" rel="noopener noreferrer" className="hover:underline">@sourcingdenis</a>
      </footer>
    </div>
  );
});

// Memoize App to prevent unnecessary re-renders
const App = memo(() => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
});

export default App;
