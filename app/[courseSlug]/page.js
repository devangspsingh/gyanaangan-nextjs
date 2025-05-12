'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCourseBySlug } from '../../services/apiService'; // Adjust path
import { ArrowRightIcon } from '@heroicons/react/20/solid'; // ChevronRightIcon removed as BreadcrumbSeparator handles it
import Head from 'next/head'; // For dynamic metadata
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb"; // Import shadcn Breadcrumb components

// Skeleton Loader Components (assuming you have these or similar)
const SkeletonCard = () => (
  <div className="bg-stone-800 border border-gray-700 rounded-lg p-5 animate-pulse">
    <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-700 rounded w-full"></div>
  </div>
);

const LoadingState = () => (
  <div className="space-y-8">
    <div className="h-12 bg-gray-700 rounded w-1/2 animate-pulse mb-4"></div>
    <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  </div>
);

export default function CourseDetailPage() {
  const params = useParams();
  const courseSlug = params.courseSlug;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseSlug) {
      const fetchCourse = async () => {
        setLoading(true);
        setError(null);
        const response = await getCourseBySlug(courseSlug);
        if (!response.error && response.data) {
          setCourse(response.data);
        } else {
          setError(`Failed to load course: ${response.data?.detail || 'Unknown error'}`);
          console.error("Error fetching course:", response);
        }
        setLoading(false);
      };
      fetchCourse();
    }
  }, [courseSlug]);

  if (loading) {
    return (
      <main className="container mx-auto py-8 px-4 text-gray-100">
        <LoadingState />
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto py-8 px-4 text-center text-red-400">
        <p>{error}</p>
        <Link href="/courses" className="text-primary-light hover:underline mt-4 inline-block">
          Back to Courses
        </Link>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="container mx-auto py-8 px-4 text-center text-gray-400">
        <p>Course not found.</p>
        <Link href="/courses" className="text-primary-light hover:underline mt-4 inline-block">
          Back to Courses
        </Link>
      </main>
    );
  }
  
  const pageTitle = course.name ? `${course.name} - Gyan Aangan` : "Course Details - Gyan Aangan";
  const pageDescription = course.meta_description || course.description || "Explore streams and academic years for this course.";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {course.og_image_url && <meta property="og:image" content={course.og_image_url} />}
      </Head>
      <main className="container mx-auto py-8 px-4 text-gray-100">
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
                <Link key={stream.slug} href={`/${courseSlug}/${stream.slug}`} className="group block bg-stone-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:border-primary/50">
                  {stream.og_image_url ? (
                    <div className="w-full h-40 bg-gray-700 overflow-hidden">
                      <img src={stream.og_image_url} alt={stream.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-stone-700 to-stone-600 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
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
    </>
  );
}
