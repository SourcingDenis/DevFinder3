import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  Rocket, 
  Star 
} from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

type FAQCategory = {
  title: string;
  icon: React.ElementType;
  questions: {
    question: string;
    answer: string | string[];
  }[];
};

export const FAQ: React.FC = () => {
  const faqCategories: FAQCategory[] = [
    {
      title: 'Search Functionality',
      icon: Search,
      questions: [
        {
          question: "What makes DevFinder's search different from other developer search platforms?",
          answer: [
            "DevFinder offers an advanced, intelligent search algorithm that goes beyond simple keyword matching.",
            "Our search supports complex, multi-parameter queries that allow you to find developers with extremely specific skill combinations.",
            "We use intelligent matching that considers not just exact skills, but related technologies and expertise levels."
          ]
        },
        {
          question: "How precise are the search results?",
          answer: [
            "Our search algorithm provides near-surgical precision in developer discovery.",
            "You can filter developers by multiple criteria simultaneously:",
            "- Programming languages",
            "- Framework expertise",
            "- Years of experience",
            "- Geographic location",
            "- Open-source contributions",
            "- Technology stack preferences"
          ]
        },
        {
          question: "Can I save and reuse my search queries?",
          answer: [
            "Absolutely! DevFinder allows you to:",
            "- Save complex search configurations",
            "- Export and import search queries",
            "- Create personalized search collections",
            "- Quickly revisit and modify previous searches"
          ]
        }
      ]
    },
    {
      title: 'GitHub Integration',
      icon: Github,
      questions: [
        {
          question: "How does GitHub authentication work?",
          answer: [
            "DevFinder provides a seamless, secure GitHub OAuth authentication process:",
            "- One-click login using your GitHub credentials",
            "- Automatic profile information retrieval",
            "- Secure, token-based authentication",
            "- No need to manually enter profile details"
          ]
        },
        {
          question: "What GitHub data can I access?",
          answer: [
            "We retrieve comprehensive GitHub profile information:",
            "- Public repositories",
            "- Contribution history",
            "- Technology stack",
            "- Open-source project involvement",
            "- Detailed activity metrics"
          ]
        }
      ]
    },
    {
      title: 'Profile Management',
      icon: Save,
      questions: [
        {
          question: "How can I save and manage developer profiles?",
          answer: [
            "DevFinder offers robust profile management:",
            "- Save unlimited developer profiles",
            "- Add personal notes and tags",
            "- Organize profiles into custom collections",
            "- Quick access to saved profiles",
            "- Local secure storage"
          ]
        },
        {
          question: "Can I export or share saved profiles?",
          answer: [
            "Profile export and sharing features are currently in development.",
            "Future updates will include:",
            "- CSV/JSON export",
            "- Shareable profile links",
            "- Team collaboration features"
          ]
        }
      ]
    },
    {
      title: 'Pricing & Access',
      icon: DollarSign,
      questions: [
        {
          question: "Is DevFinder currently free?",
          answer: [
            "Yes, DevFinder is completely free during our initial launch phase.",
            "We are committed to providing value to our early users."
          ]
        },
        {
          question: "What are your future pricing plans?",
          answer: [
            "We plan to introduce tiered pricing with the following model:",
            "- Free Tier: Basic search and profile management",
            "- Pro Tier: Advanced search, unlimited saves, priority support",
            "- Enterprise Tier: Custom integrations, team features, dedicated support",
            "Pricing will be transparently communicated before implementation."
          ]
        },
        {
          question: "Will existing features remain free?",
          answer: [
            "Our core search, GitHub authentication, and basic profile management will remain free.",
            "Advanced features will be available in paid tiers.",
            "We prioritize providing value to our community."
          ]
        }
      ]
    },
    {
      title: 'General Questions',
      icon: HelpCircle,
      questions: [
        {
          question: "How often is DevFinder updated?",
          answer: [
            "We release updates monthly, with:",
            "- New features",
            "- Performance improvements",
            "- Bug fixes",
            "Check our Roadmap and Release Notes for the latest updates!"
          ]
        },
        {
          question: "How do you ensure data privacy?",
          answer: [
            "Data privacy is our top priority:",
            "- We only access publicly available GitHub data",
            "- Secure OAuth authentication",
            "- No storage of sensitive personal information",
            "- Compliance with GitHub API terms of service",
            "- Transparent data handling practices"
          ]
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          DevFinder Frequently Asked Questions
        </h1>
        
        <div className="max-h-[800px] overflow-y-auto">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="mb-6">
              <CardHeader className="flex flex-row items-center space-x-4">
                <category.icon className="w-6 h-6 text-primary" />
                <CardTitle>{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`item-${categoryIndex}-${faqIndex}`}
                    >
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>
                        {Array.isArray(faq.answer) ? (
                          <ul className="list-disc pl-5 space-y-2">
                            {faq.answer.map((line, lineIndex) => (
                              <li key={lineIndex}>{line}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{faq.answer}</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center text-muted-foreground italic">
          Have a question not answered here? 
          <br />
          Reach out to us at support@devfinder.com
        </div>
      </div>
    </div>
  );
};
