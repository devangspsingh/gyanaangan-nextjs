export default function ResourceCardSkeleton() {
  return (
    <div className="block bg-stone-800 border border-gray-700 rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div> {/* Title */}
      <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div> {/* Type */}
      <div className="h-4 bg-gray-700 rounded w-2/3"></div>    {/* Subject */}
    </div>
  );
}
