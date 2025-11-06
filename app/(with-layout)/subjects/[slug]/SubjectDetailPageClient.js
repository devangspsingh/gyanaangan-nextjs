'use client';

import { useEffect, useState, useMemo, Suspense } from 'react'; // Added Suspense
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getResources } from '@/services/apiService'; // getSubjectBySlug is handled by server
import ResourceCard from '@/components/ResourceCard'; // Adjusted path
import ResourceCardSkeleton from '@/components/ResourceCardSkeleton'; // Adjusted path
// ... other imports ...
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FunnelIcon } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';


// Skeleton for the list of resources within this client component
const ResourcesListSkeleton = ({ count = 6 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
            <ResourceCardSkeleton key={index} />
        ))}
    </div>
);

export default function SubjectDetailPageClient({ slug, initialSubject }) {
    const router = useRouter();

    const [subject, setSubject] = useState(initialSubject);
    const [allResources, setAllResources] = useState([]);
    const [loadingResources, setLoadingResources] = useState(true); // Specific loading state for resources

    const [error, setError] = useState(!initialSubject ? 'Subject data not provided.' : null);

    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Set initial subject from props
        setSubject(initialSubject);
        if (!initialSubject) {
            setError('Subject data not available or failed to load from server.');
        } else {
            setError(null);
            // Fetch resources for this subject
            const fetchSubjectResources = async () => {
                setLoadingResources(true);
                const resourcesResponse = await getResources(1, 100, { subject_slug: initialSubject.slug });
                if (!resourcesResponse.error && resourcesResponse.data?.results) {
                    const sortedResources = (resourcesResponse.data.results || []).sort((a, b) =>
                        new Date(b.updated_at_iso || b.updated_at) - new Date(a.updated_at_iso || a.updated_at)
                    );
                    setAllResources(sortedResources);
                } else {
                    toast.error("Failed to load resources for this subject.");
                    console.error(`Failed to load resources for subject ${initialSubject.slug}:`, resourcesResponse.data?.detail);
                    setAllResources([]); // Ensure it's an empty array on error
                }
                setLoadingResources(false);
            };
            fetchSubjectResources();
        }
    }, [initialSubject]); // Depend on initialSubject prop

    const resourceTypes = useMemo(() => {
        const types = new Set((allResources || []).map(res => res.resource_type));
        return ['all', ...Array.from(types)];
    }, [allResources]);

    const filteredResources = useMemo(() => {
        return (allResources || [])
            .filter(resource => {
                const typeMatch = activeTab === 'all' || resource.resource_type === activeTab;
                const searchTermMatch = searchTerm === '' ||
                    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (resource.resource_type && resource.resource_type.toLowerCase().includes(searchTerm.toLowerCase()));
                return typeMatch && searchTermMatch;
            });
    }, [allResources, activeTab, searchTerm]);

    if (error || !subject) {
        return (
            <main className="container mx-auto py-8 px-4 text-gray-100">
                <Breadcrumb className="mb-6 text-sm">
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink asChild><Link href="/subjects">Subjects</Link></BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Error</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-10 text-red-400 bg-red-900/20 p-6 rounded-lg">
                    <p>{error || 'Subject not found or failed to load.'}</p>
                </div>
            </main>
        );
    }

    return (
        <>
            {/* Head component for client-side updates is less common with App Router's generateMetadata */}
            <main className="container mx-auto py-8 px-4 text-gray-100">
                <Breadcrumb className="mb-6 text-sm">
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink asChild><Link href="/subjects">Subjects</Link></BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage className="truncate max-w-[150px] sm:max-w-none" title={subject.name}>{subject.name}</BreadcrumbPage></BreadcrumbItem>
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

                    {/* Conditional rendering for resources list based on loadingResources state */}
                    {loadingResources ? (
                        <ResourcesListSkeleton count={6} />
                    ) : allResources.length > 0 ? (
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
                        <p className="text-gray-400 text-center py-8">No resources found for this subject yet.</p>
                    )}
                </section>
            </main>
        </>
    );
}
