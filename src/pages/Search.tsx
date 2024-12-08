import { SearchContainer } from '@/components/search/SearchContainer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTriggerNoIcon,
} from "@/components/ui/accordion";
import { LightbulbIcon, Search as SearchIcon, MapPin, Code2, X, Star, GitBranch, Users } from "lucide-react";
import { useSearchTips } from '@/hooks/useSearchTips';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Search() {
  const { isVisible, isExpanded, setIsExpanded, hidePermanently } = useSearchTips();

  return (
    <div className="container max-w-screen-2xl py-6">
      {isVisible && (
        <div className="relative mb-6 rounded-lg border bg-gradient-to-r from-primary/5 via-background to-primary/5">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            onClick={hidePermanently}
          >
            <X className="h-4 w-4" />
          </Button>
          <Accordion 
            type="single" 
            collapsible 
            className="border-none"
            value={isExpanded ? "tips" : undefined}
            onValueChange={(value) => setIsExpanded(value === "tips")}
          >
            <AccordionItem value="tips" className="border-none">
              <AccordionTriggerNoIcon className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2 text-base">
                  <LightbulbIcon className="h-5 w-5 text-primary" />
                  <span className="font-medium">Search Tips & Tricks</span>
                </div>
              </AccordionTriggerNoIcon>
              <AccordionContent className="px-6 pb-4">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className={cn(
                    "relative rounded-lg border p-4",
                    "bg-gradient-to-b from-background to-primary/5"
                  )}>
                    <div className="mb-3 flex items-center gap-2 font-medium">
                      <SearchIcon className="h-4 w-4 text-primary" />
                      General Search
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Search by username, full name, or bio. Try searching for specific roles like &quot;frontend developer&quot; or technologies like &quot;react developer&quot;.
                    </p>
                  </div>

                  <div className={cn(
                    "relative rounded-lg border p-4",
                    "bg-gradient-to-b from-background to-primary/5"
                  )}>
                    <div className="mb-3 flex items-center gap-2 font-medium">
                      <Code2 className="h-4 w-4 text-primary" />
                      Programming Language
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Filter developers by their most-used programming language. This helps you find specialists in specific technologies like &quot;JavaScript&quot;, &quot;Python&quot;, or &quot;Rust&quot;.
                    </p>
                  </div>

                  <div className={cn(
                    "relative rounded-lg border p-4",
                    "bg-gradient-to-b from-background to-primary/5"
                  )}>
                    <div className="mb-3 flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4 text-primary" />
                      Location
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add multiple locations to broaden your search. Perfect for finding remote developers or those in specific cities. Press Enter after typing each location.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
      <SearchContainer onSearch={() => {}} />
    </div>
  );
}
