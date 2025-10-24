import React, { Suspense } from 'react';
import { getSubjectBySlug } from '@/services/apiService'; // getResources removed from here
import SubjectDetailPageClient from './SubjectDetailPageClient';
import ResourceCardSkeleton from '@/components/ResourceCardSkeleton'; // Used by client as fallback
import ResourceCard from '../../../components/ResourceCard';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.in';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/default-og-image.jpg`;
const SITE_NAME = 'Gyan Aangan';

export async function generateMetadata({ params }) {
  const { slug } = params; // Removed await, params is not a promise
  const subjectResponse = await getSubjectBySlug(slug);

  if (!subjectResponse.error && subjectResponse.data) {
    const subject = subjectResponse.data;
    const pageTitle = subject.name ? `${subject.name} - Subjects - ${SITE_NAME}` : `Subject Details - ${SITE_NAME}`;
    const pageDescription = subject.meta_description || subject.description || `Explore resources for the subject: ${subject.name} on ${SITE_NAME}.`;
    const ogImageUrl = subject.og_image_url || DEFAULT_OG_IMAGE;
    const canonicalUrl = `${SITE_URL}/subjects/${slug}`;

    return {
      title: pageTitle,
      description: pageDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: canonicalUrl,
        siteName: SITE_NAME,
        images: [{ url: ogImageUrl, width: 1200, height: 630 }],
        type: 'article', // Or 'object' if more appropriate for a subject
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDescription,
        images: [ogImageUrl],
      },
    };
  }

  return {
    title: `Subject Not Found - ${SITE_NAME}`,
    description: `The requested subject could not be found on ${SITE_NAME}.`,
  };
}

// Skeleton for the subject detail page content
const SubjectDetailContentSkeleton = () => (
  <div className="container mx-auto py-8 px-4 text-gray-100">
    <div className="animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-6 bg-gray-700 rounded w-1/2 mb-6"></div>
      {/* Back Button Skeleton */}
      <div className="h-8 bg-gray-700 rounded w-24 mb-6"></div>
      {/* Header Skeleton */}
      <div className="h-10 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-700 rounded w-full mb-8"></div>
      {/* Filters/Search Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-700 rounded w-1/3"></div>
        <div className="h-10 bg-gray-700 rounded w-1/4"></div>
      </div>
      <div className="h-10 bg-gray-700 rounded w-full mb-6"></div> {/* Tabs Skeleton */}
    </div>
    {/* Resource list skeleton will be handled by SubjectDetailPageClient's Suspense or internal loading state */}
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <ResourceCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

async function SubjectDataFetcher({ slug }) {
  const subjectResponse = await getSubjectBySlug(slug);
  // Resources are no longer fetched here.

  if (!subjectResponse.error && subjectResponse.data) {
    const subject = subjectResponse.data;
    // Pass the fetched subject to the client component.
    // The client component will then fetch its own resources.
    return <SubjectDetailPageClient slug={slug} initialSubject={subject} />;
  }
  
  // Handle error or subject not found case - Client component will show its error state
  return <SubjectDetailPageClient slug={slug} initialSubject={null} />;
}

export default async function SubjectDetailPageServer({ params }) { 
  const { slug } = params; // Removed await
  return (
    <Suspense fallback={<SubjectDetailContentSkeleton />}>
      <SubjectDataFetcher slug={slug} />
    </Suspense>
  );
}
