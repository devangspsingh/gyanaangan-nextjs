'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getSpecialPageData } from '../../../../services/apiService'; // Adjust path
import SubjectCard from '../../../../components/SubjectCard'; // Assuming SubjectCard is reusable
import SubjectCardSkeleton from '../../../../components/SubjectCardSkeleton'; // Assuming you have this
import Head from 'next/head';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; // Import shadcn Breadcrumb components

const LoadingState = () => (
  <div className="space-y-8">
    <div className="h-12 bg-gray-700 rounded w-1/2 animate-pulse mb-4"></div>
    <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => <SubjectCardSkeleton key={i} />)}
    </div>
  </div>
);

export default function SpecialPage() {
  const params = useParams();
  const { courseSlug, streamSlug, yearSlug } = params;

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseSlug && streamSlug && yearSlug) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        const response = await getSpecialPageData(courseSlug, streamSlug, yearSlug);
        if (!response.error && response.data) {
          setPageData(response.data);
        } else {
          setError(`Failed to load page data: ${response.data?.detail || 'Unknown error'}`);
          console.error("Error fetching special page data:", response);
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [courseSlug, streamSlug, yearSlug]);

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
        <Link href={`/courses/${courseSlug}/${streamSlug}`} className="text-primary-light hover:underline mt-4 inline-block">
          Back to Stream
        </Link>
      </main>
    );
  }

  if (!pageData) {
    return (
      <main className="container mx-auto py-8 px-4 text-center text-gray-400">
        <p>Page data not found.</p>
        <Link href={`/courses/${courseSlug}/${streamSlug}`} className="text-primary-light hover:underline mt-4 inline-block">
          Back to Stream
        </Link>
      </main>
    );
  }
  
  const pageTitle = pageData.name ? `${pageData.name} - Gyan Aangan` : "Academic Year Details - Gyan Aangan";
  const pageDescription = pageData.meta_description || pageData.description || `Subjects and resources for ${pageData.course?.name}, ${pageData.stream?.name}, ${pageData.year?.name}.`;


  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {pageData.og_image_url && <meta property="og:image" content={pageData.og_image_url} />}
      </Head>
      <main className="container mx-auto py-8 px-4 text-gray-100">
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

          <h1 className="md:text-4xl text-2xl font-bold text-white mb-2">
          {pageData.course?.name} - {pageData.stream?.name} {pageData.year?.name}
           
          </h1>
          <p className="text-lg md:text-xl text-gray-400">
            For  {pageData.year?.name ? `${pageData.year.name} Subjects` : `Year ${pageData.year?.year} Students`}
          </p>
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
    </>
  );
}
