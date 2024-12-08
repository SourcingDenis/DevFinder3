import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FAQItem {
  id: string;
  question: string;
  answer: string[];
}

const faqItems: FAQItem[] = [
  {
    id: "search-optimization",
    question: "How can I optimize my developer searches?",
    answer: [
      "Use specific technical skills rather than generic terms (e.g., \"React Native\" instead of just \"mobile\")",
      "Combine location filters with timezone preferences for better remote team fits",
      "Save successful search queries for consistent talent sourcing",
      "Use the AI-powered search to find developers with specific project experience"
    ]
  },
  {
    id: "saved-profiles",
    question: "What's the best way to organize saved profiles?",
    answer: [
      "Create custom tags for different projects or roles",
      "Use the notes feature to track important details about each developer",
      "Regularly review and update profile statuses",
      "Export filtered lists for team collaboration"
    ]
  },
  {
    id: "search-alerts",
    question: "How do I set up effective search alerts?",
    answer: [
      "Set frequency based on how quickly you need to respond to new matches",
      "Use precise criteria to avoid alert fatigue",
      "Combine multiple skills with AND/OR operators for targeted results",
      "Set up different alerts for different seniority levels or roles"
    ]
  },
  {
    id: "keyboard-shortcuts",
    question: "What keyboard shortcuts can speed up my workflow?",
    answer: [
      "Press ⌘ + K to open the command palette",
      "Use ⌘ + S to save a profile",
      "Press ⌘ + F to quickly filter results",
      "Use ⌘ + → to navigate through search results"
    ]
  },
  {
    id: "data-export",
    question: "How can I export and use my developer data?",
    answer: [
      "Export to CSV for spreadsheet analysis",
      "Use the API integration for custom workflows",
      "Schedule automated exports for regular reporting",
      "Filter exports by date range or search criteria"
    ]
  }
];

export function AuthUserFAQ() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div className="py-8">
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-bold">Tips & Tricks</h2>
        <p className="text-muted-foreground">
          Make the most of DevFinder with these helpful insights
        </p>
      </div>
      
      <div className="space-y-4">
        {faqItems.map((item) => (
          <Card key={item.id}>
            <CardHeader className="p-4">
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center"
                onClick={() => setOpenItem(openItem === item.id ? null : item.id)}
              >
                <CardTitle className="text-left text-base">{item.question}</CardTitle>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                    openItem === item.id ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CardHeader>
            {openItem === item.id && (
              <CardContent className="px-4 pb-4">
                <ul className="list-disc pl-6 space-y-2">
                  {item.answer.map((point, index) => (
                    <li key={index} className="text-sm">{point}</li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
