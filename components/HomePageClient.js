'use client';

import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import { useState } from 'react'; // Removed useEffect and toast related to initial data fetching
// Import Skeleton Loaders
import CourseCardSkeleton from './CourseCardSkeleton';
import SubjectCardSkeleton from './SubjectCardSkeleton';
import ResourceCardSkeleton from './ResourceCardSkeleton';
import ResourceCard from './ResourceCard';
import CourseCard from './CourseCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'; // Assuming ScrollBar is used with ScrollArea
import SubjectCard from './SubjectCard';

// Helper component for sections (can remain here or be moved to a shared location)
function SectionWrapper({ id, title, description, linkHref, linkText, children }) {
  return (
    <section id={id} className="py-12 md:py-16">
      <div className="px-4 mx-auto max-w-screen-xl z-10 relative">
        <div>
          <h2 className="text-2xl md:text-4xl font-heading-section font-extrabold text-primary">{title}</h2>
          <p className="my-4 text-lg font-body-desc font-medium text-secondary">{description}</p>
        </div>
        {children}
        <div className="mt-8">
          <Link href={linkHref} className="text-primary-light text-lg hover:underline font-medium flex items-center gap-2 group">
            {linkText}
            <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePageClient({ courses, subjects, resources, notification, initialLoading = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  // Use initialLoading prop to determine if skeletons should be shown,
  // though with server components, data is usually pre-fetched.
  // This prop is more for a hybrid approach or if data isn't fully ready.
  const [loading, setLoading] = useState(initialLoading);


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // If data is fetched server-side, the loading state here is primarily for client-side interactions
  // or if the server component passes a loading prop. For a fully server-rendered page,
  // the server component would handle the "loading" by awaiting data or using Suspense.

  return (
    <main className="container mx-auto py-4 text-gray-100 px-4">
      <ScrollArea className="w-full"> {/* Ensure ScrollArea takes full width if needed */}
        <section
          className="min-h-[70vh] md:min-h-[90vh] relative flex flex-col justify-center items-center text-center py-16 px-4"
        >
          {notification && notification.title && ( // Check if notification object and title exist
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-2xl p-4 backdrop-blur-sm text-white rounded-lg shadow-lg z-20">
              <h3 className="font-bold">{notification.title}</h3>
              {notification.url && (
                <Link href={notification.url} className="text-primary-light hover:underline text-sm font-medium mt-2 inline-block">
                  Learn more <ArrowRightIcon className="w-4 h-4 inline" />
                </Link>
              )}
            </div>
          )}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[100px] md:w-[300px] md:h-[150px] bg-primary/50 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          </div>
          <div className="z-10 relative">
            <h1 className="text-primary mb-4 text-5xl font-heading-main font-bold tracking-tight leading-none md:text-5xl lg:text-6xl">
              Gyan Aangan
            </h1>
            <p className="mb-8 text-lg font-body-desc font-medium lg:text-xl sm:px-16 lg:px-48 text-secondary">
              Browse a variety of courses, subjects, and resources to enhance your knowledge.
            </p>
            <form onSubmit={handleSearch} className="w-full max-w-md mx-auto">
              <label htmlFor="search-main" className="mb-2 text-sm font-medium sr-only text-white">Search</label>
              <div className="relative flex items-center">
                <input
                  type="search"
                  id="search-main"
                  name="q"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full p-3 text-sm text-gray-400 bg-gray-50 border border-gray-300 rounded-full rounded-br-lg dark:bg-gray-200 dark:placeholder-gray-400 dark:text-gray-800"
                  placeholder="Search Courses, Subjects..."
                  required
                />
                <button
                  type="submit"
                  className="absolute end-1.5 bottom-1.5 p-2 text-sm font-medium h-auto text-primary-dark focus:outline-none"
                >
                  <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke='currentColor' strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                  </svg>
                  <span className="sr-only">Search</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        <SectionWrapper id="courses" title="Available Courses for Students" description="Explore a variety of courses to enhance your knowledge and skills. Our offerings include Bachelor of Technology (B.Tech) with specializations in Computer Science, Information Technology, and a common first-year stream for all disciplines, as well as Bachelor of Science (B.Sc) programs covering fundamental scientific concepts." linkHref="/courses" linkText="Explore All Available Courses">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <CourseCardSkeleton key={index} />)
            ) : courses && courses.length > 0 ? (
              courses.map(course => (
                <CourseCard key={course.id || course.slug} course={course} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400">No courses available at the moment.</p>
            )}
          </div>
        </SectionWrapper>

        <SectionWrapper id="subjects" title="Available Subjects for Students" description="Discover a wide range of subjects to boost your knowledge and skills. Our offerings include detailed notes, lab manuals, previous year questions, and curated resources, all designed to enhance your learning experience." linkHref="/subjects" linkText="Explore All Available Subjects">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => <SubjectCardSkeleton key={index} />)
            ) : subjects && subjects.length > 0 ? (
              subjects.map(subject => (
                <SubjectCard key={subject.id || subject.slug} subject={subject} url={`/subjects/${subject.slug}`} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400">No subjects available at the moment.</p>
            )}
          </div>
        </SectionWrapper>

        <SectionWrapper id="resources" title="Available Resources for Students" description="Explore a variety of resources to enhance your knowledge and skills. Our offerings include lab manuals, previous year questions (PYQ), PDFs, and notes, updated regularly to support your learning journey." linkHref="/resources" linkText="Explore All Available Resources">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => <ResourceCardSkeleton key={index} />)
            ) : resources && resources.length > 0 ? (
              resources.map(resource => (
                <ResourceCard key={resource.id || resource.slug} resource={resource} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400">No resources available at the moment.</p>
            )}
          </div>
        </SectionWrapper>
        <ScrollBar orientation="vertical" /> {/* Example if ScrollArea wraps the whole page */}
      </ScrollArea>
    </main>
  );
}
