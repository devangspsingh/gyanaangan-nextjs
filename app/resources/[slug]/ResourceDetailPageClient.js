'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getResourceBySlug, getResources, toggleSaveResource, downloadResourceFile } from '@/services/apiService';
import Viewer from '@/components/Viewer';
import ResourceCard from '@/components/ResourceCard';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
    ArrowDownTrayIcon as DownloadIconHero, // Using consistent icon name
    BookmarkIcon as BookmarkOutlineIcon,
    ShareIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    ArrowLeftIcon // Using outline version
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import LoginDialog from '@/components/Auth/LoginDialog';
import { GoogleLogin } from '@react-oauth/google';
import api_client from '@/lib/axiosInstance'; // Renamed to avoid conflict
import { useRouter } from 'next/navigation'; // useRouter for back button

// Skeleton for the main content area when resource is loading client-side
const ClientResourceLoadingSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-10 bg-gray-700 rounded w-3/4 mb-3"></div> {/* Title */}
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div> {/* Meta */}
        <div className="h-96 bg-gray-700 rounded w-full mb-6"></div> {/* Viewer placeholder */}
        <div className="h-20 bg-gray-700 rounded w-full mb-6"></div> {/* Description placeholder */}
    </div>
);


export default function ResourceDetailPageClient({ slug }) {
    const [resource, setResource] = useState(null);
    const [relatedResources, setRelatedResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, user, login: setAuthState } = useAuth();
    const [currentIsSaved, setCurrentIsSaved] = useState(false); // Renamed for clarity
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (slug) {
            const fetchResourceData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const resourceResponse = await getResourceBySlug(slug);
                    if (resourceResponse.error || !resourceResponse.data) {
                        setError(resourceResponse.data?.detail || 'Failed to load resource.');
                        setResource(null);
                    } else {
                        setResource(resourceResponse.data);
                        setCurrentIsSaved(resourceResponse.data.is_saved);

                        if (resourceResponse.data.subject_slug) {
                            const relatedResponse = await getResources(1, 7, { subject_slug: resourceResponse.data.subject_slug });
                            if (!relatedResponse.error && relatedResponse.data?.results) {
                                setRelatedResources(relatedResponse.data.results.filter(r => r.slug !== slug).slice(0, 6));
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error fetching resource details:", e);
                    setError('An unexpected error occurred.');
                    setResource(null);
                }
                setLoading(false);
            };
            fetchResourceData();
        }
    }, [slug]);

    useEffect(() => {
        if (resource) {
            setCurrentIsSaved(resource.is_saved);
        }
    }, [resource, isAuthenticated]);

    const handleSaveToggle = async () => {
        if (!isAuthenticated) { setIsLoginModalOpen(true); return; }
        if (!resource) return;
        setIsSaving(true);
        const response = await toggleSaveResource(resource.slug);
        if (!response.error) {
            setCurrentIsSaved(response.data.saved);
            setResource(prev => ({ ...prev, is_saved: response.data.saved }));
            toast.success(response.data.saved ? 'Resource saved!' : 'Resource unsaved.');
        } else {
            toast.error(response.data?.detail || 'Failed to update save status.');
        }
        setIsSaving(false);
    };

    const handleDownload = async () => {
        if (!resource || !resource.privacy?.includes('download')) {
            toast.error('This resource is not available for download.');
            return;
        }
        if (!isAuthenticated) { setIsLoginModalOpen(true); return; }
        setIsDownloading(true);
        const fileExtension = resource.file ? resource.file.substring(resource.file.lastIndexOf('.')) : '.dat';
        const result = await downloadResourceFile(resource.download_url, resource.name, fileExtension);
        if (result.success) { toast.success('Download started!'); }
        else { toast.error(result.message || 'Download failed.'); }
        setIsDownloading(false);
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
        } catch (err) { // Changed error variable name
            toast.error(err.response?.data?.detail || err.message || 'Login failed.');
        }
    };


    if (loading) {
        return (
            <main className="container mx-auto py-8 px-4 text-gray-100">
                <div className="h-6 bg-gray-700 rounded w-1/2 animate-pulse mb-8"></div> {/* Breadcrumb Skeleton */}
                <ClientResourceLoadingSkeleton />
            </main>
        );
    }

    if (error) {
        return (
            <main className="container mx-auto py-8 px-4 text-center text-red-400">
                <Breadcrumb className="mb-6 text-sm justify-center">
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink asChild><Link href="/resources">Resources</Link></BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Error</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-10 bg-red-900/20 p-6 rounded-lg">
                    <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <h1 className="text-2xl font-semibold mb-2">Resource Error</h1>
                    <p>{error}</p>
                    <Button onClick={() => router.back()} className="mt-6 bg-red-600 hover:bg-red-700">
                        <ArrowLeftIcon className="h-5 w-5 mr-2" /> Go Back
                    </Button>
                </div>
            </main>
        );
    }

    if (!resource) {
        return (
            <main className="container mx-auto py-8 px-4 text-center text-gray-400">
                <Breadcrumb className="mb-6 text-sm justify-center">
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink asChild><Link href="/resources">Resources</Link></BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>Not Found</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-10 bg-stone-800/30 p-6 rounded-lg">
                    <InformationCircleIcon className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <h1 className="text-2xl font-semibold mb-2">Resource Not Found</h1>
                    <p>The resource you are looking for does not exist or could not be loaded.</p>
                    <Button onClick={() => router.back()} className="mt-6" variant="outline">
                        <ArrowLeftIcon className="h-5 w-5 mr-2" /> Go Back
                    </Button>
                </div>
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
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
                        </BreadcrumbItem>
                        {/* Dynamically add breadcrumbs if resource has course/stream/year/subject info */}
                        {resource.course_slug && resource.course_name && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {/* Assuming a path structure like /courses/[courseSlug] if these exist */}
                                    <BreadcrumbLink asChild><Link href={`/${resource.course_slug}`}>{resource.course_name}</Link></BreadcrumbLink>
                                </BreadcrumbItem>
                            </>
                        )}
                        {resource.stream_slug && resource.stream_name && resource.course_slug && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild><Link href={`/${resource.course_slug}/${resource.stream_slug}`}>{resource.stream_name}</Link></BreadcrumbLink>
                                </BreadcrumbItem>
                            </>
                        )}
                        {resource.year_slug && resource.year_name && resource.course_slug && resource.stream_slug && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild><Link href={`/${resource.course_slug}/${resource.stream_slug}/${resource.year_slug}`}>{resource.year_name}</Link></BreadcrumbLink>
                                </BreadcrumbItem>
                            </>
                        )}
                        {resource.subject_slug && resource.subject_name && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {/* Link to generic subject page or nested if all slugs available */}
                                    <BreadcrumbLink asChild><Link href={
                                        resource.course_slug && resource.stream_slug && resource.year_slug ?
                                            `/${resource.course_slug}/${resource.stream_slug}/${resource.year_slug}/${resource.subject_slug}` :
                                            `/subjects/${resource.subject_slug}`
                                    }>{resource.subject_name}</Link></BreadcrumbLink>
                                </BreadcrumbItem>
                            </>
                        )}
                        {!resource.subject_slug && ( // Fallback if only general resources link is appropriate
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem><BreadcrumbLink asChild><Link href="/resources">Resources</Link></BreadcrumbLink></BreadcrumbItem>
                            </>
                        )}
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="truncate max-w-[200px] md:max-w-none">{resource.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <header className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-heading-section font-extrabold text-white mb-3">{resource.name}</h1>
                    {/* Meta Badges can be added here if desired, similar to NestedResourceDetailPageClient */}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <Viewer resource={resource} />
                        {resource.description && (
                            <section className="mt-8yearSlug rounded-lg shadow">
                                <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
                                <p className="text-gray-300 font-body-desc leading-relaxed whitespace-pre-wrap">{resource.description}</p>
                                <div className="font-body-desc py-2 text-gray-400 flex flex-wrap gap-2 mt-3">
                                    <Badge variant="outline" className={"text-md"}>Type: {resource.resource_type_display || resource.resource_type}</Badge>
                                    {resource.subject_name && <Badge className="text-md" variant="outline">Subject: {resource.subject_name}</Badge>}
                                    {resource.educational_year?.name && <Badge className="text-md" variant="outline">Year: {resource.educational_year.name}</Badge>}
                                    {resource.updated_at && <Badge className="text-md" variant="outline">Last Updated: {resource.updated_at}</Badge>}
                                    {resource.uploader_name && <Badge className="text-md" variant="outline">By: {resource.uploader_name}</Badge>}
                                </div>
                            </section>
                        )}
                    </div>
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
                            {resource.subject_name ? `More from ${resource.subject_name}` : "Related Resources"}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedResources.map((relatedRes) => (
                                <ResourceCard key={relatedRes.slug} resource={relatedRes} />
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </>
    );
}