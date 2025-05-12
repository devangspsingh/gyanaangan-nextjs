import React, { Suspense } from 'react';
import { getResourceBySlug, getResources } from '@/services/apiService';
import ResourceDetailPageClient from './ResourceDetailPageClient'; 
// Head component from next/head is not used in Server Components for metadata.
// Metadata is handled by the generateMetadata export.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.dspsc.live';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/default-og-image.jpg`; // Ensure this image exists in your public folder
const SITE_NAME = 'Gyan Aangan';

export async function generateMetadata({ params }) {
  const { slug } = params; // Removed await
  const resourceResponse = await getResourceBySlug(slug);

  if (!resourceResponse.error && resourceResponse.data) {
    const resource = resourceResponse.data;
    const pageTitle = resource.name ? `${resource.name} - ${SITE_NAME}` : `Resource Details - ${SITE_NAME}`;
    const pageDescription = resource.meta_description || resource.description || `Details for resource: ${resource.name} on ${SITE_NAME}.`;
    const ogImageUrl = resource.og_image_url || DEFAULT_OG_IMAGE;
    const canonicalUrl = `${SITE_URL}/resources/${slug}`;

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
        images: [{ url: ogImageUrl, width: 1200, height: 630 }], // Standard OG image dimensions
        type: 'article', // Or 'website' if more appropriate
      },
      twitter: { // Basic Twitter card metadata
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDescription,
        images: [ogImageUrl],
      },
    };
  }

  // Fallback metadata if resource not found or error occurs
  return {
    title: `Resource Not Found - ${SITE_NAME}`,
    description: `The requested resource could not be found on ${SITE_NAME}.`,
  };
}

// Skeleton for loading state - Updated to match nested style
const ResourceDetailSkeleton = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-white p-4 md:p-8">
    <div className="w-full max-w-2xl bg-customSlate-800 p-6 rounded-xl shadow-2xl animate-pulse">
      <div className="h-6 bg-customSlate-700 rounded w-full mb-4"></div> {/* Breadcrumb placeholder */}
      <div className="h-8 bg-customSlate-700 rounded w-3/4 mb-6"></div> {/* Title Skeleton */}
      <div className="h-4 bg-customSlate-700 rounded w-full mb-3"></div> {/* Meta info Skeleton */}
      <div className="h-64 bg-customSlate-700 rounded w-full"></div> {/* Viewer Skeleton */}
    </div>
  </div>
);

async function ResourceDataFetcher({ slug }) {
  // Main resource is no longer fetched here.
  // It will be fetched client-side in ResourceDetailPageClient.

  // We can still fetch related resources server-side if they are public 
  // or if we pass a token (though the goal is to move auth-dependent fetches client-side).
  // For simplicity, let's assume related resources are fetched based on public data for now.
  // If relatedResources also needs auth, its fetching should also move client-side or slug should be enough.
  
  let relatedResourcesData = [];
  // To fetch related resources, we might need the subject_slug from the main resource.
  // This creates a dependency. If main resource is client-fetched, related might also need to be.
  // For now, let's remove related resources fetching from server to avoid complexity,
  // or assume it's handled differently/client-side.
  // OR, if related resources can be fetched by slug alone without knowing subject_slug first:
  // const relatedResponse = await getResources(1, 7, { some_filter_by_slug: slug } /*, accessToken */);
  // if (!relatedResponse.error && relatedResponse.data?.results) {
  //   relatedResourcesData = relatedResponse.data.results.filter(r => r.slug !== slug).slice(0, 6);
  // }

  // Pass only the slug. ResourceDetailPageClient will fetch the resource.
  // Related resources fetching will also be moved to ResourceDetailPageClient.
  return <ResourceDetailPageClient slug={slug} />;
}

export default function ResourceDetailPageServer({ params }) { 
  const { slug } = params; 
  return (
    <Suspense fallback={<ResourceDetailSkeleton />}>
      <ResourceDataFetcher slug={slug} />
    </Suspense>
  );
}
