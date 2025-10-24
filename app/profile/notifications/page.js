import React, { Suspense } from 'react';
import Link from 'next/link';
import NotificationsListClient from './NotificationsListClient'; // We'll create this
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
// No specific API call for initial data here, client will fetch.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.in';
const SITE_NAME = 'Gyan Aangan';

export async function generateMetadata() {
  const pageTitle = `Notifications - ${SITE_NAME}`;
  const pageDescription = `Stay updated with the latest announcements and notifications on ${SITE_NAME}.`;
  const canonicalUrl = `${SITE_URL}/profile/notifications`;

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
      type: 'website',
    },
  };
}

const NotificationSkeleton = () => (
  <div className="bg-stone-800 p-4 rounded-lg shadow animate-pulse">
    <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-700 rounded w-full mb-3"></div>
    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
  </div>
);

const PageSkeleton = () => (
  <div className="container mx-auto py-8 px-4 text-gray-100">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-1/2 mb-6"></div> {/* Breadcrumb Skeleton */}
      <div className="h-10 bg-gray-700 rounded w-1/3 mb-4"></div> {/* Title Skeleton */}
      <div className="h-6 bg-gray-700 rounded w-1/2 mb-8"></div> {/* Description Skeleton */}
    </div>
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <NotificationSkeleton key={index} />
      ))}
    </div>
  </div>
);

export default function NotificationsPage() {
  return (
    <main className="container mx-auto py-8 px-4 text-gray-100">
      <Breadcrumb className="mb-6 text-sm">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/profile">Profile</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Notifications</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
        <p className="text-lg text-gray-400">
          Catch up on the latest updates and announcements.
        </p>
      </header>
      <Suspense fallback={<PageSkeleton />}>
        <NotificationsListClient />
      </Suspense>
    </main>
  );
}
