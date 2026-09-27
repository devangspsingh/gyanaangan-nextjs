// Server Component - Public preview for home page
import { getResources } from '@/services/apiService';
import ResourceCard from '@/components/ResourceCard';

export default async function ResourcesList() {
  const response = await getResources(1, 6); // Fetch first 6 resources



  if (response.error) {
    // console.error("🏠 [ResourcesList] Failed to load resources:", response.data);
    return <p className="col-span-full text-center text-red-400">Failed to load resources.</p>;
  }

  const resources = response.data?.results || [];



  if (resources.length === 0) {
    return <p className="col-span-full text-center text-gray-400">No resources available at the moment.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map(resource => (
        <ResourceCard
          key={resource.id || resource.slug}
          resource={resource}
          showSaveButton={false}
        />
      ))}
    </div>
  );
}
