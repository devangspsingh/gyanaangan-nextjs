import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSpecialPageData } from '../../../../../services/apiService';
import SubjectCard from '../../../../../components/SubjectCard';
import SubscribeButton from '../../../../../components/SubscribeButton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  // console.log('📄 [Year Page] Generating metadata for:', params);

  const { courseSlug, streamSlug, yearSlug } = await params;
  const response = await getSpecialPageData(courseSlug, streamSlug, yearSlug);

  if (response.error || !response.data) {
    notFound();
  }

  const pageData = response.data;
  const pageTitle = pageData.name
    ? `${pageData.name} - Gyan Aangan`
    : `${pageData.course?.name} - ${pageData.stream?.name} ${pageData.year?.name} - Gyan Aangan`;
  const pageDescription = pageData.meta_description
    || pageData.description
    || `Subjects and resources for ${pageData.course?.name}, ${pageData.stream?.name}, ${pageData.year?.name}.`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: pageData.og_image_url ? [pageData.og_image_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: pageData.og_image_url ? [pageData.og_image_url] : [],
    },
  };
}

export default async function SpecialPage({ params }) {
  const { courseSlug, streamSlug, yearSlug } = await params;
  const response = await getSpecialPageData(courseSlug, streamSlug, yearSlug);

  if (response.error || !response.data) {
    console.warn('❌ [Year Page] Page not found:', { courseSlug, streamSlug, yearSlug });
    notFound();
  }

  const pageData = response.data;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.in';

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
        name: 'Courses',
        item: `${SITE_URL}/courses`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: pageData.course?.name || courseSlug,
        item: `${SITE_URL}/${courseSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: pageData.stream?.name || streamSlug,
        item: `${SITE_URL}/${courseSlug}/${streamSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: pageData.year?.name || yearSlug,
        item: `${SITE_URL}/${courseSlug}/${streamSlug}/${yearSlug}`,
      },
    ],
  };

  return (
    <main className="container mx-auto py-8 px-4 text-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Breadcrumb className="mb-6 text-sm">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/courses">Courses</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${courseSlug}`}>{pageData.course?.name || courseSlug}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${courseSlug}/${streamSlug}`}>{pageData.stream?.name || streamSlug}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{pageData.year?.name || `Year ${pageData.year?.year}` || yearSlug}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="md:text-4xl text-2xl font-bold text-white mb-2">
              {pageData.course?.name} - {pageData.stream?.name} {pageData.year?.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-400">
              For {pageData.year?.name ? `${pageData.year.name} Subjects` : `Year ${pageData.year?.year} Students`}
            </p>
          </div>
          <SubscribeButton
            specialPageId={pageData.id}
            isSubscribed={pageData.is_subscribed}
          />
        </div>
        {pageData.description && <p className="text-gray-300 mt-4 leading-relaxed">{pageData.description}</p>}
      </header>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-6">Available Subjects</h2>
        {pageData.subjects && pageData.subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageData.subjects.map((subject) => (
              <SubjectCard key={subject.slug} subject={subject} url={`/${pageData.course.slug}/${pageData.stream.slug}/${pageData.year.slug}/${subject.slug}`} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No subjects found for this academic year, course, and stream combination.</p>
        )}
      </section>
    </main>
  );
}

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24 hours ISR
