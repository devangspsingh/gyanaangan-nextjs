import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourseBySlug } from '@/services/apiService';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export async function generateMetadata({ params }) {
  const { courseSlug } = await params;
  const response = await getCourseBySlug(courseSlug);

  if (!response.error && response.data) {
    const course = response.data;
    const pageTitle = course.name ? `${course.name} - Gyan Aangan` : "Course Details - Gyan Aangan";
    const pageDescription = course.meta_description || course.description || "Explore streams and academic years for this course.";

    return {
      title: pageTitle,
      description: pageDescription,
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        images: course.og_image_url ? [course.og_image_url] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDescription,
        images: course.og_image_url ? [course.og_image_url] : [],
      },
    };
  }

  notFound();
}

export default async function CourseDetailPage({ params }) {
  const { courseSlug } = await params;
  let course = null;

  try {
    const response = await getCourseBySlug(courseSlug);
    if (!response.error && response.data) {
      course = response.data;
    } else {
      console.warn("Course not found:", courseSlug);
      notFound();
    }
  } catch (e) {
    if (e?.digest?.startsWith('NEXT_')) {
      throw e;
    }
    console.error("Error fetching course:", e);
    notFound();
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
        name: course.name,
        item: `${SITE_URL}/${courseSlug}`,
      },
    ],
  };

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
            <BreadcrumbPage>{course.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{course.name}</h1>
        {course.common_name && <p className="text-xl text-gray-400 mb-1">Also known as: {course.common_name}</p>}
        {course.abbreviation && <p className="text-lg text-gray-500 mb-4">({course.abbreviation})</p>}
        <p className="text-gray-300 leading-relaxed">{course.description}</p>
      </header>

      {course.streams && course.streams.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Available Streams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.streams.map((stream) => (
              <Link
                key={stream.slug}
                href={`/${courseSlug}/${stream.slug}`}
                className="group block bg-stone-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:border-primary/50"
              >
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors duration-300 truncate" title={stream.name}>
                    {stream.name}
                  </h3>
                  {stream.abbreviation && <p className="text-sm text-gray-500 mb-1">({stream.abbreviation})</p>}
                  <p className="text-gray-400 text-sm line-clamp-3 mb-3">
                    {stream.description || `Explore the ${stream.name} stream.`}
                  </p>
                  <div className="mt-auto">
                    <span className="inline-flex items-center text-sm font-medium text-primary-light group-hover:underline">
                      View Years
                      <ArrowRightIcon className="ml-1 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {(!course.streams || course.streams.length === 0) && (
        <p className="text-gray-400">No streams available for this course at the moment.</p>
      )}
    </main>
  );
}
