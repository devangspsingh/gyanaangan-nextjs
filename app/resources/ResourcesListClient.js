'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getResources } from '@/services/apiService';
import ResourceCard from '@/components/ResourceCard';
import ResourceCardSkeleton from '@/components/ResourceCardSkeleton'; // Ensure this path is correct
import { Input } from "@/components/ui/input"; // For search
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // For filtering

const PAGE_SIZE = 9; // Number of items to fetch per page

// Example resource types - you might fetch these dynamically or have a predefined list
const RESOURCE_TYPES = [
    { value: 'all', label: 'All Types' }, // Changed '' to 'all'
    { value: 'notes', label: 'Notes' },
    { value: 'pyq', label: 'PYQ' },
    { value: 'lab manual', label: 'Lab Manual' },
    { value: 'video', label: 'Video' },
    { value: 'image', label: 'Image' },
    { value: 'pdf', label: 'PDF' },
    // Add more types as needed
];

export default function ResourcesListClient({ initialResources, initialHasNextPage, initialTotalPages, initialFilterParams = {} }) {
  const [resources, setResources] = useState(initialResources || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState(initialFilterParams.search || '');
  const [selectedType, setSelectedType] = useState(initialFilterParams.resource_type || 'all'); // Default to 'all'
  const [filterParams, setFilterParams] = useState(initialFilterParams);

  const observer = useRef();

  const lastResourceElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !loadingMore) {
        loadMoreResources();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasNextPage]);

  const loadMoreResources = async (paramsToUse = filterParams, pageToLoad = currentPage + 1) => {
    if (loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      // Ensure 'all' for resource_type means no filter is applied for the API call
      const apiParams = { ...paramsToUse };
      if (apiParams.resource_type === 'all') {
        delete apiParams.resource_type;
      }
      const response = await getResources(pageToLoad, PAGE_SIZE, apiParams);
      if (response.error) {
        throw new Error(response.data?.detail || 'Failed to load more resources.');
      }
      setResources(prevResources => pageToLoad === 1 ? response.data.results : [...prevResources, ...response.data.results]);
      setCurrentPage(pageToLoad);
      setHasNextPage(!!response.data.next);
    } catch (err) {
      setError(err.message);
      console.error("Error loading more resources:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const applyFiltersAndSearch = (newSearchTerm, newType) => {
    const newFilterParams = {
      search: newSearchTerm.trim(),
      resource_type: newType, // newType will be 'all' or a specific type
    };
    // Remove empty search param
    if (!newFilterParams.search) delete newFilterParams.search;
    // 'all' for resource_type is handled in loadMoreResources for the API call

    setFilterParams(newFilterParams);
    setResources([]); 
    setCurrentPage(0); 
    setHasNextPage(true); 
    loadMoreResources(newFilterParams, 1);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFiltersAndSearch(searchTerm, selectedType);
  };

  const handleTypeChange = (value) => {
    setSelectedType(value); // value will be 'all' or a specific type
    applyFiltersAndSearch(searchTerm, value);
  };

  useEffect(() => {
    // Adjust initial filter check if selectedType defaults to 'all'
    if (initialResources.length === 0 && (filterParams.search || (filterParams.resource_type && filterParams.resource_type !== 'all'))) {
         loadMoreResources(filterParams, 1);
    }
  }, []);

  return (
    <div className="space-y-8">
      <form onSubmit={handleSearchSubmit} className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-center max-w-2xl mx-auto">
        <div className="relative flex-grow w-full sm:w-auto">
          <Input
            type="search"
            id="search-main"
            name="q"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full p-3 text-sm text-gray-400 bg-gray-50 border border-gray-300 rounded-full rounded-br-lg dark:bg-gray-200 dark:placeholder-gray-400 dark:text-gray-800"
            // 'required' might be too strict
          />
          <button
            type="submit" // This button will submit the form including the select value
            className="absolute end-1.5 bottom-0 p-2 text-sm font-medium h-auto text-primary-dark focus:outline-none"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="w-6 h-6" />
          </button>
        </div>
        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-stone-700 border-stone-600 text-gray-200 rounded-full"> {/* Optional: make select also rounded-full */}
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-stone-700 border-stone-600 text-gray-200">
            {RESOURCE_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value} className="hover:bg-stone-600 focus:bg-stone-600">
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* The explicit search button can be removed if the icon button submits the form */}
        {/* 
        <button type="submit" className="w-full sm:w-auto p-3 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">
          Search
        </button> 
        */}
      </form>

      {resources.length === 0 && !loadingMore && !error && (
        <p className="text-center text-gray-400 text-lg py-10">No resources found matching your criteria.</p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource, index) => {
          if (resources.length === index + 1) {
            return (
              <div ref={lastResourceElementRef} key={resource.slug || resource.id}>
                <ResourceCard resource={resource} />
              </div>
            );
          } else {
            return <ResourceCard key={resource.slug || resource.id} resource={resource} />;
          }
        })}
        {loadingMore && (
          Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <ResourceCardSkeleton key={`skeleton-${index}`} />
          ))
        )}
      </div>
      {!loadingMore && !hasNextPage && resources.length > 0 && (
        <p className="text-center text-gray-500 py-4">You've reached the end.</p>
      )}
    </div>
  );
}
