import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

export default function SubjectListItem({ subject }) {
  if (!subject) return null;

  return (
    <Link
      href={subject.url || `/subjects/${subject.slug}`} // Use subject.url if available from serializer
      className="block p-4 bg-stone-800 hover:bg-stone-700/70 rounded-lg shadow transition-colors duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary-light group-hover:text-primary">
            {subject.name}
          </h3>
          {subject.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
              {subject.description}
            </p>
          )}
        </div>
        <ChevronRightIcon className="w-6 h-6 text-gray-500 group-hover:text-primary-light" />
      </div>
    </Link>
  );
}
