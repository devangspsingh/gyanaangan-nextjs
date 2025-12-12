import React from 'react';
import Link from 'next/link';
import { getResourceBySlugServerSide, getResources } from '@/services/apiService';
import Viewer from '@/components/Viewer';
import ResourceCard from '@/components/ResourceCard';
import ResourceActionsClient from '@/components/ResourceActionsClient';
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { AdUnit } from '@/components/blog/AdUnit';
import { AdContainer } from '@/components/blog/AdContainer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.in';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/default-og-image.jpg`;
const SITE_NAME = 'Gyan Aangan';

export async function generateMetadata({ params }) {

  const { slug } = params;
  const resourceResponse = await getResourceBySlugServerSide(slug);

  if (!resourceResponse.error && resourceResponse.data) {
    const resource = resourceResponse.data;
    const pageTitle = resource.name ? `${resource.name} - ${SITE_NAME}` : `Resource Details - ${SITE_NAME}`;
    const pageDescription = resource.meta_description || resource.description || `Details for resource: ${resource.name} on ${SITE_NAME}.`;

    // Generate dynamic OG image URL
    const ogImageUrl = resource.og_image_url ||
      `${SITE_URL}/api/og?title=${encodeURIComponent(resource.name || 'Resource')}&description=${encodeURIComponent(pageDescription.slice(0, 150))}&type=resource`;

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

export default async function ResourceDetailPageServer({ params }) {

  const { slug } = params;

  try {
    // Fetch resource using server-side API with authentication
    const resourceResponse = await getResourceBySlugServerSide(slug);



    // Handle resource error
    if (resourceResponse.error || !resourceResponse.data) {
      const errorMessage = resourceResponse.data?.detail || 'Failed to load resource.';
      console.error('❌ [Resource Page /resources/[slug]] Failed to load resource:', errorMessage);

      return (
        <main className="container mx-auto py-8 px-4 text-center text-red-400">
          <Breadcrumb className="mb-6 text-sm justify-center">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/resources">Resources</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Error</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-10 bg-red-900/20 p-6 rounded-lg">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-semibold mb-2">Resource Error</h1>
            <p>{errorMessage}</p>
            <Link href="/resources" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">
              Back to Resources
            </Link>
          </div>
        </main>
      );
    }

    const resource = resourceResponse.data;

    // Fetch related resources if subject is available
    let relatedResources = [];
    if (resource.subject_slug) {
      const relatedResponse = await getResources(1, 7, { subject_slug: resource.subject_slug });
      if (!relatedResponse.error && relatedResponse.data?.results) {
        relatedResources = relatedResponse.data.results.filter(r => r.slug !== slug).slice(0, 6);
      }
    }

    // console.log('✅ [Resource Page /resources/[slug]] Data loaded successfully:', {
    //   resourceName: resource.name,
    //   relatedResourcesCount: relatedResources.length
    // });

    return (
      <main className="container mx-auto py-8 px-4 text-gray-100">
        <Breadcrumb className="mb-6 text-sm">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
            </BreadcrumbItem>
            {/* Dynamically add breadcrumbs if resource has course/stream/year/subject info */}
            {resource.course_slug && resource.course_name && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link href={`/${resource.course_slug}`}>{resource.course_name}</Link></BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {resource.stream_slug && resource.stream_name && resource.course_slug && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link href={`/${resource.course_slug}/${resource.stream_slug}`}>{resource.stream_name}</Link></BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {resource.year_slug && resource.year_name && resource.course_slug && resource.stream_slug && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link href={`/${resource.course_slug}/${resource.stream_slug}/${resource.year_slug}`}>{resource.year_name}</Link></BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {resource.subject_slug && resource.subject_name && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link href={
                    resource.course_slug && resource.stream_slug && resource.year_slug ?
                      `/${resource.course_slug}/${resource.stream_slug}/${resource.year_slug}/${resource.subject_slug}` :
                      `/subjects/${resource.subject_slug}`
                  }>{resource.subject_name}</Link></BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {!resource.subject_slug && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink asChild><Link href="/resources">Resources</Link></BreadcrumbLink></BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate max-w-[200px] md:max-w-none">{resource.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-heading-section font-extrabold text-white mb-3">{resource.name}</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 xl:col-span-9">
            <Viewer resource={resource} />

            <AdContainer>
              <AdUnit />
            </AdContainer>

            {resource.description && (
              <section className="mt-8 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
                <p className="text-gray-300 font-body-desc leading-relaxed whitespace-pre-wrap">{resource.description}</p>
                <div className="font-body-desc py-2 text-gray-400 flex flex-wrap gap-2 mt-3 overflow-hidden">
                  <Badge variant="outline" className="text-xs sm:text-sm break-words max-w-full">
                    <span className="truncate">Type: {resource.resource_type_display || resource.resource_type}</span>
                  </Badge>
                  {resource.subject_name && (
                    <Badge className="text-xs sm:text-sm break-words max-w-full" variant="outline">
                      <span className="truncate">Subject: {resource.subject_name}</span>
                    </Badge>
                  )}
                  {resource.educational_year?.name && (
                    <Badge className="text-xs sm:text-sm break-words max-w-full" variant="outline">
                      <span className="truncate">Year: {resource.educational_year.name}</span>
                    </Badge>
                  )}
                  {resource.updated_at && (
                    <Badge className="text-xs sm:text-sm break-words max-w-full" variant="outline">
                      <span className="truncate">Last Updated: {resource.updated_at}</span>
                    </Badge>
                  )}
                  {resource.uploader_name && (
                    <Badge className="text-xs sm:text-sm break-words max-w-full" variant="outline">
                      <span className="truncate">By: {resource.uploader_name}</span>
                    </Badge>
                  )}
                </div>
              </section>
            )}


          </div>

          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <ResourceActionsClient resource={resource} />

            {resource.tags && resource.tags.length > 0 && (
              <div className="p-6 bg-stone-800 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-stone-700 text-gray-300 hover:bg-stone-600">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {relatedResources.length > 0 && (
          <section className="mt-12 pt-8 border-t border-stone-700">
            <h2 className="text-2xl font-semibold text-white mb-6">
              {resource.subject_name ? `More from ${resource.subject_name}` : "Related Resources"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedResources.map((relatedRes) => (
                <ResourceCard key={relatedRes.slug} resource={relatedRes} />
              ))}
            </div>
          </section>
        )}
      </main>
    );
  } catch (error) {
    console.error('❌ [Resource Page /resources/[slug]] Unexpected error:', error);
    return (
      <main className="container mx-auto py-8 px-4 text-center text-red-400">
        <Breadcrumb className="mb-6 text-sm justify-center">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/resources">Resources</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Error</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-10 bg-red-900/20 p-6 rounded-lg">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-semibold mb-2">Unexpected Error</h1>
          <p>An unexpected error occurred: {error.message}</p>
          <Link href="/resources" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">
            Back to Resources
          </Link>
        </div>
      </main>
    );
  }
}

export const dynamic = 'force-dynamic';
