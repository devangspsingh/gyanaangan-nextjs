'use client';

import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getResourceBySlug, toggleSaveResource } from '@/services/apiService'; // Added getResourceBySlug, toggleSaveResource
import toast from 'react-hot-toast';
import { BookmarkIcon as BookmarkOutlineIcon, ShareIcon, ArrowDownIcon as DownloadIconHero, ArrowLeftIcon } from 'lucide-react';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Viewer from '@/components/Viewer';
import ResourceCard from '@/components/ResourceCard';
import { Badge } from "@/components/ui/badge"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from '@/context/AuthContext'; // For save/download auth checks
import LoginDialog from '@/components/Auth/LoginDialog';
import { GoogleLogin } from '@react-oauth/google';
import api_client from '@/lib/axiosInstance'; // For login dialog
import { Button } from '@/components/ui/button'; // For actions
import { GoogleAdUnit } from '@mesmotronic/next-adsense';

// Skeleton for the main content area when resource is loading client-side
const ClientResourceLoadingSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-10 bg-gray-700 rounded w-3/4 mb-3"></div> {/* Title */}
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div> {/* Meta */}
        <div className="h-96 bg-gray-700 rounded w-full mb-6"></div> {/* Viewer placeholder */}
        <div className="h-20 bg-gray-700 rounded w-full mb-6"></div> {/* Description placeholder */}
    </div>
);


