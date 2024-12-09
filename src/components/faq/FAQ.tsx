import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AuthButton } from '@/components/auth/AuthButton';
import { useAuth } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What is DevFinder?",
    answer: "DevFinder is a powerful GitHub user search tool designed to help you discover and connect with developers worldwide."
  },
  {
    question: "Do I need to sign in?",
    answer: "Yes, you'll need to sign in with your GitHub account to unlock DevFinder's full potential."
  },
  {
    question: "Is DevFinder free to use?",
    answer: "Absolutely! You can start using DevFinder for free. Advanced features may be added in the future."
  },
  {
    question: "How accurate are the search results?",
    answer: "Our tool leverages GitHub's API for real-time data, ensuring you get up-to-date and reliable results."
  },
  {
    question: "Can I export the search results?",
    answer: "Yes! Authenticated users can export search results in CSV format, complete with user data and email contacts."
  },
  {
    question: "What features are coming soon?",
    answer: "Upcoming features include search alerts to keep you informed and outreach management tools for streamlined communication."
  }
];

const triggerConfetti = (isMobile = false) => {
  // Reduce particle count for mobile devices
  const count = isMobile ? 100 : 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      scalar: isMobile ? 0.8 : 1.2, // Smaller particles on mobile
    });
  }

  // Reduce number of particle systems on mobile
  if (isMobile) {
    fire(0.25, {
      spread: 26,
      startVelocity: 45,
      colors: ['#FFD700', '#FFA500', '#FF6347']
    });

    fire(0.2, {
      spread: 60,
      colors: ['#00ff00', '#0099ff', '#ff00ff']
    });

    fire(0.3, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#ffffff', '#f0f0f0']
    });
  } else {
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#FFD700', '#FFA500', '#FF6347']
    });

    fire(0.2, {
      spread: 60,
      colors: ['#00ff00', '#0099ff', '#ff00ff']
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#ffffff', '#f0f0f0', '#d0d0d0']
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#00ff00', '#0099ff', '#ff00ff']
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#FFD700', '#FFA500', '#FF6347']
    });
  }
};

export function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { user } = useAuth();

  const handleInteraction = useCallback(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    triggerConfetti(isMobile);
  }, []);

  // Don't render FAQ if user is authenticated
  if (user) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="border border-border rounded-lg overflow-hidden"
          >
            <Button
              variant="ghost"
              className={cn(
                "w-full px-6 py-4 text-left flex justify-between items-center",
                "hover:bg-accent hover:text-accent-foreground",
                expandedIndex === index && "bg-accent text-accent-foreground"
              )}
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <span className="font-medium">{item.question}</span>
              <svg
                className={cn(
                  "w-5 h-5 transition-transform",
                  expandedIndex === index ? "transform rotate-180" : ""
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
            {expandedIndex === index && (
              <div className="px-6 py-5 bg-background/50">
                <p className="text-muted-foreground">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sign In Section with increased spacing */}
      <div className="mt-24 pt-12 border-t border-border/10">
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            Ready to Get Started?
          </h3>
          <p className="text-muted-foreground mb-6">
            Discover the developers you need—fast.
          </p>
          <div 
            className="inline-block group"
            onMouseEnter={handleInteraction}
            onTouchStart={handleInteraction}
            role="button"
            tabIndex={0}
          >
            <div className="relative">
              {/* Glow effect container */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-0 group-hover:opacity-100 group-active:opacity-100 transition duration-500"></div>
              {/* Button container */}
              <div className="relative">
                <AuthButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
