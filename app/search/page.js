'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
// Header removed as it's likely in a layout
import CourseCard from '../../components/CourseCard'; // Assuming this component exists and takes a 'course' prop
import SubjectCard from '../../components/SubjectCard'; // Assuming this component exists and takes 'subject' and 'url' props
// ResourceCard can be used if a more detailed view is needed, for now using a simpler local card
// import ResourceCard from '../../components/ResourceCard'; 
import { searchSite } from '../../services/apiService';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ResourceCard from '@/components/ResourceCard';


function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q');

  const [results, setResults] = useState({ courses: [], subjects: [], resources: [] });
  const [loading, setLoading] = useState(false); // Set to false initially
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(query || '');
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    setSearchTerm(query || '');
    if (query) {
      setLoading(true);
      setError(null);
      searchSite(query)
        .then(data => {
          if (data.error) {
            toast.error("Search failed. Please try again.");
            setError("Search failed to load results.");
            setResults({ courses: [], subjects: [], resources: [] });
            setTotalResults(0); // Reset total results on error
          } else {
            // Correctly set the results state
            const newResults = {
              courses: data.data?.courses || [], // Assuming data from searchSite is { data: {courses, subjects, resources}, ...}
              subjects: data.data?.subjects || [],
              resources: data.data?.resources || []
            };
            setResults(newResults);
            // Calculate total results based on the newResults
            setTotalResults(
              (newResults.courses?.length || 0) +
              (newResults.subjects?.length || 0) +
              (newResults.resources?.length || 0)
            );
            console.log("Search data received:", data); // Log the raw data
            console.log("Processed results:", newResults); // Log the processed results
          }
        })
        .catch(err => {
          console.error("Search API error:", err);
          toast.error("An error occurred during search.");
          setError("An unexpected error occurred.");
          setResults({ courses: [], subjects: [], resources: [] });
          setTotalResults(0); // Reset total results on catch
        })
        .finally(() => setLoading(false));
    } else {
      // No query, clear results and don't show loading/error for "no query" state
      setResults({ courses: [], subjects: [], resources: [] });
      setLoading(false);
      setError(null);
      setTotalResults(0)


    }


  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      // If search term is cleared, navigate to search page without query
      router.push('/search');
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 text-gray-100">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">

        <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-md">
          <label htmlFor="search-page-input" className="sr-only">Search</label>
          <div className="relative">
            <input
              type="search"
              id="search-main"
              name="q"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full p-3 text-sm text-gray-400 bg-gray-50 border border-gray-300 rounded-full rounded-br-lg dark:bg-gray-200 dark:placeholder-gray-400 dark:text-gray-800"
              placeholder="Search Courses, Subjects..."
              required
            />
            <button
              type="submit"
              className="absolute end-1.5 bottom-1.5 p-2 text-sm font-medium h-auto text-primary-dark focus:outline-none"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="text-center py-10 text-xl text-gray-300">Searching for &quot;{query}&quot;...</div>
      )}

      {!loading && error && (
        <div className="text-center py-10 text-red-500 text-lg">
          <p>{error}</p>
          <p>Please try a different search term or try again later.</p>
        </div>
      )}

      {!loading && !error && query && (
        <>
          <h1 className="text-3xl font-heading-section font-bold mb-2 text-white">Search Results for &quot;{query}&quot;</h1>
          <p className="text-gray-400 mb-8">{totalResults} result(s) found.</p>

          {totalResults === 0 && (
            <p className="text-center text-gray-400 text-lg py-10">No results found. Try a different search term.</p>
          )}

          {results.courses.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-heading-section font-semibold mb-6 text-primary-light border-b border-customSlate-700 pb-2">Courses ({results.courses.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.courses.map(course => (
                  // Assuming CourseCard takes a 'course' prop and handles its own linking or takes an href
                  <CourseCard key={`course-${course.slug}`} course={course} />
                ))}
              </div>
            </section>
          )}

          {results.subjects.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-heading-section font-semibold mb-6 text-primary-light border-b border-customSlate-700 pb-2">Subjects ({results.subjects.length})</h2>
              <div className="space-y-8">
                {results.subjects.map(subject => {
                  // Construct a frontend URL for the subject.
                  // This assumes a route like /subjects/[subjectSlug] exists.
                  // If subjects are always nested, this link might need to be more complex or lead to an intermediary page.
                  const subjectFrontendUrl = `/subjects/${subject.slug}`;
                  return (
                    <div key={`subject-section-${subject.slug}`} className="rounded-lg shadow-lg">
                      {/* Use SubjectCard if it can accept a simple subject object and a URL */}
                      {/* The URL from API (subject.url) is an API endpoint. We need a frontend nav URL. */}
                      <SubjectCard subject={subject} url={subjectFrontendUrl} />

                      {subject.related_resources && subject.related_resources.length > 0 && (
                        <div className="mt-4 pt-3">
                          <h4 className="text-md font-semibold text-gray-300 mb-3">Related Resources:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {subject.related_resources.map(res => (
                              <ResourceCard key={`related-res-${res.slug}`} resource={res} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {results.resources.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-heading-section font-semibold mb-6 text-primary-light border-b border-customSlate-700 pb-2">Resources ({results.resources.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.resources.map(resource => (
                  <ResourceCard key={`resource-${resource.slug}`} resource={resource} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!loading && !error && !query && (
        <div className="text-center py-20">
          <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-customSlate-500 mb-4" />
          <p className="text-xl text-gray-400">Enter a term above to search Gyan Aangan.</p>
          <p className="text-sm text-gray-500 mt-2">Find courses, subjects, notes, and more.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-customBlue-950"> {/* Ensure main takes height and has a background */}
      <Suspense fallback={<div className="text-center py-10 text-xl text-gray-300">Loading search page...</div>}>
        <SearchResults />
      </Suspense>
    </main>
  );
}
