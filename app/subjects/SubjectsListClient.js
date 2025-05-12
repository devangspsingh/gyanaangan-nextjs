'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSubjects } from '@/services/apiService';
import SubjectCard from '@/components/SubjectCard';
import SubjectCardSkeleton from '@/components/SubjectCardSkeleton'; // Ensure this path is correct
import { Input } from "@/components/ui/input"; // For search
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const PAGE_SIZE = 9; // Number of items to fetch per page

export default function SubjectsListClient({ initialSubjects, initialHasNextPage, initialTotalPages, initialFilterParams = {} }) {
  const [subjects, setSubjects] = useState(initialSubjects || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialFilterParams.search || '');
  const [filterParams, setFilterParams] = useState(initialFilterParams);

  const observer = useRef();

  const lastSubjectElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !loadingMore) {
        loadMoreSubjects();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasNextPage]);

  const loadMoreSubjects = async (paramsToUse = filterParams, pageToLoad = currentPage + 1) => {
    if (loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const response = await getSubjects(pageToLoad, PAGE_SIZE, paramsToUse);
      if (response.error) {
        throw new Error(response.data?.detail || 'Failed to load more subjects.');
      }
      setSubjects(prevSubjects => pageToLoad === 1 ? response.data.results : [...prevSubjects, ...response.data.results]);
      setCurrentPage(pageToLoad);
      setHasNextPage(!!response.data.next);
    } catch (err) {
      setError(err.message);
      console.error("Error loading more subjects:", err);
    } finally {
      setLoadingMore(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    const newFilterParams = { ...filterParams, search: searchTerm.trim() };
    setFilterParams(newFilterParams);
    setSubjects([]); // Clear existing subjects
    setCurrentPage(0); // Reset page, loadMoreSubjects will load page 1
    setHasNextPage(true); // Assume there might be results
    loadMoreSubjects(newFilterParams, 1); // Load first page with new search
  };


  // Effect for initial load if initialSubjects is empty but params might exist
  useEffect(() => {
    if (initialSubjects.length === 0 && (filterParams.search)) {
         loadMoreSubjects(filterParams, 1);
    }
  }, []); // Run once on mount if needed

  return (
    <div className="space-y-8">
      <form onSubmit={handleSearch} className="mb-8 max-w-xl mx-auto">
        <div className="relative">
          <Input
            type="search"
            id="search-main"
            name="q"
            placeholder="Search subjects by name, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full p-3 text-sm text-gray-400 bg-gray-50 border border-gray-300 rounded-full rounded-br-lg dark:bg-gray-200 dark:placeholder-gray-400 dark:text-gray-800"
            // 'required' might be too strict if users can browse without searching
          />
          <button
            type="submit"
            className="absolute end-1.5 bottom-0 p-2 text-sm font-medium h-auto text-primary-dark focus:outline-none"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="w-6 h-6" />
          </button>
        </div>
      </form>

      {subjects.length === 0 && !loadingMore && !error && (
        <p className="text-center text-gray-400 text-lg py-10">No subjects found matching your criteria.</p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject, index) => {
          if (subjects.length === index + 1) {
            return (
              <div ref={lastSubjectElementRef} key={subject.slug || subject.id}>
                <SubjectCard subject={subject} url={`/subjects/${subject.slug}`} />
              </div>
            );
          } else {
            return <SubjectCard key={subject.slug || subject.id} subject={subject} url={`/subjects/${subject.slug}`} />;
          }
        })}
        {loadingMore && (
          Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <SubjectCardSkeleton key={`skeleton-${index}`} />
          ))
        )}
      </div>
      {!loadingMore && !hasNextPage && subjects.length > 0 && (
        <p className="text-center text-gray-500 py-4">You've reached the end.</p>
      )}
    </div>
  );
}
