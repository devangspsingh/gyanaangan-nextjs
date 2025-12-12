import React from 'react';
import Link from 'next/link';
import { getResourceBySlugServerSide, getSpecialPageData, getResources, getResourcesServerSide } from '@/services/apiService';
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
import { AdContainer } from '@/components/blog/AdContainer';
import { AdUnit } from '@/components/blog/AdUnit';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.in';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/default-og-image.jpg`;
const SITE_NAME = 'Gyan Aangan';

export async function generateMetadata({ params }) {
  // console.log('📄 [Resource Page] Generating metadata for:', params);

  const { courseSlug, streamSlug, yearSlug, subjectSlug, resourceSlug } = params;

  const resourceResponse = await getResourceBySlugServerSide(resourceSlug);

  if (!resourceResponse.error && resourceResponse.data) {
    const resource = resourceResponse.data;
    const pageTitle = resource.name ? `${resource.name} - ${resource.subject_name || subjectSlug} - ${SITE_NAME}` : `Resource - ${SITE_NAME}`;
    const pageDescription = resource.meta_description || resource.description || `View resource ${resource.name} on ${SITE_NAME}.`;

    // Generate dynamic OG image URL
    const ogImageUrl = resource.og_image_url ||
      `${SITE_URL}/api/og?title=${encodeURIComponent(resource.name || 'Resource')}&description=${encodeURIComponent(pageDescription.slice(0, 150))}&type=resource`;

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

export default async function NestedResourceDetailPage({ params }) {
  // console.log('📄 [Resource Page] Fetching data for:', params);

  const { courseSlug, streamSlug, yearSlug, subjectSlug, resourceSlug } = params;

  try {
    // Fetch resource and parent data in parallel
    const [resourceResponse, parentDataResponse] = await Promise.all([
      getResourceBySlugServerSide(resourceSlug),
      getSpecialPageData(courseSlug, streamSlug, yearSlug)
    ]);

    // console.log('📄 [Resource Page] Responses received:', {
    //   resource: resourceResponse.error ? 'Error' : 'Success',
    //   parentData: parentDataResponse.error ? 'Error' : 'Success'
    // });

    // Handle resource error
    if (resourceResponse.error || !resourceResponse.data) {
      const errorMessage = resourceResponse.data?.detail || 'Failed to load resource.';
      console.error('❌ [Resource Page] Failed to load resource:', errorMessage);

      const displayErrorParentData = parentDataResponse.data || {
        course: { name: courseSlug || "Course", slug: courseSlug },
        stream: { name: streamSlug || "Stream", slug: streamSlug },
        year: { name: yearSlug || "Year", slug: yearSlug },
      };

      return (
        <main className="container mx-auto py-8 px-4 text-gray-100">
          <Breadcrumb className="mb-6 text-sm">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/courses">Courses</Link></BreadcrumbLink></BreadcrumbItem>
              {courseSlug && (<> <BreadcrumbSeparator /> <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}`}>{displayErrorParentData.course?.name || courseSlug}</Link></BreadcrumbLink></BreadcrumbItem> </>)}
              {streamSlug && (<> <BreadcrumbSeparator /> <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}/${streamSlug}`}>{displayErrorParentData.stream?.name || streamSlug}</Link></BreadcrumbLink></BreadcrumbItem> </>)}
              {yearSlug && (<> <BreadcrumbSeparator /> <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}/${streamSlug}/${yearSlug}`}>{displayErrorParentData.year?.name || yearSlug}</Link></BreadcrumbLink></BreadcrumbItem> </>)}
              {subjectSlug && (<> <BreadcrumbSeparator /> <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}/${streamSlug}/${yearSlug}/${subjectSlug}`}>{subjectSlug.replace(/-/g, ' ')}</Link></BreadcrumbLink></BreadcrumbItem> </>)}
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Error</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-10 text-red-400 bg-red-900/20 p-6 rounded-lg">
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Resource Error</h2>
            <p>{errorMessage || 'Resource not found or failed to load.'}</p>
            <Link href={`/${courseSlug}/${streamSlug}/${yearSlug}/${subjectSlug}`} className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">
              Go Back to Subject
            </Link>
          </div>
        </main>
      );
    }

    const resource = resourceResponse.data;

    // Fetch related resources
    let relatedResources = [];
    if (resource.subject_slug) {
      const relatedResponse = await getResourcesServerSide(1, 7, { subject_slug: resource.subject_slug });
      if (!relatedResponse.error && relatedResponse.data?.results) {
        relatedResources = relatedResponse.data.results.filter(r => r.slug !== resourceSlug).slice(0, 6);
      }
    }

    // console.log('✅ [Resource Page] Data loaded successfully:', {
    //   resourceName: resource.name,
    //   relatedResourcesCount: relatedResources.length
    // });

    // Handle parent data
    const displayParentData = parentDataResponse.data || {
      course: { name: courseSlug, slug: courseSlug },
      stream: { name: streamSlug, slug: streamSlug },
      year: { name: yearSlug, slug: yearSlug },
    };

    const breadcrumbSubjectName = resource.subject_name || displayParentData.subjects?.find(s => s.slug === subjectSlug)?.name || subjectSlug;

    return (
      <main className="container mx-auto py-8 px-4 text-gray-100">
        <Breadcrumb className="mb-6 text-sm">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
            {displayParentData?.course && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}`}>{displayParentData.course?.name || courseSlug}</Link></BreadcrumbLink></BreadcrumbItem>
              </>
            )}
            {displayParentData?.stream && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}/${streamSlug}`}>{displayParentData.stream?.name || streamSlug}</Link></BreadcrumbLink></BreadcrumbItem>
              </>
            )}
            {displayParentData?.year && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}/${streamSlug}/${yearSlug}`}>{displayParentData.year?.name || yearSlug}</Link></BreadcrumbLink></BreadcrumbItem>
              </>
            )}
            {subjectSlug && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}/${streamSlug}/${yearSlug}/${subjectSlug}`}>{breadcrumbSubjectName}</Link></BreadcrumbLink></BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage className="truncate max-w-[150px] sm:max-w-none" title={resource.name}>{resource.name}</BreadcrumbPage></BreadcrumbItem>
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
              {resource.subject_name ? `More from ${resource.subject_name}` : (subjectSlug ? `More from ${subjectSlug.replace(/-/g, ' ')}` : "Related Resources")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedResources.map(relatedRes => (
                <ResourceCard
                  key={relatedRes.slug}
                  resource={relatedRes}
                  customHref={`/${courseSlug}/${streamSlug}/${yearSlug}/${subjectSlug}/${relatedRes.slug}`}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    );
  } catch (error) {
    console.error('❌ [Resource Page] Unexpected error:', error);
    return (
      <main className="container mx-auto py-8 px-4 text-gray-100">
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-10 text-red-400 bg-red-900/20 p-6 rounded-lg">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Unexpected Error</h2>
          <p>An unexpected error occurred: {error.message}</p>
          <Link href={`/${params.courseSlug}/${params.streamSlug}/${params.yearSlug}/${params.subjectSlug}`} className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">
            Go Back to Subject
          </Link>
        </div>
      </main>
    );
  }
}

export const dynamic = 'force-dynamic';
