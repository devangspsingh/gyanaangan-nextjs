import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

// Props expected: specialPage = { year: { name }, description, course: {slug}, stream: {slug}, year: {slug} }
// The title "2nd Year" comes from specialPage.year.name

export default function SpecialPageCard({ specialPage }) {
  if (!specialPage || !specialPage.year || !specialPage.course || !specialPage.stream) {
    return (
      <div className="bg-customSlate-700 border border-gray-700 rounded-lg shadow-lg overflow-hidden"> {/* Updated class */}
        <div className="p-5">
          <p className="text-red-400">Special page data is not available or incomplete.</p>
        </div>
      </div>
    );
  }

  const { year, description, course, stream } = specialPage;
  const title = year.name || "Year Details"; // e.g., "2nd Year"
  // Construct URL based on your routing structure for special pages
  const exploreUrl = `/courses/${course.slug}/${stream.slug}/${year.slug}`; 

  return (
    <div className="rounded-xl shadow-2xl overflow-hidden bg-customSlate-700 hover:shadow-primary/30 transition-shadow duration-300"> {/* Updated class */}
      <div className="bg-customSlate-400 p-5"> {/* Updated class */}
        <h2 className="text-xl font-bold text-slate-800"> {/* Consider text-customBlue-900 or similar */}
          <Link href={exploreUrl} className="hover:underline">
            {title}
          </Link>
        </h2>
      </div>

      <div className="p-5">
        <p className="text-gray-300 text-sm mb-4 line-clamp-4">{description}</p>
        
        <div className="flex justify-end items-center mt-auto">
          <Link
            href={exploreUrl}
            title={`${title} details`}
            className="inline-flex items-center text-primary-light hover:text-primary font-medium group"
          >
            Explore course
            <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
