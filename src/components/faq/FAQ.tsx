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
    answer: "DevFinder is a powerful tool that helps you discover GitHub developers based on their skills, location, and other criteria. It's perfect for recruiters, hiring managers, and anyone looking to connect with developers."
  },
  {
    question: "Do I need to sign in?",
    answer: "Yes, you need to sign in with your GitHub account to use the search functionality. This helps us provide you with accurate results and save your searches."
  },
  {
    question: "Is DevFinder free to use?",
    answer: "Currently, DevFinder is completely free! We're working on expanding our AI capabilities and will introduce premium features in the future, but our core search functionality will remain accessible to all authenticated users."
  },
  {
    question: "How accurate are the search results?",
    answer: "Our search results are based on public GitHub data and are highly accurate. We use various signals including repositories, contributions, and user-provided information to match developers to your search criteria. We're also developing advanced AI-powered matching capabilities to make the results even more precise."
  },
  {
    question: "Can I export the search results?",
    answer: "Yes! All authenticated users can currently export their search results in CSV format, making it easy to integrate with your existing workflow tools."
  },
  {
    question: "What features are coming soon?",
    answer: "We're working on exciting AI-powered features to enhance your developer search experience. Stay tuned for advanced matching algorithms, deeper insights into developers' expertise, and more powerful search capabilities!"
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
                "w-full px-4 py-2 text-left flex justify-between items-center",
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
              <div className="px-4 py-3 bg-background/50">
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
            Ready to get started?
          </h3>
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
