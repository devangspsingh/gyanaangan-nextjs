export default function CourseCardSkeleton() {
  return (
    <div className="block bg-customSlate-700 border border-customSlate-600 rounded-lg p-6 animate-pulse">
      <div className="w-full h-40 bg-customSlate-500 rounded-md mb-4"></div>
      <div className="h-6 bg-customSlate-500 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-customSlate-500 rounded w-full mb-1"></div>
      <div className="h-4 bg-customSlate-500 rounded w-5/6"></div>
    </div>
  );
}
