import { useAuth } from "@/hooks/useAuth";
import { LoggedInHero } from "./LoggedInHero";
import { ContributionParticles } from "../hero/ContributionParticles";

export function Hero() {
  const { user } = useAuth();

  if (user) {
    return <LoggedInHero />;
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16 text-center 
      bg-gradient-to-br from-primary/20 via-background to-primary/10
      dark:from-primary/30 dark:via-background/90 dark:to-primary/20
      rounded-2xl relative overflow-hidden">
      <ContributionParticles />
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
        DevFinder: Revolutionize Your GitHub User Search
      </h1>
      <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8">
        Take your GitHub user search to the next level with DevFinder—the ultimate tool for finding, filtering, and connecting with developers across the globe.
      </p>
      <div className="flex justify-center mt-8 mb-12 sm:mt-12 sm:mb-20">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          className="text-foreground w-16 sm:w-24 h-16 sm:h-24 cursor-pointer transition-transform duration-300 ease-in-out"
          style={{
            animation: 'rotate 30s linear infinite',
            transformOrigin: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.animation = 'wiggle 0.5s ease-in-out';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.animation = 'rotate 30s linear infinite';
          }}
          aria-label="GitHub Logo"
        >
          <style>{`
            @keyframes rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes wiggle {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-10deg); }
              75% { transform: rotate(10deg); }
            }
          `}</style>
          <path 
            fill="currentColor" 
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          />
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
        {/* Modern Search Experience */}
        <div className="group p-4 sm:p-6 rounded-2xl bg-card hover:bg-accent transition-colors duration-300 cursor-default">
          <div className="mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Powerful Search, Simplified</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Experience a sleek, modern interface designed for effortless GitHub user discovery. Say goodbye to clunky tools and hello to smooth, intuitive searches.</p>
        </div>

        {/* Save Searches */}
        <div className="group p-4 sm:p-6 rounded-2xl bg-card hover:bg-accent transition-colors duration-300 cursor-default">
          <div className="mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Save Your Searches</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Organize your favorite queries and access them instantly whenever you need. No more retyping or losing track of your search efforts.</p>
        </div>

        {/* CSV Export */}
        <div className="group p-4 sm:p-6 rounded-2xl bg-card hover:bg-accent transition-colors duration-300 cursor-default">
          <div className="mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Seamless CSV Exports</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Download complete search results, including user data and email contacts, in CSV format. Perfect for integrating into your existing workflows or tools.</p>
        </div>

        {/* Upcoming Features */}
        <div className="group p-4 sm:p-6 rounded-2xl bg-card hover:bg-accent transition-colors duration-300 cursor-default">
          <div className="mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Coming Soon: Smart Features</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Stay ahead with upcoming updates like personalized search alerts and outreach management compatible with Gmail and Outlook.</p>
        </div>
      </div>
    </div>
  );
}