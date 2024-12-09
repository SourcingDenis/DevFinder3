import React from 'react';

interface LazyTabContentProps {
  tabId: string;
}

export const LazyTabContent: React.FC<LazyTabContentProps> = ({ tabId }) => {
  return (
    <div className="p-4 bg-background">
      <h2 className="text-xl font-semibold mb-4">Tab Content for {tabId}</h2>
      <p className="text-muted-foreground">
        This is a lazily loaded tab content component.
        It helps improve initial load performance by splitting code.
      </p>
    </div>
  );
};
