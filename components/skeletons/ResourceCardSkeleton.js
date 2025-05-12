export default function ResourceCardSkeleton() {
  return (
    <div className="block bg-customSlate-700 p-6 rounded-xl shadow-lg animate-pulse">
      <div className="h-6 bg-customSlate-500 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-customSlate-500 rounded w-1/2 mb-1"></div>
      <div className="h-4 bg-customSlate-500 rounded w-1/3"></div>
    </div>
  );
}
