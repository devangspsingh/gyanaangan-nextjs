import React, { Suspense } from 'react';
import { getResourceBySlug } from '@/services/apiService';
import NestedResourceDetailPageClient from './NestedResourceDetailPageClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.dspsc.live';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/default-og-image.jpg`;
const SITE_NAME = 'Gyan Aangan';

export async function generateMetadata({ params }) {
  const { courseSlug, streamSlug, yearSlug, subjectSlug, resourceSlug } = params;
  
  const resourceResponse = await getResourceBySlug(resourceSlug);

  if (!resourceResponse.error && resourceResponse.data) {
    const resource = resourceResponse.data;
    const pageTitle = resource.name ? `${resource.name} - ${resource.subject_name || subjectSlug} - ${SITE_NAME}` : `Resource - ${SITE_NAME}`;
    const pageDescription = resource.meta_description || resource.description || `View resource ${resource.name} on ${SITE_NAME}.`;
    const ogImageUrl = resource.og_image_url || DEFAULT_OG_IMAGE;
    const canonicalUrl = `${SITE_URL}/${courseSlug}/${streamSlug}/${yearSlug}/${subjectSlug}/${resourceSlug}`;

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
        type: 'article',
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
    title: `Resource Not Found - ${SITE_NAME}`,
    description: `The requested resource could not be found on ${SITE_NAME}.`,
  };
}

// Skeleton for loading state
const NestedResourceDetailSkeleton = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-white p-4 md:p-8">
    <div className="w-full max-w-4xl bg-customSlate-800 p-6 rounded-xl shadow-2xl animate-pulse">
      <div className="h-6 bg-customSlate-700 rounded w-full mb-4"></div> {/* Breadcrumb placeholder */}
      <div className="h-10 bg-customSlate-700 rounded w-3/4 mb-6"></div> {/* Title Skeleton */}
      <div className="h-4 bg-customSlate-700 rounded w-full mb-3"></div> {/* Meta info Skeleton */}
      <div className="h-96 bg-customSlate-700 rounded w-full mb-6"></div> {/* Viewer Skeleton */}
      <div className="h-20 bg-customSlate-700 rounded w-full"></div> {/* Description placeholder */}
    </div>
  </div>
);

async function NestedResourceDataFetcherSERVER({ params }) {
  const { courseSlug, streamSlug, yearSlug, subjectSlug, resourceSlug } = await params;

  // Fetch parent data (course, stream, year details) for breadcrumbs etc.
  const parentDataResponse = await getSpecialPageData(courseSlug, streamSlug, yearSlug);
  
  // The main 'resource' object is NOT fetched here.
  // NestedResourceDetailPageClient will fetch it using resourceSlug from params.
  return (
    <NestedResourceDetailPageClient 
      params={{ courseSlug, streamSlug, yearSlug, subjectSlug, resourceSlug }} // Pass all params, including resourceSlug
      serverFetchedParentData={parentDataResponse.data || null} 
    />
  );
}

export default async function NestedResourceDetailPage({ params }) {
    const { courseSlug, streamSlug, yearSlug, subjectSlug, resourceSlug } = await params
  return (
    <Suspense fallback={<NestedResourceDetailSkeleton />}>
      <NestedResourceDataFetcherSERVER params={{ courseSlug, streamSlug, yearSlug, subjectSlug, resourceSlug }} />
    </Suspense>
  );
}
