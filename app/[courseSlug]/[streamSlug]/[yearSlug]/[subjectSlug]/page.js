'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSubjectBySlug, getResources, getSpecialPageData } from '../../../../../services/apiService'; // Adjust path
import ResourceCard from '../../../../../components/ResourceCard';
import ResourceCardSkeleton from '../../../../../components/ResourceCardSkeleton';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // ShadCN UI Tabs
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; // Import shadcn Breadcrumb components
import { FunnelIcon } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const SubjectLoadingState = () => (
  <div className="container mx-auto py-8 px-4 text-gray-100">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-6 bg-gray-700 rounded w-1/4 mb-6"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
    </div>
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <ResourceCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

export default function NestedSubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { courseSlug, streamSlug, yearSlug, subjectSlug } = params;

  const [subject, setSubject] = useState(null);
  const [allResources, setAllResources] = useState([]); // Store all fetched resources
  const [parentData, setParentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('all'); // For resource type filtering
  const [searchTerm, setSearchTerm] = useState('');   // For on-page search

  useEffect(() => {
    if (courseSlug && streamSlug && yearSlug && subjectSlug) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Fetch all resources for the subject by not limiting page_size, or by handling pagination if too many
          // For simplicity, fetching up to 100 resources. Adjust if more are expected.
          const [subjectResponse, resourcesResponse, parentDataResponse] = await Promise.all([
            getSubjectBySlug(subjectSlug),
            getResources(1, 100, { subject_slug: subjectSlug }),
            getSpecialPageData(courseSlug, streamSlug, yearSlug)
          ]);

          if (!subjectResponse.error && subjectResponse.data) {
            setSubject(subjectResponse.data);
          } else {
            throw new Error(`Failed to load subject: ${subjectResponse.data?.detail || 'Unknown error'}`);
          }

          if (!resourcesResponse.error && resourcesResponse.data) {
            // Sort resources by updated_at date, most recent first
            const sortedResources = (resourcesResponse.data.results || []).sort((a, b) =>
              new Date(b.updated_at_iso || b.updated_at) - new Date(a.updated_at_iso || a.updated_at)
            );
            setAllResources(sortedResources);
          } else {
            toast.error("Failed to load resources for this subject.");
          }

          if (!parentDataResponse.error && parentDataResponse.data) {
            setParentData(parentDataResponse.data);
          } else {
            setParentData({
              course: { name: courseSlug, slug: courseSlug },
              stream: { name: streamSlug, slug: streamSlug },
              year: { name: yearSlug, slug: yearSlug }
            });
            toast.warn("Could not load full breadcrumb details.");
          }

        } catch (err) {
          setError(err.message);
          console.error("Error fetching subject page data:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [courseSlug, streamSlug, yearSlug, subjectSlug]);

  const resourceTypes = useMemo(() => {
    const types = new Set(allResources.map(res => res.resource_type));
    return ['all', ...Array.from(types)];
  }, [allResources]);

  const filteredResources = useMemo(() => {
    return allResources
      .filter(resource => {
        const typeMatch = activeTab === 'all' || resource.resource_type === activeTab;
        const searchTermMatch = searchTerm === '' ||
          resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (resource.resource_type && resource.resource_type.toLowerCase().includes(searchTerm.toLowerCase()))
        return typeMatch && searchTermMatch;
      });
    // Resources are already sorted by date from the initial fetch
  }, [allResources, activeTab, searchTerm]);


  if (loading) {
    return <SubjectLoadingState />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-gray-100">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!subject || !parentData) {
    return (
      <div className="container mx-auto py-8 px-4 text-gray-100">
        <p className="text-gray-400">Subject or parent data not found.</p>
      </div>
    );
  }

  const pageTitle = subject.name ? `${subject.name} - ${parentData.course?.name} - Gyan Aangan` : "Subject Details - Gyan Aangan";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={subject.meta_description || "Subject details and resources on Gyan Aangan"} />
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
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-semibold text-white">Available Resources</h2>
            <div className="relative max-w-sm grow w-full sm:w-auto">
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
              <span

                className="absolute end-1.5 bottom-1.5 p-2 text-sm font-medium h-auto text-primary-dark focus:outline-none"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </span>
            </div>
          </div>

          {allResources.length > 0 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center gap-x-3 mb-4">
                <FunnelIcon className="h-5 w-5 text-gray-300 flex-shrink-0" aria-hidden="true" />
                <ScrollArea className="overflow-x-auto">
                  <TabsList className="flex-grow flex items-center justify-start space-x-2 sm:space-x-3 overflow-x-auto h-auto pb-2 bg-transparent scrollbar-thin scrollbar-thumb-stone-600 scrollbar-track-stone-800 focus-visible:ring-0 focus-visible:outline-none">
                    {resourceTypes.map((type) => (
                      <TabsTrigger
                        key={type}
                        value={type}
                        className="capitalize px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap bg-stone-700 text-gray-300 hover:bg-stone-600 hover:text-gray-100 data-[state=active]:bg-secondary data-[state=active]:text-primary-dark data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
                      >
                        {type === 'all' ? 'All Types' : type.replace(/_/g, ' ')}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <ScrollBar state="visible" orientation="horizontal" />
                </ScrollArea>
              </div>

              <TabsContent value={activeTab} className="mt-2">
                {filteredResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource) => (
                      <ResourceCard
                        key={resource.slug}
                        resource={resource}
                        customHref={`/${courseSlug}/${streamSlug}/${yearSlug}/${subjectSlug}/${resource.slug}`}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    No resources match your current filter or search term.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-gray-400">No resources found for this subject yet.</p>
          )}
        </section>
      </main>
    </>
  );
}