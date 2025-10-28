'use client';

import { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/20/solid';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from '@/components/ui/button';

// Helper to format resource types
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

export default function SubjectCardDrawer({ subject }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
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
  );
}
