import React, { Suspense } from 'react';
import Link from 'next/link';
import SavedResourcesListClient from './SavedResourcesListClient'; // We'll create this next
import ResourceCardSkeleton from '@/components/ResourceCardSkeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
import { getSavedResources } from '@/services/apiService'; // We'll add this to apiService

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.dspsc.live';
const SITE_NAME = 'Gyan Aangan';
const PAGE_SIZE = 9; // Consistent with other resource lists

export async function generateMetadata() {
  const pageTitle = `Saved Resources - ${SITE_NAME}`;
  const pageDescription = `View and manage your saved learning resources on ${SITE_NAME}.`;
  const canonicalUrl = `${SITE_URL}/profile/saved`;

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
    },
    // Add twitter card if needed
  };
}

const PageSkeleton = () => (
  <div className="container mx-auto py-8 px-4 text-gray-100">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-1/2 mb-6"></div> {/* Breadcrumb Skeleton */}
      <div className="h-10 bg-gray-700 rounded w-1/3 mb-4"></div> {/* Title Skeleton */}
      <div className="h-6 bg-gray-700 rounded w-1/2 mb-8"></div> {/* Description Skeleton */}
      {/* No search bar skeleton for saved resources initially, can be added if search is implemented */}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <ResourceCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

async function SavedResourcesDataFetcher() {
  // For saved resources, initial fetching is tricky server-side without user context.
  // The client component will handle fetching after ensuring authentication.
  // So, we pass empty initial data.
  return (
    <SavedResourcesListClient
      initialResources={[]}
      initialHasNextPage={true} // Assume there might be data to load
      initialTotalPages={0} // Will be updated client-side
    />
  );
}

export default function SavedResourcesPage() {
  return (
    <main className="container mx-auto py-8 px-4 text-gray-100">
      <Breadcrumb className="mb-6 text-sm">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/profile">Profile</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Saved Resources</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Your Saved Resources</h1>
        <p className="text-lg text-gray-400">
          Access all the learning materials you&apos;ve bookmarked for later.
        </p>
      </header>
      <Suspense fallback={<PageSkeleton />}>
        <SavedResourcesDataFetcher />
      </Suspense>
    </main>
  );
}
