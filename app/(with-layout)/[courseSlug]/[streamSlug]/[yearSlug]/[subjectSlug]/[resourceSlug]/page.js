import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getResourceBySlug, getSpecialPageData, getResources } from '@/services/apiService';
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

  const { courseSlug, streamSlug, yearSlug, subjectSlug, resourceSlug } = await params;

  const resourceResponse = await getResourceBySlug(resourceSlug);

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
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export default async function NestedResourceDetailPage({ params }) {
  const { courseSlug, streamSlug, yearSlug, subjectSlug, resourceSlug } = await params;

  try {
    // Fetch resource and parent data in parallel
    const [resourceResponse, parentDataResponse] = await Promise.all([
      getResourceBySlug(resourceSlug),
      getSpecialPageData(courseSlug, streamSlug, yearSlug)
    ]);

    // Handle resource error -> 404
    if (resourceResponse.error || !resourceResponse.data) {
      console.warn('❌ [Nested Resource Page] Resource not found:', resourceSlug);
      notFound();
    }

    const resource = resourceResponse.data;

    // Fetch related resources
    let relatedResources = [];
    if (resource.subject_slug) {
      const relatedResponse = await getResources(1, 7, { subject_slug: resource.subject_slug });
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

    // Generate BreadcrumbList Schema
    const breadcrumbItems = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Courses',
        item: `${SITE_URL}/courses`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: displayParentData.course?.name || courseSlug,
        item: `${SITE_URL}/${courseSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: displayParentData.stream?.name || streamSlug,
        item: `${SITE_URL}/${courseSlug}/${streamSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: displayParentData.year?.name || yearSlug,
        item: `${SITE_URL}/${courseSlug}/${streamSlug}/${yearSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 6,
        name: breadcrumbSubjectName,
        item: `${SITE_URL}/${courseSlug}/${streamSlug}/${yearSlug}/${subjectSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 7,
        name: resource.name,
        item: `${SITE_URL}/${courseSlug}/${streamSlug}/${yearSlug}/${subjectSlug}/${resourceSlug}`,
      },
    ];

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems,
    };

    return (
      <main className="container mx-auto py-8 px-4 text-gray-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
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
        <AdContainer>
          <AdUnit />
        </AdContainer>
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

            {resource?.uploaded_by_user && (
              <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center gap-4">
                {resource.uploaded_by_user.profile_pic ? (
                  <img src={resource.uploaded_by_user.profile_pic} alt={resource.uploaded_by_user.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-300">
                    {resource.uploaded_by_user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-white font-medium text-sm md:text-base">Contributed by {resource.uploaded_by_user.name}</p>
                  {(resource.uploaded_by_user.branch || resource.uploaded_by_user.year) && (
                    <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                      {[resource.uploaded_by_user.year, resource.uploaded_by_user.branch].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>
              </div>
            )}


          </div>

          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <ResourceActionsClient resource={resource} />

            <AdContainer>
              <AdUnit />
            </AdContainer>

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
    if (error?.digest?.startsWith('NEXT_')) {
      throw error;
    }
    console.error('❌ [Resource Page] Unexpected error:', error);
    notFound();
  }
}

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 432000; // 5 days (5 * 24 * 60 * 60)

