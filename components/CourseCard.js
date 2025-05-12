// ...existing code...
'use client';

import Link from 'next/link';
import { ArrowRightIcon, AcademicCapIcon, InformationCircleIcon } from '@heroicons/react/20/solid'; // Added InformationCircleIcon
import { useState } from 'react'; // Added useState
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"; // Added Drawer imports
import { Button } from '@/components/ui/button'; // Added Button import

export default function CourseCard({ course, svgIndex }) { // Added svgIndex prop
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!course) {
    return (
      <div className="group flex flex-col h-full bg-stone-800 border border-gray-700 rounded-lg shadow-lg p-5">
        <p className="text-red-400">Course data is not available.</p>
      </div>
    );
  }

  // Determine SVG path, cycling through 1-5.svg or falling back
  const defaultSvg = '/svg/course/in_the_zone.svg'; // Fallback SVG
  const svgPath = course.slug.length !== undefined 
    ? `/svg/course/${(course.slug.length % 4) + 1}.svg` 
    : defaultSvg;

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>

      <div className="relative group card-gradient border border-gray-700 rounded-lg shadow-lg hover:shadow-primary/30 transition-all duration-300 flex flex-col h-full overflow-hidden">
        {/* Background SVG and decorative element */}
        <div className="absolute top-0 right-0 h-full w-2/5 md:w-1/3 pointer-events-none z-0 opacity-40 group-hover:opacity-45 transition-opacity duration-300">
          {/* Decorative half-circle shape */}
          <div
            className="absolute -right-1/4 top-1/2 transform -translate-y-1/2 w-3/4 h-3/4 bg-primary/10 rounded-full blur-md"
          ></div>
          <img
            src={svgPath}
            alt=""
            onError={(e) => { e.currentTarget.src = defaultSvg; }} // Fallback if numbered SVG fails to load
            className="absolute inset-0 w-full h-full object-contain object-right p-2" 
          />
        </div>

        {/* Card Content - ensure it's above the background */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Main content area - Link wraps the clickable content part */}
          <div className="flex flex-col flex-grow">
            {/* Course Name - Styled like SubjectCard title */}
            <h3 
              className="text-xl font-semibold text-primary-dark bg-secondary p-4 rounded-t-lg group-hover:text-primary-dark transition-colors duration-300 truncate" 
              title={course.name}
            >
              <Link href={`/${course.slug}`} className="hover:underline">
                {course.name}
              </Link>
            </h3>
            
            <div className="p-4 flex-grow"> {/* Padding for content below title */}
              <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                {course.description || "Explore this course to learn more about its streams and academic years."}
              </p>

              {course.streams && course.streams.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center">
                    <AcademicCapIcon className="w-4 h-4 mr-1.5 text-primary-light" />
                    Available Streams:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {course.streams.slice(0, 3).map((stream) => ( // Show max 3 streams for space
                      <Link key={stream.slug} href={`/${course.slug}/${stream.slug}`} className="hover:opacity-80 transition-opacity">
                        <span
                          className="px-2.5 py-1 bg-secondary text-primary-dark text-sm rounded-full font-medium block"
                          title={stream.name}
                        >
                          {stream.name}
                        </span>
                      </Link>
                    ))}
                    {course.streams.length > 3 && (
                       <span className="px-2.5 py-1 bg-stone-700 text-gray-400 text-xs rounded-full font-medium">
                          + {course.streams.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              {(!course.streams || course.streams.length === 0) && course.years && course.years.length > 0 && (
                 <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center">
                    <AcademicCapIcon className="w-4 h-4 mr-1.5 text-primary-light" />
                    Academic Years:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {course.years.slice(0,3).map((year) => (
                       <span 
                        key={year.slug} 
                        className="px-2.5 py-1 bg-secondary text-primary-dark text-xs rounded-full font-medium"
                        title={year.name || `Year ${year.year}`}
                      >
                        {year.name || `Year ${year.year}`}
                      </span>
                    ))}
                     {course.years.length > 3 && (
                       <span className="px-2.5 py-1 bg-stone-700 text-gray-400 text-xs rounded-full font-medium">
                          + {course.years.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with action and info button */}
          <div className="mt-auto border-t border-gray-700/50 p-4 flex justify-between items-center">
            <Link href={`/${course.slug}`} className="inline-flex items-center text-sm font-medium text-primary-light group-hover:underline">
                View Details
                <ArrowRightIcon className="ml-1.5 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-primary-light" />
            </Link>
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
          </div>
        </div>
      </div>

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
    </>
  );
}
// ...existing code...