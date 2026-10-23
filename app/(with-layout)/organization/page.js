import React, { Suspense } from 'react';
import OrganizationListingClient from '@/components/organization/OrganizationListingClient';

export const metadata = {
  title: 'Organizations | Gyan Aangan',
  description: 'Discover clubs, companies, and organizations hosting amazing events and opportunities.',
};

const OrganizationsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Suspense fallback={<div className="container mx-auto py-12 text-center text-gray-400">Loading organizations...</div>}>
        <OrganizationListingClient />
      </Suspense>
    </div>
  );
};

export default OrganizationsPage;
