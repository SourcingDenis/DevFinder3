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
import { ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';

// RequireAuth component to wrap routes that require authentication
const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Memoize AppContent to prevent unnecessary re-renders
const AppContent = memo(() => {
  const { user, loading } = useAuth();

  // Show a loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full container max-w-screen-2xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/home" replace /> : <Home />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/roadmap" element={user ? <Navigate to="/home" replace /> : <ProductRoadmap />} />
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/search" element={<RequireAuth><Search /></RequireAuth>} />
          <Route path="/saved-profiles" element={<RequireAuth><SavedProfiles /></RequireAuth>} />
          <Route path="/saved-searches" element={<RequireAuth><SavedSearches /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        </Routes>
      </main>
      <footer className="w-full bg-muted text-muted-foreground text-center py-4 text-sm">
        &copy; 2024 Built by <a href="https://sourcingdenis.live" target="_blank" rel="noopener noreferrer" className="hover:underline">@sourcingdenis</a>
      </footer>
    </div>
  );
});

AppContent.displayName = 'AppContent';

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
