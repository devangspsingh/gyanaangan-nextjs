'use client';

import { useEffect, useState } from 'react';
import { getResources } from '@/services/apiService';
import ResourceCard from '@/components/ResourceCard';
import ResourceCardSkeleton from '@/components/ResourceCardSkeleton'; // Assuming this is your skeleton

const SectionContentSkeleton = ({ count = 3, CardSkeletonComponent }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, index) => <CardSkeletonComponent key={index} />)}
  </div>
);

export default function ResourcesListClient() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      const response = await getResources(1, 6); // Fetch first 6 resources
      if (response.error) {
        setError('Failed to load resources.');
        console.error("Failed to load resources:", response.data);
      } else {
        setResources(response.data?.results || []);
      }
      setLoading(false);
    };
    fetchResources();
  }, []);

  if (loading) {
    return <SectionContentSkeleton count={6} CardSkeletonComponent={ResourceCardSkeleton} />;
  }

  if (error) {
    return <p className="col-span-full text-center text-red-400">{error}</p>;
  }

  if (resources.length === 0) {
    return <p className="col-span-full text-center text-gray-400">No resources available at the moment.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map(resource => (
        <ResourceCard key={resource.id || resource.slug} resource={resource} />
      ))}
    </div>
  );
}
