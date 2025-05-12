import React, { Suspense } from 'react';
import { getSubjects } from '@/services/apiService';
import SubjectsListClient from './SubjectsListClient'; // Import the new client component
import SubjectCardSkeleton from '@/components/SubjectCardSkeleton'; // For Suspense fallback
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.dspsc.live';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/default-og-image.jpg`;
const SITE_NAME = 'Gyan Aangan';
const PAGE_SIZE = 9; // Consistent with client

export async function generateMetadata({ searchParams }) {
  const pageTitle = `All Subjects - ${SITE_NAME}`;
  const pageDescription = `Browse all available subjects on ${SITE_NAME}. Find notes, PYQs, lab manuals, and more.`;
  const canonicalUrl = `${SITE_URL}/subjects`;

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
      <div className="h-12 bg-gray-700 rounded w-full max-w-xl mx-auto mb-8"></div> {/* Search Bar Skeleton */}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <SubjectCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

async function SubjectsPageDataFetcher({ searchParams }) {
  const initialPage = 1;
  const filterParams = {
    search: searchParams?.q || '', // Example: if you want to support initial search from URL query
    // Add other filter params from searchParams if needed
  };

  const subjectsResponse = await getSubjects(initialPage, PAGE_SIZE, filterParams);

  if (subjectsResponse.error) {
    // Handle error, perhaps show an error message or a simpler client component state
    console.error("Failed to load initial subjects:", subjectsResponse.data);
    return (
        <SubjectsListClient 
            initialSubjects={[]} 
            initialHasNextPage={false} 
            initialTotalPages={0}
            initialFilterParams={filterParams}
        />
    );
  }

  const initialSubjects = subjectsResponse.data?.results || [];
  const initialHasNextPage = !!subjectsResponse.data?.next;
  const initialTotalPages = Math.ceil((subjectsResponse.data?.count || 0) / PAGE_SIZE);

  return (
    <SubjectsListClient 
      initialSubjects={initialSubjects} 
      initialHasNextPage={initialHasNextPage}
      initialTotalPages={initialTotalPages}
      initialFilterParams={filterParams}
    />
  );
}

export default function AllSubjectsPage({ searchParams }) {
  return (
    <main className="container mx-auto py-8 px-4 text-gray-100">
      <Breadcrumb className="mb-6 text-sm">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Subjects</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Explore All Subjects</h1>
        <p className="text-lg text-gray-400">
          Find detailed notes, lab manuals, previous year questions, and more for a wide range of subjects.
        </p>
      </header>
      <Suspense fallback={<PageSkeleton />}>
        <SubjectsPageDataFetcher searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
