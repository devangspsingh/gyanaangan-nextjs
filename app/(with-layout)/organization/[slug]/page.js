import React from 'react';
import OrganizationDetailClient from '@/components/organization/OrganizationDetailClient';
import { getOrganizationBySlug } from '@/services/organizationService';

export async function generateMetadata({ params }) {
  const { slug } = params;
  const { data, error } = await getOrganizationBySlug(slug);

  if (error || !data) {
    return {
      title: 'Organization Not Found | Gyan Aangan',
      description: 'The requested organization could not be found.',
    };
  }

  return {
    title: `${data.name} | Gyan Aangan`,
    description: data.description || `Learn more about ${data.name} and their events.`,
    openGraph: {
      title: data.name,
      description: data.description,
      images: data.logo ? [data.logo] : [],
    },
  };
}

const OrganizationDetailPage = async ({ params }) => {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <OrganizationDetailClient slug={slug} />
    </div>
  );
};

export default OrganizationDetailPage;
