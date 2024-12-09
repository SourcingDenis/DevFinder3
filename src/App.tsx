import { Routes, Route, Navigate, Link } from 'react-router-dom';
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
import { ReleaseNotes } from './pages/ReleaseNotes';
import { ProductRoadmap } from './pages/ProductRoadmap';
import { FAQ } from './pages/FAQ';

function Footer() {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto flex justify-center items-center space-x-4">
        <Link to="/roadmap" className="hover:text-primary transition-colors">
          Product Roadmap
        </Link>
        <Link to="/release-notes" className="hover:text-primary transition-colors">
          Release Notes
        </Link>
        <Link to="/faq" className="hover:text-primary transition-colors">
          FAQ
        </Link>
        <a 
          href="https://github.com/yourusername/devfinder" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-primary transition-colors"
        >
          GitHub
        </a>
        <a 
          href="https://twitter.com/devfinder" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-primary transition-colors"
        >
          Twitter
        </a>
        <span> {new Date().getFullYear()} DevFinder</span>
      </div>
    </footer>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full container max-w-screen-2xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/bookmarks" element={<SavedProfiles />} />
          <Route path="/saved-searches" element={<SavedSearches />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/release-notes" element={<ReleaseNotes />} />
          <Route path="/roadmap" element={<ProductRoadmap />} />
          <Route path="/faq" element={<FAQ />} />
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
