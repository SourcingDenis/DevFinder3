import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const ReleaseNotes: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            DevFinder Release Notes
          </CardTitle>
          <p className="text-muted-foreground">Version 1.1.0 - December 2024</p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Badge variant="outline" className="mr-2">🔍</Badge>
                Expanded Search Implementation
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Introduced advanced search filtering options</li>
                <li>Improved search algorithm for more precise and relevant results</li>
                <li>Added support for complex search queries with multiple parameters</li>
                <li>Implemented intelligent matching across different user attributes</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Badge variant="outline" className="mr-2">🔐</Badge>
                GitHub Authentication
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Added robust GitHub OAuth authentication</li>
                <li>Secure login process using GitHub credentials</li>
                <li>One-click authentication for quick access</li>
                <li>Automatic profile information retrieval from GitHub</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Badge variant="outline" className="mr-2">💾</Badge>
                Save Profile
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Implemented profile saving functionality</li>
                <li>Users can now save and store multiple developer profiles</li>
                <li>Easy profile management interface</li>
                <li>Local storage of saved profiles for quick access</li>
                <li>Ability to add notes and tags to saved profiles</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Badge variant="outline" className="mr-2">🔖</Badge>
                Save Search
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Introduced save search feature</li>
                <li>Users can save and revisit complex search queries</li>
                <li>Quick access to previously conducted searches</li>
                <li>Export and import search configurations</li>
                <li>Personalized search history management</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Technical Improvements</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Performance optimizations</li>
                <li>Enhanced error handling</li>
                <li>Improved user interface responsiveness</li>
                <li>Increased test coverage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Bug Fixes</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Fixed minor UI inconsistencies</li>
                <li>Resolved authentication token management issues</li>
                <li>Improved error messaging</li>
              </ul>
            </section>

            <div className="mt-6 text-center text-muted-foreground italic">
              Thank you for using DevFinder! We're committed to continuously improving your developer discovery experience.
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReleaseNotes;
