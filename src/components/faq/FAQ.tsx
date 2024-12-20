import { useState, useCallback } from 'react';
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
    origin: { y: 0.7, x: 0.5 }, // Center horizontally
    spread: isMobile ? 50 : 70,
    zIndex: 9999,
    disableForReducedMotion: true
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      scalar: isMobile ? 0.7 : 1.2, // Smaller particles on mobile
    });
  }

  // Reduce number of particle systems on mobile
  if (isMobile) {
    fire(0.25, {
      spread: 40,
      startVelocity: 35,
      colors: ['#FFD700', '#FFA500', '#FF6347']
    });

    fire(0.2, {
      spread: 50,
      colors: ['#00ff00', '#0099ff', '#ff00ff']
    });

    fire(0.3, {
      spread: 60,
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
  }
};

export function FAQ() {
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleClick = useCallback((index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  }, [activeIndex]);

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Everything you need to know about DevFinder</p>
      </div>

      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="border border-border rounded-lg overflow-hidden"
          >
            <button
              onClick={() => handleClick(index)}
              className="w-full p-4 sm:p-6 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-sm sm:text-base">{item.question}</span>
              <span className={cn(
                "transform transition-transform duration-200",
                activeIndex === index ? "rotate-180" : ""
              )}>
                ▼
              </span>
            </button>
            {activeIndex === index && (
              <div className="p-4 sm:p-6 pt-0 sm:pt-0 text-sm sm:text-base text-muted-foreground">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      {!user && (
        <div className="mt-8 sm:mt-12 flex flex-col items-center justify-center">
          <p className="text-sm sm:text-base mb-4">Ready to get started?</p>
          <div 
            className="relative w-full flex justify-center group"
            onMouseEnter={() => {
              const isMobile = window.innerWidth <= 768;
              triggerConfetti(isMobile);
            }}
            onTouchStart={() => {
              const isMobile = window.innerWidth <= 768;
              triggerConfetti(isMobile);
            }}
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500" />
              {/* Button container */}
              <div className="relative">
                <AuthButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
