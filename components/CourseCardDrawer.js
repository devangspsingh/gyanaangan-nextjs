'use client';

import { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
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

export default function CourseCardDrawer({ course }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation(); 
            setIsDrawerOpen(true);
          }}
          title="More info about the course"
          className="p-1.5 text-gray-400 hover:text-primary-light rounded-full hover:bg-stone-700/70 transition-colors duration-200"
        >
          <InformationCircleIcon className="w-6 h-6" />
          <span className="sr-only">More info</span>
        </button>
      </DrawerTrigger>

      <DrawerContent>
        <div className='max-w-xl mx-auto w-full p-4'>
          <DrawerHeader className="text-left px-0 pt-0">
            <DrawerTitle>{course.name}</DrawerTitle>
            <DrawerDescription className="pt-2">
              {course.description || "No detailed description available for this course."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="py-4 space-y-3">
            {course.streams && course.streams.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-200 mb-1">Streams:</h4>
                <ul className="list-disc list-inside text-sm text-gray-400">
                  {course.streams.map(stream => (
                    <li key={stream.slug}>
                      <Link href={`/${course.slug}/${stream.slug}`} className="hover:underline text-primary-light/90 hover:text-primary-light">
                        {stream.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {course.years && course.years.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-200 mb-1">Academic Years:</h4>
                <ul className="list-disc list-inside text-sm text-gray-400">
                  {course.years.map(year => <li key={year.slug}>{year.name || `Year ${year.year}`}</li>)}
                </ul>
              </div>
            )}
            {(!course.streams || course.streams.length === 0) && (!course.years || course.years.length === 0) && (
              <p className="text-sm text-gray-400">No specific streams or academic years listed for this course.</p>
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
