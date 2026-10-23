import React from 'react';
import { notFound } from 'next/navigation';
import OrganizationDetailClient from '@/components/organization/OrganizationDetailClient';
import { getOrganizationBySlug } from '@/services/organizationService';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data, error } = await getOrganizationBySlug(slug);

  if (error || !data) {
    notFound();
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
  const { data, error } = await getOrganizationBySlug(slug);

  if (error || !data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <OrganizationDetailClient slug={slug} initialData={data} />
    </div>
  );
};

export default OrganizationDetailPage;
