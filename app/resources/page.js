import React, { Suspense } from 'react';
import { getResources } from '@/services/apiService';
import ResourcesListClient from './ResourcesListClient'; // Import the new client component
import ResourceCardSkeleton from '@/components/ResourceCardSkeleton'; // For Suspense fallback
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.gyanaangan.in';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/default-og-image.jpg`;
const SITE_NAME = 'Gyan Aangan';
const PAGE_SIZE = 9; // Consistent with client

export async function generateMetadata() {
  const pageTitle = `All Resources - ${SITE_NAME}`;
  const pageDescription = `Browse all available learning resources on ${SITE_NAME}, including notes, PYQs, videos, and more.`;
  const canonicalUrl = `${SITE_URL}/resources`;

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
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

// Skeleton for the entire page content during initial server load
const PageSkeleton = () => (
  <div className="container mx-auto py-8 px-4 text-gray-100">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-1/3 mb-6"></div> {/* Breadcrumb Skeleton */}
      <div className="h-10 bg-gray-700 rounded w-1/2 mb-4"></div> {/* Title Skeleton */}
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-8"></div> {/* Description Skeleton */}
      <div className="h-12 bg-gray-700 rounded w-full max-w-2xl mx-auto mb-8"></div> {/* Filters Skeleton */}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <ResourceCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

async function ResourcesPageDataFetcher({ searchParams }) {
  const {q,type} = await searchParams
  const initialPage = 1;
  const filterParams = {
    search: searchParams?.q || '',
    resource_type: searchParams?.type || '',
    // Add other filter params from searchParams if needed
  };
  // Remove empty params before sending to API
  if (!filterParams.search) delete filterParams.search;
  if (!filterParams.resource_type) delete filterParams.resource_type;


  const resourcesResponse = await getResources(initialPage, PAGE_SIZE, filterParams);

  if (resourcesResponse.error) {
    console.error("Failed to load initial resources:", resourcesResponse.data);
    return (
        <ResourcesListClient 
            initialResources={[]} 
            initialHasNextPage={false} 
            initialTotalPages={0}
            initialFilterParams={filterParams}
        />
    );
  }

  const initialResources = resourcesResponse.data?.results || [];
  const initialHasNextPage = !!resourcesResponse.data?.next;
  const initialTotalPages = Math.ceil((resourcesResponse.data?.count || 0) / PAGE_SIZE);

  return (
    <ResourcesListClient 
      initialResources={initialResources} 
      initialHasNextPage={initialHasNextPage}
      initialTotalPages={initialTotalPages}
      initialFilterParams={filterParams}
    />
  );
}

export default function AllResourcesPage({ searchParams }) {
  return (
    <main className="container mx-auto py-8 px-4 text-gray-100">
      <Breadcrumb className="mb-6 text-sm">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Resources</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Explore All Resources</h1>
        <p className="text-lg text-gray-400">
          Discover a vast collection of notes, previous year questions, lab manuals, videos, and more to aid your learning.
        </p>
      </header>
      <Suspense fallback={<PageSkeleton />}>
        <ResourcesPageDataFetcher searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
