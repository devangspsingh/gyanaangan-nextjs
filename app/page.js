import { Suspense } from 'react';

// Import Card Skeletons (these are used by the client list components as fallbacks)
import CourseCardSkeleton from '../components/CourseCardSkeleton';
import SubjectCardSkeleton from '../components/SubjectCardSkeleton';
import ResourceCardSkeleton from '../components/ResourceCardSkeleton';

// Import new Client List Components
import CoursesListClient from '../components/home/CoursesListClient';
import SubjectsListClient from '../components/home/SubjectsListClient';
import ResourcesListClient from '../components/home/ResourcesListClient';

// Import HeroSearchForm (Client Component) and SectionWrapper (Server Component)
import HeroSearchForm from '../components/HeroSearchForm';
import SectionWrapper from '../components/SectionWrapper';
import BannerSlider from '../components/BannerSlider';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import { getLatestNotification, getActiveBanners } from '@/services/apiService';

// Skeleton for individual sections, used as Suspense fallback
const SectionContentSkeleton = ({ count = 3, CardSkeletonComponent }) => (
  <div className={`grid grid-cols-1 ${CardSkeletonComponent === CourseCardSkeleton ? 'sm:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
    {[...Array(count)].map((_, index) => <CardSkeletonComponent key={index} />)}
  </div>
);


export default async function HomePage() {
  // const notificationResponse = await getLatestNotification();
  // const notification = notificationResponse.error ? null : notificationResponse.data;
  // if (notificationResponse.error && notificationResponse.data !== null) {
  //   console.error("Failed to load notification.");
  // }

  // Fetch active banners
  const bannersResponse = await getActiveBanners();
  const banners = bannersResponse.error ? [] : bannersResponse.data;
  if (bannersResponse.error) {
    console.error("Failed to load banners.");
  }

  return (
    <>
       
        {banners.length > 0 && (
           <section className="mb-8">
             <BannerSlider banners={banners} />
           </section>
         )}
    <main className="container mx-auto pb-4 text-gray-100">
      <ScrollArea className="w-full">
            {/* Banner Section - Renders immediately after navbar */}
        {/* Hero Section - Renders immediately */}
        <section
          className="min-h-[70vh] md:min-h-[70vh] relative flex flex-col justify-top items-center text-center py-16 px-4"
        >


          {/* {notification && notification.title && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-2xl p-4 backdrop-blur-sm text-white rounded-lg shadow-lg z-20">
              <h3 className="font-bold">{notification.title}</h3>
              {notification.url && (
                <Link href={notification.url} className="text-primary-light hover:underline text-sm font-medium mt-2 inline-block">
                  Learn more <ArrowRightIcon className="w-4 h-4 inline" />
                </Link>
              )}
            </div>
          )} */}
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
            <HeroSearchForm /> {/* Client Component for search form - Renders immediately */}
          </div>
        </section>

        {/* Courses Section - Wrapper renders immediately, content streams with Suspense */}
          <SectionWrapper 
              id="courses" 
              title="Available Courses for Students" 
              description="Explore our current course offerings, including Bachelor of Science (B.Sc) in Computer Science and Bachelor of Technology (B.Tech) with specializations in Computer Science, Information Technology, and a common first-year stream. We are continuously expanding our programs to cover more areas of study." 
              linkHref="/courses" 
              linkText="Explore All Available Courses"
          >
            <Suspense fallback={<SectionContentSkeleton count={4} CardSkeletonComponent={CourseCardSkeleton} />}>
              <CoursesListClient />
            </Suspense>
          </SectionWrapper>

          {/* Subjects Section - Wrapper renders immediately, content streams with Suspense */}
        <SectionWrapper 
            id="subjects" 
            title="Available Subjects for Students" 
            description="Discover a wide range of subjects to boost your knowledge and skills. Our offerings include detailed notes, lab manuals, previous year questions, and curated resources, all designed to enhance your learning experience." 
            linkHref="/subjects" 
            linkText="Explore All Available Subjects"
        >
          <Suspense fallback={<SectionContentSkeleton count={6} CardSkeletonComponent={SubjectCardSkeleton} />}>
            <SubjectsListClient />
          </Suspense>
        </SectionWrapper>

        {/* Resources Section - Wrapper renders immediately, content streams with Suspense */}
        <SectionWrapper 
            id="resources" 
            title="Available Resources for Students" 
            description="Explore a variety of resources to enhance your knowledge and skills. Our offerings include lab manuals, previous year questions (PYQ), PDFs, and notes, updated regularly to support your learning journey." 
            linkHref="/resources" 
            linkText="Explore All Available Resources"
        >
          <Suspense fallback={<SectionContentSkeleton count={6} CardSkeletonComponent={ResourceCardSkeleton} />}>
            <ResourcesListClient />
          </Suspense>
        </SectionWrapper>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </main>

    </>
  );
}
