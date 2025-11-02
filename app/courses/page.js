import { getCourses } from '../../services/apiService'; // Adjust path
import CourseCard from '@/components/CourseCard';
import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.in';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/default-og-image.jpg`;
const SITE_NAME = 'Gyan Aangan';

export async function generateMetadata() {
  const pageTitle = `All Courses - ${SITE_NAME}`;
  const pageDescription = `Browse our comprehensive list of available courses including Bachelor of Science (B.Sc) in Computer Science and Bachelor of Technology (B.Tech) with specializations.`;
  const canonicalUrl = `${SITE_URL}/courses`;

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

export default async function CoursesPage({ searchParams }) {
  const page = Number(searchParams?.page) || 1;
  const pageSize = 9;

  console.log('📄 [CoursesPage] Fetching courses for page:', page);

  const response = await getCourses(page, pageSize);

  if (response.error) {
    console.error('📄 [CoursesPage] Failed to load courses:', response.data);
    return (
      <div className="container mx-auto py-8 px-4 text-gray-100">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-primary">All Courses</h1>
          <p className="text-gray-300 text-lg mt-2">Browse our comprehensive list of available courses.</p>
        </header>
        <div className="text-center py-10">
          <p className="text-xl text-red-400">Failed to load courses. Please try again later.</p>
        </div>
      </div>
    );
  }

  const courses = response.data?.results || [];
  const totalCount = response.data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  console.log('📄 [CoursesPage] Loaded', courses.length, 'courses, total pages:', totalPages);

  return (
    <div className="container mx-auto py-8 px-4 text-gray-100">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary">All Courses</h1>
        <p className="text-gray-300 text-lg mt-2">Browse our comprehensive list of available courses.</p>
      </header>

      {courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-4">
              <Link
                href={`/courses?page=${page - 1}`}
                className={`px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md ${
                  page === 1 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
                aria-disabled={page === 1}
              >
                Previous
              </Link>
              <span className="text-gray-300">Page {page} of {totalPages}</span>
              <Link
                href={`/courses?page=${page + 1}`}
                className={`px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md ${
                  page === totalPages ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
                aria-disabled={page === totalPages}
              >
                Next
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-gray-400">No courses available at the moment.</p>
        </div>
      )}
    </div>
  );
}


export const dynamic = 'force-dynamic';
