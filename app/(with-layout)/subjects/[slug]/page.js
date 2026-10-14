import Link from 'next/link';
import { notFound } from 'next/navigation';
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

export default async function SubjectDetailPageServer({ params }) {
  const { slug } = await params;

  try {
    // 1. Fetch Subject and Resources in parallel for maximum speed
    const [subjectResponse, resourcesResponse] = await Promise.all([
      getSubjectBySlug(slug),
      getResources(1, 100, { subject_slug: slug })
    ]);

    // 2. Handle Subject 404/Error
    if (subjectResponse.error || !subjectResponse.data) {
      console.warn(`[SubjectPage] Subject not found: ${slug}`);
      notFound();
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

    // Generate BreadcrumbList Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Subjects',
          item: `${SITE_URL}/subjects`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: subject.name,
          item: `${SITE_URL}/subjects/${slug}`,
        },
      ],
    };

    // 4. Render Client Component with pre-fetched data
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <SubjectDetailPageClient 
          subject={subject} 
          resources={resources} 
        />
      </>
    );

  } catch (error) {
    if (error?.digest?.startsWith('NEXT_')) {
      throw error;
    }
    console.error('[SubjectPage] Critical error:', error);
    notFound();
  }
}