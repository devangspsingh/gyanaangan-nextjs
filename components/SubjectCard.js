// Server Component - No 'use client' needed!
import Link from 'next/link';
import { TagIcon, ClockIcon } from '@heroicons/react/20/solid';
import SubjectCardDrawer from './SubjectCardDrawer'; // Client component for drawer

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

export default function SubjectCard({ subject, url }) {

  if (!subject) {
    return (
      <div className="bg-slate-800 border border-gray-700 rounded-xl shadow-lg p-6">
        <p className="text-red-400">Subject data is not available.</p>
      </div>
    );
  }

  return (
    <article className="relative group card-gradient border border-gray-700 rounded-lg shadow-lg hover:shadow-primary/30 transition-all duration-300 flex flex-col h-full">
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
          <p className="text-sm text-gray-300 line-clamp-2 mt-3 mb-3">
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
        <div className="flex flex-row sm:flex-row sm:items-center gap-x-3 gap-y-1 text-xs text-gray-400">
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
        {/* Client Component for Drawer */}
        <SubjectCardDrawer subject={subject} />
      </div>
    </article>
  );
}