export default function NestedResourceDetailPageClient({
    params,
    // initialResource removed
    serverFetchedParentData,
    serverFetchedRelatedResources
}) {
    const { courseSlug, streamSlug, yearSlug, subjectSlug, resourceSlug } = params;
    // const clientRouter = useRouter();
    const { isAuthenticated, login: setAuthState } = useAuth();

    const [resource, setResource] = useState(null); // Main resource fetched client-side
    const [parentData, setParentData] = useState(serverFetchedParentData);
    const [relatedResources, setRelatedResources] = useState(serverFetchedRelatedResources || []);

    const [loadingResource, setLoadingResource] = useState(true); // For client-side resource fetch
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [currentIsSaved, setCurrentIsSaved] = useState(false);


    useEffect(() => {
        // Update parent and related data if props change (though typically stable after initial server fetch)
        setParentData(serverFetchedParentData);
        setRelatedResources(serverFetchedRelatedResources || []);
    }, [serverFetchedParentData, serverFetchedRelatedResources]);

    useEffect(() => {
        const fetchResourceData = async () => {
            if (resourceSlug) {
                setLoadingResource(true);
                setError(null);
                try {
                    const resourceResponse = await getResourceBySlug(resourceSlug); // Client-side API call
                    if (resourceResponse.error || !resourceResponse.data) {
                        setError(resourceResponse.data?.detail || 'Failed to load resource.');
                        setResource(null);
                    } else {
                        setResource(resourceResponse.data);
                        setCurrentIsSaved(resourceResponse.data.is_saved);
                    }
                } catch (e) {
                    console.error("Error fetching resource details client-side:", e);
                    setError('An unexpected error occurred while fetching resource.');
                    setResource(null);
                }
                setLoadingResource(false);
            } else {
                setError("Resource identifier (slug) is missing.");
                setLoadingResource(false);
            }
        };
        fetchResourceData();
    }, [resourceSlug]); // Fetch resource when slug changes

    useEffect(() => {
        if (resource) {
            setCurrentIsSaved(resource.is_saved);
        }
    }, [resource, isAuthenticated]); // Re-check isSaved if auth state changes or resource reloads


    const handleSaveToggle = async () => {
        if (!isAuthenticated) { setIsLoginModalOpen(true); return; }
        if (!resource) return;
        setIsSaving(true);
        const response = await toggleSaveResource(resource.slug);
        if (!response.error) {
            setCurrentIsSaved(response.data.saved);
            // Update resource in state to reflect save status for other components if needed
            setResource(prev => ({ ...prev, is_saved: response.data.saved }));
            toast.success(response.data.saved ? 'Resource saved!' : 'Resource unsaved.');
        } else {
            toast.error(response.data?.detail || 'Failed to update save status.');
        }
        setIsSaving(false);
    };


    const handleShare = async () => {
        if (navigator.share && resource) {
            try {
                await navigator.share({
                    title: resource.name,
                    text: resource.description || `Check out this resource: ${resource.name}`,
                    url: window.location.href,
                });
            } catch (error) {
                if (error.name !== 'AbortError') toast.error('Error sharing');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleGoogleLoginSuccessForModal = async (credentialResponse) => {
        try {
            const idToken = credentialResponse.credential;
            const backendResponse = await api_client.post('/auth/google/', { id_token: idToken });
            const { user: loggedInUser, access, refresh } = backendResponse.data;
            setAuthState(loggedInUser, access, refresh);
            toast.success('Logged in successfully!');
            setIsLoginModalOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.detail || err.message || 'Login failed.');
        }
    };


    const displayParentData = parentData || {
        course: { name: courseSlug, slug: courseSlug },
        stream: { name: streamSlug, slug: streamSlug },
        year: { name: yearSlug, slug: yearSlug },
    };

    const breadcrumbSubjectName = resource?.subject_name || displayParentData.subjects?.find(s => s.slug === subjectSlug)?.name || subjectSlug;


    if (error) {
        // Fallback for parentData in error display
        const displayErrorParentData = parentData || {
            course: { name: courseSlug || "Course", slug: courseSlug },
            stream: { name: streamSlug || "Stream", slug: streamSlug },
            year: { name: yearSlug || "Year", slug: yearSlug },
        };
        return (
            <main className="container mx-auto py-8 px-4 text-gray-100">
                <Breadcrumb className="mb-6 text-sm">
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink asChild><Link href="/courses">Courses</Link></BreadcrumbLink></BreadcrumbItem>
                        {courseSlug && (<> <BreadcrumbSeparator /> <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}`}>{displayErrorParentData.course?.name || courseSlug}</Link></BreadcrumbLink></BreadcrumbItem> </>)}
                        {streamSlug && (<> <BreadcrumbSeparator /> <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}/${streamSlug}`}>{displayErrorParentData.stream?.name || streamSlug}</Link></BreadcrumbLink></BreadcrumbItem> </>)}
                        {yearSlug && (<> <BreadcrumbSeparator /> <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}/${streamSlug}/${yearSlug}`}>{displayErrorParentData.year?.name || yearSlug}</Link></BreadcrumbLink></BreadcrumbItem> </>)}
                        {subjectSlug && (<> <BreadcrumbSeparator /> <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}/${streamSlug}/${yearSlug}/${subjectSlug}`}>{subjectSlug.replace(/-/g, ' ')}</Link></BreadcrumbLink></BreadcrumbItem> </>)}
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Error</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-10 text-red-400 bg-red-900/20 p-6 rounded-lg">
                    <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h2 className="text-xl font-semibold mb-2">Resource Error</h2>
                    <p>{error || 'Resource not found or failed to load.'}</p>
                    <button
                        onClick={() => clientRouter.back()}
                        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" /> Go Back
                    </button>
                </div>
            </main>
        );
    }

    // Combined loading state for initial parent data and client-side resource fetch
    if (!parentData && loadingResource) { // Still waiting for server props OR client resource
        return (
            <main className="container mx-auto py-8 px-4 text-gray-100">
                {/* Show a simpler loading state if parentData isn't even there yet */}
                <div className="h-6 bg-gray-700 rounded w-full mb-4 animate-pulse"></div> {/* Breadcrumb placeholder */}
                <ClientResourceLoadingSkeleton />
            </main>
        );
    }


    return (
        <>
            {isLoginModalOpen && (
                <LoginDialog
                    isOpen={isLoginModalOpen}
                    onOpenChange={setIsLoginModalOpen}
                    title="Login Required"
                    description="Please login to perform this action."
                >
                    <div className="flex flex-col items-center space-y-4 p-4">
                        <GoogleLogin onSuccess={handleGoogleLoginSuccessForModal} onError={() => toast.error('Google login failed.')} theme="filled_blue" shape="pill" />
                    </div>
                </LoginDialog>
            )}
            <main className="container mx-auto py-8 px-4 text-gray-100">
                <Breadcrumb className="mb-6 text-sm">
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
                        {displayParentData?.course && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}`}>{displayParentData.course?.name || courseSlug}</Link></BreadcrumbLink></BreadcrumbItem>
                            </>
                        )}
                        {displayParentData?.stream && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}/${streamSlug}`}>{displayParentData.stream?.name || streamSlug}</Link></BreadcrumbLink></BreadcrumbItem>
                            </>
                        )}
                        {displayParentData?.year && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}/${streamSlug}/${yearSlug}`}>{displayParentData.year?.name || yearSlug}</Link></BreadcrumbLink></BreadcrumbItem>
                            </>
                        )}
                        {subjectSlug && ( // Ensure subjectSlug exists before trying to link
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem><BreadcrumbLink asChild><Link href={`/${courseSlug}/${streamSlug}/${yearSlug}/${subjectSlug}`}>{breadcrumbSubjectName}</Link></BreadcrumbLink></BreadcrumbItem>
                            </>
                        )}
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage className="truncate max-w-[150px] sm:max-w-none" title={resource?.name || resourceSlug}>{resource?.name || resourceSlug}</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {loadingResource ? (
                    <ClientResourceLoadingSkeleton />
                ) : !resource ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-10 text-gray-400 bg-stone-800/30 p-6 rounded-lg">
                        <InformationCircleIcon className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                        <h2 className="text-xl font-semibold mb-2">Resource Not Found</h2>
                        <p>The specific resource details could not be loaded.</p>
                        <Button onClick={() => clientRouter.back()} className="mt-6" variant="outline">
                            <ArrowLeftIcon className="h-5 w-5 mr-2" /> Go Back
                        </Button>
                    </div>
                ) : (
                    <>
                        <header className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-heading-section font-extrabold text-white mb-3">{resource.name}</h1>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 xl:col-span-9">
                                <Viewer resource={resource} />
                                {resource.description && (
                                    <section className="mt-8 rounded-lg shadow">
                                        <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
                                        <p className="text-gray-300 font-body-desc leading-relaxed whitespace-pre-wrap">{resource.description}</p>
                                        <div className="font-body-desc py-2 text-gray-400 flex flex-wrap gap-2 mt-3">
                                            <Badge variant="outline" className={"text-md"}>Type: {resource.resource_type_display || resource.resource_type}</Badge>
                                            {resource.subject_name && <Badge className="text-md" variant="outline">Subject: {resource.subject_name}</Badge>}
                                            {resource.educational_year?.name && <Badge className="text-md" variant="outline">Year: {resource.educational_year.name}</Badge>}
                                            {resource.updated_at && <Badge className="text-md" variant="outline">Last Updated: {resource.updated_at}</Badge>}
                                        </div>
                                    </section>
                                )}
                            </div>

                            <GoogleAdUnit>
                                <ins
                                    className="adsbygoogle"
                                    style={{ display: "block" }}
                                    data-ad-client="ca-pub-3792754105959046"
                                    data-ad-slot="1937256059"
                                    data-ad-format="auto"
                                    data-full-width-responsive="true"
                                ></ins>
                            </GoogleAdUnit>

                            
                            <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
                                <div className="rounded-lg shadow">
                                    <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                                    <div className="space-y-3">
                                        <Button
                                            onClick={handleSaveToggle}
                                            disabled={isSaving}
                                            variant="outline"
                                            className="w-full justify-start text-gray-200 hover:bg-stone-700 border-stone-600"
                                        >
                                            {currentIsSaved ? <BookmarkSolidIcon className="w-5 h-5 mr-2 text-primary" /> : <BookmarkOutlineIcon className="w-5 h-5 mr-2" />}
                                            {isSaving ? 'Saving...' : (currentIsSaved ? 'Unsave Resource' : 'Save Resource')}
                                        </Button>
                                        {resource.privacy?.includes('download') && resource.download_url && (
                                            <Button variant="outline" className="w-full text-gray-200 hover:bg-stone-700 border-stone-600">
                                                <Link
                                                    href={resource.download_url}
                                                    target='_blank'
                                                    className="flex w-full justify-start items-center text-gray-200 hover:bg-stone-700 border-stone-600"
                                                >
                                                    <DownloadIconHero className="w-5 h-5 mr-2" />
                                                    Download
                                                </Link>
                                            </Button>
                                        )}
                                        <Button
                                            onClick={handleShare}
                                            variant="outline"
                                            className="w-full justify-start text-gray-200 hover:bg-stone-700 border-stone-600"
                                        >
                                            <ShareIcon className="w-5 h-5 mr-2" />
                                            Share
                                        </Button>
                                    </div>
                                </div>
                                {resource.tags && resource.tags.length > 0 && (
                                    <div className="p-6 bg-stone-800 rounded-lg shadow">
                                        <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {resource.tags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="bg-stone-700 text-gray-300 hover:bg-stone-600">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </aside>
                        </div>


                        {relatedResources.length > 0 && (
                            <section className="mt-12 pt-8 border-t border-stone-700">
                                <h2 className="text-2xl font-semibold text-white mb-6">
                                    {resource.subject_name ? `More from ${resource.subject_name}` : (subjectSlug ? `More from ${subjectSlug.replace(/-/g, ' ')}` : "Related Resources")}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {relatedResources.map(relatedRes => (
                                        <ResourceCard
                                            key={relatedRes.slug}
                                            resource={relatedRes}
                                            customHref={(courseSlug && streamSlug && yearSlug && subjectSlug) ? `/${courseSlug}/${streamSlug}/${yearSlug}/${subjectSlug}/${relatedRes.slug}` : `/resources/${relatedRes.slug}`}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                        {serverFetchedRelatedResources && serverFetchedRelatedResources.length === 0 && subjectSlug && (
                            <section className="mt-12 pt-8 border-t border-stone-700">
                                <h2 className="text-2xl font-semibold text-white mb-6">
                                    {resource.subject_name ? `More from ${resource.subject_name}` : (subjectSlug ? `More from ${subjectSlug.replace(/-/g, ' ')}` : "Related Resources")}
                                </h2>
                                <p className="text-gray-400">No other resources found for this subject.</p>
                            </section>
                        )}
                    </>
                )}
            </main>
        </>
    );
}
