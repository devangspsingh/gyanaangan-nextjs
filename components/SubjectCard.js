'use client';

import Link from 'next/link';
import { TagIcon, ClockIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"; // Assuming path to shadcn/ui drawer
import { Button } from '@/components/ui/button'; // Assuming path to shadcn/ui button

// Helper to format resource types (example)
const formatResourceType = (type) => {
    switch (type) {
        case 'notes': return 'Notes';
        case 'pyq': return 'PYQs';
        case 'lab manual': return 'Lab Manuals';
        case 'video': return 'Videos';
        case 'image': return 'Images';
        case 'pdf': return 'PDFs';
        default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
};

export default function SubjectCard({ subject, url }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    if (!subject) {
        return (
            <div className="bg-slate-800 border border-gray-700 rounded-xl shadow-lg p-6">
                <p className="text-red-400">Subject data is not available.</p>
            </div>
        );
    }

    return (
        <>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <div className="relative group card-gradient border border-gray-700 rounded-lg shadow-lg hover:shadow-primary/30 transition-all duration-300 flex flex-col h-full">
                    <Link href={url} className="flex flex-col flex-grow p-5 pb-0"> {/* Adjusted padding */}
                        <div className="flex-grow ">
                            <h3 className="text-xl font-semibold text-primary-dark mb-1 -m-5 p-5 rounded-t-lg bg-secondary transition-colors duration-300 truncate" title={subject.name}>
                                {subject.name}
                            </h3>
                            {(subject.common_name || subject.abbreviation) && (
                                <p className="text-xs text-gray-400 mb-3 pt-1"> {/* Added pt-1 for spacing after header */}
                                    {subject.common_name || ''} {subject.abbreviation && `(${subject.abbreviation})`}
                                </p>
                            )}
                            <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                                {subject.description || `Explore resources for ${subject.name}.`}
                            </p>

                            {subject.resource_types && subject.resource_types.length > 0 && (
                                <div className="mb-3">
                                    <div className="flex flex-wrap gap-1">
                                        {subject.resource_types.slice(0, 4).map((type) => ( // Show max 4 types
                                            <span key={type} className="px-2 py-0.5 bg-secondary text-primary-dark text-xs rounded-full">
                                                {formatResourceType(type)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Link>
                    {/* Bottom section for stats and info button */}
                    <div className="mt-auto border-t border-gray-700 p-4 flex justify-between items-center">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                            {subject.resource_count !== undefined && (
                                <span className="flex items-center">
                                    <TagIcon className="w-4 h-4 mr-1 text-primary-light" />
                                    {subject.resource_count} Resources
                                </span>
                            )}
                            {subject.last_updated_info && (
                                <span className="flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-1 text-primary-light" />
                                    {subject.last_updated_info.status}
                                </span>
                            )}
                        </div>
                        <DrawerTrigger asChild>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent Link navigation if card is wrapped in Link
                                    setIsDrawerOpen(true);
                                }}
                                title="More info"
                                className="p-1.5 text-gray-400 hover:text-primary-light rounded-full hover:bg-stone-700 transition-colors duration-200"
                            >
                                <InformationCircleIcon className="w-5 h-5" />
                                <span className="sr-only">More info</span>
                            </button>
                        </DrawerTrigger>
                    </div>
                </div>


                <DrawerContent>
                    <div className='max-w-xl mx-auto w-full p-4'>
                        <DrawerHeader className="text-left px-0 pt-0">
                            <DrawerTitle>{subject.name}</DrawerTitle>
                            {(subject.common_name || subject.abbreviation) && (
                                <DrawerDescription>
                                    {subject.common_name || ''} {subject.abbreviation && `(${subject.abbreviation})`}
                                </DrawerDescription>
                            )}
                            <DrawerDescription className="pt-2">
                                {subject.description || "No detailed description available."}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="py-2">
                            {subject.resource_count !== undefined && (
                                <p className="text-sm text-gray-300"><strong>Resources:</strong> {subject.resource_count}</p>
                            )}
                            {subject.last_updated_info && (
                                <p className="text-sm text-gray-300"><strong>Last Update:</strong> {subject.last_updated_info.status}</p>
                            )}
                            {subject.resource_types && subject.resource_types.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm font-semibold text-gray-300">Available Resource Types:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-400">
                                        {subject.resource_types.map((type) => (
                                            <li key={type}>{formatResourceType(type)}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <DrawerFooter className="px-0 pb-0">
                            <DrawerClose asChild>
                                <Button variant="outline">Close</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
