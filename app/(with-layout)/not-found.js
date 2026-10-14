import Link from 'next/link';
import { HomeIcon, BookOpenIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Page Not Found - Gyan Aangan',
  description: 'The requested page or resource could not be found.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[65vh] px-4 text-center">
      <div className="relative mb-6">
        <span className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 select-none">
          404
        </span>
        <div className="absolute inset-0 blur-3xl bg-red-500/10 -z-10 rounded-full" />
      </div>

      <h1 className="text-2xl md:text-3xl font-heading-section font-bold text-white mb-3">
        Page Not Found
      </h1>
      <p className="text-gray-400 max-w-md mb-8 text-sm md:text-base leading-relaxed">
        The page or resource you requested could not be found. It may have been moved, renamed, or never existed.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm transition-all shadow-lg shadow-orange-600/20 active:scale-95"
        >
          <HomeIcon className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 border border-gray-700 font-medium text-sm transition-all active:scale-95"
        >
          <BookOpenIcon className="w-4 h-4" />
          Browse Resources
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 border border-gray-700 font-medium text-sm transition-all active:scale-95"
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
          Search
        </Link>
      </div>
    </main>
  );
}
