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
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function Footer() {
  return (
    <footer className="mt-auto py-6 md:py-12 border-t border-border/20 w-full 
      bg-gradient-to-br 
      from-primary/20 via-background to-primary/10
      dark:from-primary/30 dark:via-background/90 dark:to-primary/20
      backdrop-blur-sm 
      shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(255,255,255,0.05)]
      relative z-10">
      <div className="container max-w-screen-2xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Company Section */}
          <div className="bg-background/10 dark:bg-background/20 p-4 md:p-6 rounded-xl border border-border/20 space-y-2 md:space-y-4 
            hover:bg-background/15 dark:hover:bg-background/25 
            transition-colors duration-300 ease-in-out">
            <div className="flex items-center space-x-3 mb-2 md:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" md:width="32" md:height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
              <h4 className="font-bold text-lg md:text-xl text-foreground">DevFinder</h4>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Revolutionizing talent discovery through intelligent networking and insights.
            </p>
          </div>

          {/* Product Section */}
          <div className="bg-background/10 dark:bg-background/20 p-4 md:p-6 rounded-xl border border-border/20 space-y-2 md:space-y-4
            hover:bg-background/15 dark:hover:bg-background/25 
            transition-colors duration-300 ease-in-out">
            <h4 className="font-semibold text-base md:text-lg text-foreground mb-2 md:mb-4">Product</h4>
            <nav className="space-y-1 md:space-y-2">
              {[
                { href: "/roadmap", label: "Product Roadmap", icon: "🗺️" },
                { href: "/release-notes", label: "Release Notes", icon: "📝" },
                { href: "/feature-requests", label: "Feature Requests", icon: "💡" }
              ].map(({ href, label, icon }) => (
                <a 
                  key={href}
                  href={href} 
                  className="group flex items-center space-x-2 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out"
                >
                  <span className="transform group-hover:scale-110 inline-block text-sm">{icon}</span>
                  <span className="relative">
                    {label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ease-in-out group-hover:w-full"></span>
                  </span>
                </a>
              ))}
            </nav>
          </div>

          {/* Support Section */}
          <div className="bg-background/10 dark:bg-background/20 p-4 md:p-6 rounded-xl border border-border/20 space-y-2 md:space-y-4
            hover:bg-background/15 dark:hover:bg-background/25 
            transition-colors duration-300 ease-in-out">
            <h4 className="font-semibold text-base md:text-lg text-foreground mb-2 md:mb-4">Support</h4>
            <nav className="space-y-1 md:space-y-2">
              {[
                { href: "/contact", label: "Get in Touch", icon: "📞" },
                { href: "/faq", label: "FAQ", icon: "❓" },
                { href: "/help", label: "Help Center", icon: "🆘" }
              ].map(({ href, label, icon }) => (
                <a 
                  key={href}
                  href={href} 
                  className="group flex items-center space-x-2 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out"
                >
                  <span className="transform group-hover:scale-110 inline-block text-sm">{icon}</span>
                  <span className="relative">
                    {label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ease-in-out group-hover:w-full"></span>
                  </span>
                </a>
              ))}
            </nav>
          </div>

          {/* Legal Section */}
          <div className="bg-background/10 dark:bg-background/20 p-4 md:p-6 rounded-xl border border-border/20 space-y-2 md:space-y-4
            hover:bg-background/15 dark:hover:bg-background/25 
            transition-colors duration-300 ease-in-out">
            <h4 className="font-semibold text-base md:text-lg text-foreground mb-2 md:mb-4">Legal</h4>
            <nav className="space-y-1 md:space-y-2">
              {[
                { href: "/privacy", label: "Privacy Policy", icon: "🔒" },
                { href: "/terms", label: "Terms of Service", icon: "📜" }
              ].map(({ href, label, icon }) => (
                <a 
                  key={href}
                  href={href} 
                  className="group flex items-center space-x-2 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out"
                >
                  <span className="transform group-hover:scale-110 inline-block text-sm">{icon}</span>
                  <span className="relative">
                    {label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ease-in-out group-hover:w-full"></span>
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </div>
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
