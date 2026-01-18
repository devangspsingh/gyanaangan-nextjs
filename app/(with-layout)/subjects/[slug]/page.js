import Link from 'next/link';
import { getSubjectBySlug, getResources } from '@/services/apiService';
import SubjectDetailPageClient from './SubjectDetailPageClient';

// Constants for Metadata
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.in';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/default-og-image.jpg`;
const SITE_NAME = 'Gyan Aangan';

export const dynamic = 'force-dynamic'; // Ensure fresh data on every request

export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  // Only fetch subject info for metadata, no need for resources here
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
      alternates: { canonical: canonicalUrl },
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
    title: `Subject Not Found - ${SITE_NAME}`,
    description: `The requested subject could not be found on ${SITE_NAME}.`,
  };
}

export default async function SubjectDetailPageServer({ params }) {
  const { slug } = params;

  try {
    // 1. Fetch Subject and Resources in parallel for maximum speed
    const [subjectResponse, resourcesResponse] = await Promise.all([
      getSubjectBySlug(slug),
      getResources(1, 100, { subject_slug: slug })
    ]);

    // 2. Handle Subject 404/Error
    if (subjectResponse.error || !subjectResponse.data) {
      const errorMessage = subjectResponse.data?.detail || 'Subject data could not be loaded.';
      console.error(`[SubjectPage] Error loading subject ${slug}:`, errorMessage);

      return (
        <main className="container mx-auto py-8 px-4 text-gray-100">
           <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-10 text-red-400 bg-red-900/20 p-6 rounded-lg">
             <h2 className="text-xl font-bold mb-2">Subject Not Found</h2>
             <p>{errorMessage}</p>
             <Link href="/subjects" className="mt-4 text-primary-light hover:underline">Return to Subjects</Link>
           </div>
        </main>
      );
    }

    const subject = subjectResponse.data;

    // 3. Process Resources
    let resources = [];
    if (!resourcesResponse.error && resourcesResponse.data?.results) {
      // Sort resources: newest updated first
      resources = resourcesResponse.data.results.sort((a, b) => 
        new Date(b.updated_at_iso || b.updated_at) - new Date(a.updated_at_iso || a.updated_at)
      );
    } else {
        console.warn(`[SubjectPage] Failed to load resources for ${slug}`);
    }

    // 4. Render Client Component with pre-fetched data
    return (
      <SubjectDetailPageClient 
        subject={subject} 
        resources={resources} 
      />
    );

  } catch (error) {
    console.error('[SubjectPage] Critical error:', error);
    return (
      <div className="container mx-auto py-8 px-4 text-gray-100 text-center">
        <p className="text-red-500">An unexpected error occurred. Please try again later.</p>
      </div>
    );
  }
}