export default function CourseCardSkeleton() {
  return (
    <div className="block bg-stone-800 border border-gray-700 rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div> {/* Title */}
      <div className="h-4 bg-gray-700 rounded w-full mb-1"></div> {/* Description line 1 */}
      <div className="h-4 bg-gray-700 rounded w-5/6 mb-1"></div> {/* Description line 2 */}
      <div className="h-4 bg-gray-700 rounded w-1/2"></div>    {/* Description line 3 */}
    </div>
  );
}
