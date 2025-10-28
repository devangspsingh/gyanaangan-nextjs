import Link from 'next/link';
import { getSubjectBySlug, getResources, getSpecialPageData } from '../../../../../services/apiService';
import SubjectResourcesClient from '../../../../../components/SubjectResourcesClient';
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
  
  const { courseSlug, streamSlug, yearSlug, subjectSlug } = params;
  
  try {
    const [subjectResponse, parentDataResponse] = await Promise.all([
      getSubjectBySlug(subjectSlug),
      getSpecialPageData(courseSlug, streamSlug, yearSlug)
    ]);

    if (subjectResponse.error || !subjectResponse.data) {
      return {
        title: 'Subject Not Found - Gyan Aangan',
        description: 'The requested subject could not be found.',
      };
    }

    const subject = subjectResponse.data;
    const parentData = parentDataResponse.data || {};
    const pageTitle = subject.name 
      ? `${subject.name} - ${parentData.course?.name || ''} - Gyan Aangan` 
      : "Subject Details - Gyan Aangan";
    const pageDescription = subject.meta_description || subject.description || "Subject details and resources on Gyan Aangan";

    return {
      title: pageTitle,
      description: pageDescription,
      openGraph: {
        title: pageTitle,
        description: pageDescription,
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDescription,
      },
    };
  } catch (error) {
    console.error('❌ [Subject Page] Error generating metadata:', error);
    return {
      title: 'Subject Details - Gyan Aangan',
      description: 'Subject details and resources on Gyan Aangan',
    };
  }
}

export default async function NestedSubjectDetailPage({ params }) {
  
  const { courseSlug, streamSlug, yearSlug, subjectSlug } = params;

  try {
    // Fetch all data in parallel
    const [subjectResponse, resourcesResponse, parentDataResponse] = await Promise.all([
      getSubjectBySlug(subjectSlug),
      getResources(1, 100, { subject_slug: subjectSlug }),
      getSpecialPageData(courseSlug, streamSlug, yearSlug)
    ]);


    // Handle subject error
    if (subjectResponse.error || !subjectResponse.data) {
      const errorMessage = subjectResponse.data?.detail || 'Unknown error';
      console.error('❌ [Subject Page] Failed to load subject:', errorMessage);
      
      return (
        <div className="container mx-auto py-8 px-4 text-gray-100">
          <p className="text-red-500">Error: Failed to load subject: {errorMessage}</p>
          <Link href={`/${courseSlug}/${streamSlug}/${yearSlug}`} className="text-primary-light hover:underline mt-4 inline-block">
            Back to Year
          </Link>
        </div>
      );
    }

    const subject = subjectResponse.data;

    // Handle resources
    let allResources = [];
    if (!resourcesResponse.error && resourcesResponse.data) {
      // Sort resources by updated_at date, most recent first
      allResources = (resourcesResponse.data.results || []).sort((a, b) =>
        new Date(b.updated_at_iso || b.updated_at) - new Date(a.updated_at_iso || a.updated_at)
      );
      // console.log('✅ [Subject Page] Resources loaded:', allResources.length);
    } else {
      console.warn('⚠️ [Subject Page] Failed to load resources');
    }

    // Handle parent data
    let parentData;
    if (!parentDataResponse.error && parentDataResponse.data) {
      parentData = parentDataResponse.data;
    } else {
      // Fallback parent data
      parentData = {
        course: { name: courseSlug, slug: courseSlug },
        stream: { name: streamSlug, slug: streamSlug },
        year: { name: yearSlug, slug: yearSlug }
      };
      console.warn('⚠️ [Subject Page] Using fallback breadcrumb data');
    }

    return (
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
                <Link href={`/${courseSlug}`} className="truncate max-w-[100px] sm:max-w-none" title={parentData.course?.name}>{parentData.course?.name || courseSlug}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${courseSlug}/${streamSlug}`} className="truncate max-w-[100px] sm:max-w-none" title={parentData.stream?.name}>{parentData.stream?.name || streamSlug}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${courseSlug}/${streamSlug}/${yearSlug}`} className="truncate max-w-[80px] sm:max-w-none" title={parentData.year?.name}>{parentData.year?.name || yearSlug}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate max-w-[100px] sm:max-w-none" title={subject.name}>{subject.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{subject.name}</h1>
          {subject.common_name && <p className="text-lg text-gray-400 mb-1">({subject.common_name})</p>}
          {subject.description && <p className="text-gray-300 mt-2 leading-relaxed">{subject.description}</p>}
        </header>

        <section>
          <SubjectResourcesClient 
            allResources={allResources}
            courseSlug={courseSlug}
            streamSlug={streamSlug}
            yearSlug={yearSlug}
            subjectSlug={subjectSlug}
          />
        </section>
      </main>
    );
  } catch (error) {
    console.error('❌ [Subject Page] Unexpected error:', error);
    return (
      <div className="container mx-auto py-8 px-4 text-gray-100">
        <p className="text-red-500">An unexpected error occurred: {error.message}</p>
        <Link href={`/${courseSlug}/${streamSlug}/${yearSlug}`} className="text-primary-light hover:underline mt-4 inline-block">
          Back to Year
        </Link>
      </div>
    );
  }
}

export const dynamic = 'force-dynamic';