'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStreamBySlug } from '../../../services/apiService'; // Adjust path
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import Head from 'next/head';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; // Import shadcn Breadcrumb components

// Skeleton Loader Components
const SkeletonCard = () => (
  <div className="bg-stone-800 border border-gray-700 rounded-lg p-5 animate-pulse">
    <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
  </div>
);

const LoadingState = () => (
  <div className="space-y-8">
    <div className="h-12 bg-gray-700 rounded w-1/2 animate-pulse mb-4"></div>
    <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse mb-6"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  </div>
);


export default function StreamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { courseSlug, streamSlug } = params;

  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parentCourseName, setParentCourseName] = useState('');


  useEffect(() => {
    if (streamSlug) {
      const fetchStream = async () => {
        setLoading(true);
        setError(null);
        const response = await getStreamBySlug(streamSlug);
        if (!response.error && response.data) {
          setStream(response.data);
          // Attempt to find the current course's name from the stream's associated courses
          const currentCourseInfo = response.data.courses?.find(c => c.slug === courseSlug);
          setParentCourseName(currentCourseInfo?.name || courseSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));


          // Redirect if only one year and it's relevant
          if (response.data.years && response.data.years.length === 1) {
            const year = response.data.years[0];
            // Check if this year is relevant for the current course context
            // This logic might need refinement based on how 'stream.years' is populated
            // For now, assume any year listed is relevant.
            router.replace(`/${courseSlug}/${streamSlug}/${year.slug}`);
          }
        } else {
          setError(`Failed to load stream: ${response.data?.detail || 'Unknown error'}`);
          console.error("Error fetching stream:", response);
        }
        setLoading(false);
      };
      fetchStream();
    }
  }, [streamSlug, courseSlug, router]);

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
        <Link href={`/${courseSlug}`} className="text-primary-light hover:underline mt-4 inline-block">
          Back to Course
        </Link>
      </main>
    );
  }

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

  const pageTitle = stream.name ? `${stream.name} - ${parentCourseName} - Gyan Aangan` : "Stream Details - Gyan Aangan";
  const pageDescription = stream.meta_description || stream.description || `Explore academic years for the ${stream.name} stream.`;


  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {stream.og_image_url && <meta property="og:image" content={stream.og_image_url} />}
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
    </>
  );
}
