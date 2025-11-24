import React from 'react';
import OrganizationDashboard from '@/components/organization/OrganizationDashboard';

export const metadata = {
  title: 'Organization Dashboard | Gyan Aangan',
  description: 'Manage your organization, members, and events',
};

const OrganizationDashboardPage = async ({ params }) => {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <OrganizationDashboard slug={slug} />
    </div>
  );
};

export default OrganizationDashboardPage;
