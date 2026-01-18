'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ResourceCard from '@/components/ResourceCard';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/20/solid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AdContainer } from '@/components/blog/AdContainer';
import { AdUnit } from '@/components/blog/AdUnit';

export default function SubjectDetailPageClient({ subject, resources = [] }) {
    // No useEffect or API calls here anymore! 
    // Data is passed in fully ready from the server.

    const router = useRouter();
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Extract unique resource types from the props
    const resourceTypes = useMemo(() => {
        const types = new Set(resources.map(res => res.resource_type));
        return ['all', ...Array.from(types)];
    }, [resources]);

    // Filter logic remains on the client for instant interaction
    const filteredResources = useMemo(() => {
        return resources.filter(resource => {
            const typeMatch = activeTab === 'all' || resource.resource_type === activeTab;
            const searchTermMatch = searchTerm === '' ||
                resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (resource.resource_type && resource.resource_type.toLowerCase().includes(searchTerm.toLowerCase()));
            return typeMatch && searchTermMatch;
        });
    }, [resources, activeTab, searchTerm]);

    return (
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

            <AdContainer>
                <AdUnit data-ad-client='7707469085' />
            </AdContainer>

            <section>
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-semibold text-white">Available Resources</h2>
                    <div className="relative max-w-sm grow w-full sm:w-auto">
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full p-3 text-sm text-gray-400 bg-gray-50 border border-gray-300 rounded-full rounded-br-lg dark:bg-gray-200 dark:placeholder-gray-400 dark:text-gray-800"
                            placeholder="Search Resources..."
                        />
                        <span className="absolute end-1.5 bottom-1.5 p-2 text-sm font-medium h-auto text-primary-dark focus:outline-none">
                            <MagnifyingGlassIcon className="w-5 h-5" />
                        </span>
                    </div>
                </div>

                {resources.length > 0 ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex items-center gap-x-3 mb-4">
                            <FunnelIcon className="h-5 w-5 text-gray-300 flex-shrink-0" aria-hidden="true" />
                            <ScrollArea className="overflow-x-auto">
                                <TabsList className="flex-grow flex items-center justify-start space-x-2 sm:space-x-3 overflow-x-auto h-auto pb-2 bg-transparent">
                                    {resourceTypes.map((type) => (
                                        <TabsTrigger
                                            key={type}
                                            value={type}
                                            className="capitalize px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap bg-stone-700 text-gray-300 hover:bg-stone-600 hover:text-gray-100 data-[state=active]:bg-secondary data-[state=active]:text-primary-dark"
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
                                        <ResourceCard key={resource.slug} resource={resource} />
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

            <AdContainer>
                <AdUnit data-ad-client='7707469085' />
            </AdContainer>
        </main>
    );
}