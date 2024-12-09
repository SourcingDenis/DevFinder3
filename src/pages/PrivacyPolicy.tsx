import React from 'react';

export function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">DevFinder Privacy Policy</h1>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
        <p className="text-muted-foreground mb-4">
          DevFinder collects minimal personal information necessary for providing our developer profile search and networking service:
        </p>
        <ul className="list-disc pl-5 text-muted-foreground space-y-2">
          <li>Email address used for authentication</li>
          <li>Basic profile information from authentication providers</li>
          <li>Search queries and interactions within the DevFinder platform</li>
          <li>Optional profile information you choose to share</li>
        </ul>
      </section>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
        <p className="text-muted-foreground mb-4">
          We use your information to:
        </p>
        <ul className="list-disc pl-5 text-muted-foreground space-y-2">
          <li>Provide and improve the DevFinder developer search and networking service</li>
          <li>Personalize your user experience</li>
          <li>Facilitate developer connections and profile discoveries</li>
          <li>Communicate important service updates and features</li>
          <li>Ensure platform security and prevent unauthorized access</li>
        </ul>
      </section>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">3. Data Protection</h2>
        <p className="text-muted-foreground">
          We implement robust security measures to protect your personal information:
        </p>
        <ul className="list-disc pl-5 text-muted-foreground space-y-2 mt-2">
          <li>Encrypted data transmission using HTTPS</li>
          <li>Secure authentication mechanisms</li>
          <li>Regular security audits and updates</li>
          <li>Limited data access for DevFinder team members</li>
        </ul>
      </section>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
        <p className="text-muted-foreground">
          DevFinder may use third-party services for:
        </p>
        <ul className="list-disc pl-5 text-muted-foreground space-y-2 mt-2">
          <li>Authentication (e.g., OAuth providers)</li>
          <li>Analytics to improve user experience</li>
          <li>Cloud hosting and infrastructure</li>
        </ul>
        <p className="text-muted-foreground mt-4">
          These services have their own privacy policies and are bound by data protection agreements.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
        <p className="text-muted-foreground">
          As a DevFinder user, you have the right to:
        </p>
        <ul className="list-disc pl-5 text-muted-foreground space-y-2 mt-2">
          <li>Access and review your personal information</li>
          <li>Request correction of inaccurate data</li>
          <li>Delete your account and associated data</li>
          <li>Opt-out of non-essential communications</li>
          <li>Export your profile and search data</li>
        </ul>
      </section>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
        <p className="text-muted-foreground">
          We retain your personal information only for as long as necessary to provide our service:
        </p>
        <ul className="list-disc pl-5 text-muted-foreground space-y-2 mt-2">
          <li>Active user accounts are maintained indefinitely</li>
          <li>Inactive accounts may be deleted after 12 months of inactivity</li>
          <li>You can request immediate account deletion at any time</li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
        <p className="text-muted-foreground">
          For any privacy-related questions or concerns, please contact us at:
        </p>
        <p className="mt-2 text-primary">
          privacy@devfinder.com
        </p>
        <p className="text-muted-foreground mt-4">
          Last updated: December 2023
        </p>
      </section>
    </div>
  );
}
