'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSavedResources } from '@/services/apiService'; // We'll add this
import ResourceCard from '@/components/ResourceCard';
import ResourceCardSkeleton from '@/components/ResourceCardSkeleton';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const PAGE_SIZE = 9;

export default function SavedResourcesListClient({ initialResources, initialHasNextPage }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [resources, setResources] = useState(initialResources || []);
  const [currentPage, setCurrentPage] = useState(0); // Start at 0, page 1 will be the first loaded
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage !== undefined ? initialHasNextPage : true); // Default to true if not provided
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParams, setFilterParams] = useState({}); // For search term

  const observer = useRef();

  // Renamed to fetchSavedResources, handles both initial and subsequent loads based on pageToLoad
  const fetchSavedResources = useCallback(async (paramsToUse = filterParams, pageToLoad = 1, isNewSearch = false) => {
    if (loadingMore || !isAuthenticated) return;
    setLoadingMore(true);
    setError(null);
    try {
      const response = await getSavedResources(pageToLoad, PAGE_SIZE, paramsToUse);
      if (response.error) {
        throw new Error(response.data?.detail || 'Failed to load saved resources.');
      }
      setResources(prevResources => (isNewSearch || pageToLoad === 1) ? response.data.results : [...prevResources, ...response.data.results]);
      setCurrentPage(pageToLoad);
      setHasNextPage(!!response.data.next);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      // console.error("Error loading saved resources:", err); // Keep for debugging if needed
    } finally {
      setLoadingMore(false);
    }
  }, [isAuthenticated, loadingMore,filterParams]); // Removed currentPage and filterParams to simplify, they are passed as arguments

  const lastResourceElementRef = useCallback(node => {
    if (loadingMore || !hasNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) { // Ensure hasNextPage is true
        fetchSavedResources(filterParams, currentPage + 1, false);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasNextPage, fetchSavedResources, filterParams, currentPage]);
  
  // useEffect for initial load and auth changes
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?next=/profile/saved');
    } else if (!authLoading && isAuthenticated && currentPage === 0) { 
      // Only fetch if authenticated and it's the very first load (currentPage is 0)
      fetchSavedResources(filterParams, 1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, router, fetchSavedResources]);
  // filterParams is intentionally omitted from deps here for initial load, 
  // search will trigger its own fetch. currentPage === 0 handles the "initial" part.


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newSearchTerm = searchTerm.trim();
    const newFilterParams = newSearchTerm ? { search: newSearchTerm } : {};
    
    setFilterParams(newFilterParams);
    // setResources([]); // Cleared by fetchSavedResources with isNewSearch=true
    // setCurrentPage(0); // Reset by fetchSavedResources logic for new search
    // setHasNextPage(true); // Assumed by fetchSavedResources
    fetchSavedResources(newFilterParams, 1, true); // Load first page with new search
  };


  if (authLoading || (isAuthenticated && currentPage === 0 && loadingMore)) { // Show loading if auth is pending OR initial fetch is happening
    return (
      <div className="text-center py-10 text-gray-300">
        {authLoading ? "Checking authentication..." : "Loading saved resources..."}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {Array.from({ length: 3 }).map((_, index) => <ResourceCardSkeleton key={`auth_skel_${index}`} />)}
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated && !authLoading) { // Ensure auth is not loading before redirect message
     return <div className="text-center py-10 text-gray-300">Redirecting to login...</div>;
  }


  return (
    <div className="space-y-8">
       <form onSubmit={handleSearchSubmit} className="mb-8 max-w-xl mx-auto">
        <div className="relative">
          <Input
            type="search"
            id="search-saved"
            name="q"
            placeholder="Search in your saved resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full p-3 text-sm text-gray-400 bg-gray-50 border border-gray-300 rounded-full rounded-br-lg dark:bg-gray-200 dark:placeholder-gray-400 dark:text-gray-800"
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

      {resources.length === 0 && !loadingMore && !error && isAuthenticated && ( // Added isAuthenticated check
        <p className="text-center text-gray-400 text-lg py-10">You haven&apos;t saved any resources yet, or no resources match your search.</p>
      )}
      {error && <p className="text-center text-red-500 py-10">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource, index) => {
          const card = <ResourceCard key={resource.slug || resource.id} resource={resource} />;
          if (resources.length === index + 1) {
            return <div ref={lastResourceElementRef} key={`wrapper-${resource.id || index}`}>{card}</div>; // Ensure key is unique
          }
          return card;
        })}
        {loadingMore && currentPage > 0 && ( // Show skeletons only when paginating, not initial load
          Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <ResourceCardSkeleton key={`loading_skel_${index}`} />
          ))
        )}
      </div>
      {!loadingMore && !hasNextPage && resources.length > 0 && (
        <p className="text-center text-gray-500 py-4">You&apos;ve reached the end of your saved resources.</p>
      )}
    </div>
  );
}
