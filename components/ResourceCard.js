'use client'
import Link from 'next/link';

import { useRouter } from 'next/navigation'; // Import useRouter

import { BookmarkIcon as BookmarkSolidIcon, ClockIcon, BookOpenIcon, BeakerIcon, PlayCircleIcon, PhotoIcon, DocumentTextIcon } from '@heroicons/react/24/solid'; // Added more icons
import toast from 'react-hot-toast';
import { toggleSaveResource } from '../services/apiService';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

import {
    // ArrowDownTrayIcon,
    BookmarkIcon as BookmarkOutlineIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from '@/components/ui/button'; // Assuming you have a Button component for the DrawerClose
import { FaYoutube } from "react-icons/fa";
import { FaBook } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { FaClipboardList } from "react-icons/fa";
import LoginDialog from './Auth/LoginDialog'; // Import LoginDialog
import { GoogleLogin } from '@react-oauth/google'; // For the login dialog content
import api from '../lib/axiosInstance'; // For login handler within dialog

const ResourceTypeIcon = ({ type }) => {
    const iconSize = "h-6 w-6 text-white"; // Consistent icon size and color
    switch (type?.toLowerCase()) {
        case 'notes':
            return <FaBook className={iconSize} title="Notes" />;
        case 'pyq':
            return <FaClipboardList className={iconSize} title="Previous Year Question Paper" />
        case 'lab manual':
            return <BeakerIcon className={iconSize} title="Lab Manual" />;
        case 'video':
            return <FaYoutube className={iconSize} title="Video" />;
        case 'image':
            return <PhotoIcon className={iconSize} title="Image" />;
        case 'pdf':
            return <FaFilePdf className={iconSize} title="PDF Document" />;
        default:
            return <FaBook className={iconSize} title="Resource File" />; // Default icon
    }
};


export default function ResourceCard({ resource, variant = 'default', customHref }) { // Added customHref
    const { isAuthenticated, login: setAuthState } = useAuth(); // Renamed login to setAuthState
    const router = useRouter(); // Initialize router
    const [isSaved, setIsSaved] = useState(resource.is_saved);
    const [isSaving, setIsSaving] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State for drawer
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // State for login modal

    const canDownload = resource.privacy && resource.privacy.includes('download');

    const effectiveHref = customHref || `/resources/${resource.slug}`;

    const handleSaveToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            setIsLoginModalOpen(true); // Open login dialog
            return;
        }
        setIsSaving(true);
        const response = await toggleSaveResource(resource.slug);
        if (!response.error) {
            setIsSaved(response.data.saved);
            toast.success(response.data.saved ? 'Resource saved!' : 'Resource unsaved.');
        } else {
            toast.error('Failed to update save status.');
        }
        setIsSaving(false);
    };


    const handleGoogleLoginSuccessForModal = async (credentialResponse) => {
        try {
            const idToken = credentialResponse.credential;
            if (!idToken) {
                toast.error("Google login failed: No ID token received.");
                return;
            }
            const backendResponse = await api.post('/auth/google/', { id_token: idToken });
            const { user: loggedInUser, access, refresh } = backendResponse.data;
            setAuthState(loggedInUser, access, refresh); // Update auth context
            toast.success('Logged in successfully!');
            setIsLoginModalOpen(false); // Close modal
            // Potentially re-trigger the action that was pending, e.g., save or download
            // For simplicity, user might need to click again. Or, store pending action.
        } catch (error) {
            console.error('Login failed:', error);
            const errorMessage = error.response?.data?.detail || error.response?.data?.error || error.message || 'Login failed. Please try again.';
            toast.error(errorMessage);
        }
    };

    return (
        <>
            {isLoginModalOpen && (
                <LoginDialog
                    isOpen={isLoginModalOpen}
                    onOpenChange={setIsLoginModalOpen}
                    title="Login Required"
                    description="Please login to save or download resources."
                    redirectTo={router.asPath} // Pass current path for redirection after login
                >
                    <div className="flex flex-col items-center space-y-4 p-4">
                        <GoogleLogin
                            onSuccess={handleGoogleLoginSuccessForModal}
                            onError={() => toast.error('Google login failed. Please try again.')}
                            theme="filled_blue"
                            shape="pill"
                        />
                        <p className="text-xs text-gray-500 text-center">
                            By signing in, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </LoginDialog>
            )}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <div className="w-full rounded-2xl overflow-hidden card-gradient shadow-xl">
                    <Link href={effectiveHref} className="block"> {/* Use effectiveHref */}
                        {/* Modified Header Section */}
                        <div className="flex items-center w-full py-3"> {/* Overall padding and flex container for the top row */}
                            {/* Icon: No background, shrink-0 to maintain size */}
                            <div className="shrink-0 pl-4 pr-2 flex items-center justify-center">
                                <ResourceTypeIcon type={resource.resource_type} />
                            </div>
                            {/* Resource Name & Subject (conditional for 'detailed' variant) */}
                            <div className="ml-1 flex-grow bg-secondary text-primary-dark font-semibold text-sm sm:text-base rounded-l-full pl-4 pr-5 py-3"> {/* Adjusted py */}
                                {resource.name}
                                {variant === 'detailed' && resource.subject_name && (
                                    <div className="text-xs font-normal text-primary-dark/80 mt-1">{resource.subject_name}</div>
                                )}
                            </div>
                        </div>

                        {/* Actions Section - Moved info button here, removed date display */}
                        <div className="flex items-center justify-between px-4 py-2 space-x-3">
                            <div>
                                <p className="flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-1.5 text-xs font-light text-secondary" />
                                    {resource.updated_at} &nbsp;
                                    {resource.educational_year?.name}
                                </p>

                            </div>
                            <div>

                                {/* {canDownload && (
                                    <Link
                                        href={resource.download_url}
                                        target='_blank'
                                        disabled={!canDownload}
                                        className="p-1.5 text-white/80 hover:text-primary transition rounded-full hover:bg-white/10"
                                        aria-label="Download resource"
                                        title="Download"
                                    >
                                        <ArrowDownTrayIcon className="size-6" />
                                    </Link>
                                )} */}
                                <button
                                    onClick={handleSaveToggle}
                                    disabled={isSaving}
                                    className="p-1.5 text-white/80 hover:text-primary transition rounded-full hover:bg-white/10"
                                    aria-label={isSaved ? "Unsave resource" : "Save resource"}
                                    title={isSaved ? "Unsave" : "Save"}
                                >
                                    {isSaved ? (
                                        <BookmarkSolidIcon className="size-6 text-primary" />
                                    ) : (
                                        <BookmarkOutlineIcon className="size-6" />
                                    )}
                                </button>
                                <DrawerTrigger asChild>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsDrawerOpen(true);
                                        }}
                                        className="p-1.5 text-white/80 hover:text-primary transition rounded-full hover:bg-white/10"
                                        aria-label="Show resource details"
                                        title="More info"
                                    >
                                        <InformationCircleIcon className="size-6" />
                                    </button>
                                </DrawerTrigger>
                            </div>
                        </div>
                    </Link>
                </div>

                <DrawerContent>
                    <div className='max-w-xl mx-auto w-full p-4'>
                        <DrawerHeader className="text-left px-0 pt-0">
                            <DrawerTitle>{resource.name}</DrawerTitle>
                            <DrawerDescription className="pt-2">
                                {resource.description || "No description available."}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="py-2 space-y-1 text-sm text-gray-300">
                            <p><strong>Type:</strong> {resource.resource_type_display || resource.resource_type}</p>
                            <p><strong>Subject:</strong> {resource.subject_name ? resource.subject_name : 'N/A'}</p>
                            <p><strong>Academic Year:</strong> {resource.educational_year?.name || 'N/A'}</p>
                            {resource.updated_at && (
                                <p className="flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-1.5 text-secondary" />
                                    <strong>Updated:</strong>&nbsp;{resource.updated_at}
                                </p>
                            )}
                            {/* Add more details as needed */}
                        </div>
                        <DrawerFooter className="px-0 pb-0">
                            <DrawerClose asChild>
                                <Button variant="outline">Close</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer >
        </>
    );
}
