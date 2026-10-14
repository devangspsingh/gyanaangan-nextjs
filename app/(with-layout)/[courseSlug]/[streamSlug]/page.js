import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStreamBySlug } from '../../../../services/apiService'; // Adjust path
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; // Import shadcn Breadcrumb components

// Helper function to capitalize course slug
function formatCourseName(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Generate metadata on the server
export async function generateMetadata({ params }) {
  const { courseSlug, streamSlug } = await params;

  const response = await getStreamBySlug(streamSlug);

  if (!response.error && response.data) {
    const stream = response.data;
    
    // Attempt to find the current course's name from the stream's associated courses
    const currentCourseInfo = stream.courses?.find(c => c.slug === courseSlug);
    const parentCourseName = currentCourseInfo?.name || formatCourseName(courseSlug);

    const pageTitle = `${stream.name} - ${parentCourseName} - Gyan Aangan`;
    const pageDescription = stream.meta_description || stream.description || `Explore academic years for the ${stream.name} stream.`;

    return {
      title: pageTitle,
      description: pageDescription,
      openGraph: {
        images: stream.og_image_url ? [stream.og_image_url] : [],
      },
    };
  }

  notFound();
}

// The page component is now an async Server Component
export default async function StreamDetailPage({ params }) {
  const { courseSlug, streamSlug } = await params;

  let stream = null;
  let parentCourseName = '';

  // Fetch data directly on the server
  try {
    const response = await getStreamBySlug(streamSlug);
    
    if (!response.error && response.data) {
      stream = response.data;
      
      // Attempt to find the current course's name
      const currentCourseInfo = stream.courses?.find(c => c.slug === courseSlug);
      parentCourseName = currentCourseInfo?.name || formatCourseName(courseSlug);
    } else {
      console.warn("Stream not found:", { courseSlug, streamSlug });
      notFound();
    }
  } catch (e) {
    if (e?.digest?.startsWith('NEXT_')) {
      throw e;
    }
    console.error("Server-side fetch error:", e);
    notFound();
  }

  // Handle not found state
  if (!stream) {
    return (
      <main className="container mx-auto py-8 px-4 text-center text-gray-400">
        <p>Stream not found.</p>
        <Link href={`/${courseSlug}`} className="text-primary-light hover:underline mt-4 inline-block">
          Back to Course
        </Link>
      </main>
    );
  }

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
        name: parentCourseName,
        item: `${SITE_URL}/${courseSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: stream.name,
        item: `${SITE_URL}/${courseSlug}/${streamSlug}`,
      },
    ],
  };

  // Render the page content
  return (
    <main className="container mx-auto py-8 px-4 text-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Breadcrumb className="mb-6">
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
              <Link href={`/${courseSlug}`}>{parentCourseName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{stream.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{stream.name}</h1>
        <p className="text-xl text-gray-400 mb-1">For {parentCourseName}</p>
        {stream.common_name && <p className="text-lg text-gray-400 mb-1">Also known as: {stream.common_name}</p>}
        {stream.abbreviation && <p className="text-md text-gray-500 mb-4">({stream.abbreviation})</p>}
        <p className="text-gray-300 leading-relaxed">{stream.description}</p>
      </header>

      {stream.years && stream.years.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Available Academic Years</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stream.years.map((year) => (
              <Link
                key={year.slug}
                href={`/${courseSlug}/${streamSlug}/${year.slug}`}
                className="group block bg-stone-800 border border-gray-700 rounded-lg p-5 shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:border-primary/50 hover:bg-stone-700"
              >
                <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors duration-300">
                  {year.name || `Year ${year.year}`}
                </h3>
                <p className="text-sm text-gray-400">Access subjects and resources</p>
                <div className="mt-3">
                  <span className="inline-flex items-center text-xs font-medium text-primary-light group-hover:underline">
                    Explore Year
                    <ArrowRightIcon className="ml-1 w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {(!stream.years || stream.years.length === 0) && (
          <p className="text-gray-400">No academic years available for this stream at the moment.</p>
      )}
    </main>
  );
}
