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

export default function SavedResourcesListClient({ initialResources, initialHasNextPage, initialTotalPages }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [resources, setResources] = useState(initialResources || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParams, setFilterParams] = useState({}); // For search term

  const observer = useRef();

  const lastResourceElementRef = useCallback(node => {
    if (loadingMore || !hasNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMoreResources();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasNextPage]);

  const loadMoreResources = async (paramsToUse = filterParams, pageToLoad = currentPage + 1, isNewSearch = false) => {
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
      console.error("Error loading saved resources:", err);
    } finally {
      setLoadingMore(false);
    }
  };
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?next=/profile/saved');
    } else if (!authLoading && isAuthenticated && resources.length === 0) { // Initial load if authenticated and no initial resources
      loadMoreResources(filterParams, 1, true);
    }
  }, [authLoading, isAuthenticated, router]);


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newFilterParams = { search: searchTerm.trim() };
    if (!newFilterParams.search) delete newFilterParams.search; // Remove if empty

    setFilterParams(newFilterParams);
    setResources([]); // Clear existing resources
    setCurrentPage(0); // Reset page, loadMoreResources will load page 1
    setHasNextPage(true); // Assume there might be results
    loadMoreResources(newFilterParams, 1, true); // Load first page with new search
  };


  if (authLoading) {
    return (
      <div className="text-center py-10 text-gray-300">
        Checking authentication...
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {Array.from({ length: 3 }).map((_, index) => <ResourceCardSkeleton key={`auth_skel_${index}`} />)}
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
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

      {resources.length === 0 && !loadingMore && !error && (
        <p className="text-center text-gray-400 text-lg py-10">You haven't saved any resources yet, or no resources match your search.</p>
      )}
      {error && <p className="text-center text-red-500 py-10">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource, index) => {
          const card = <ResourceCard key={resource.slug || resource.id} resource={resource} />;
          if (resources.length === index + 1) {
            return <div ref={lastResourceElementRef}>{card}</div>;
          }
          return card;
        })}
        {loadingMore && (
          Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <ResourceCardSkeleton key={`loading_skel_${index}`} />
          ))
        )}
      </div>
      {!loadingMore && !hasNextPage && resources.length > 0 && (
        <p className="text-center text-gray-500 py-4">You've reached the end of your saved resources.</p>
      )}
    </div>
  );
}
