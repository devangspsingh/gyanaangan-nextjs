export default function SubjectListItemSkeleton() {
  return (
    <div className="block p-4 bg-stone-800 rounded-lg shadow animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div> {/* Title */}
          <div className="h-3 bg-gray-700 rounded w-full mb-1"></div> {/* Description line 1 */}
          <div className="h-3 bg-gray-700 rounded w-5/6"></div>    {/* Description line 2 */}
        </div>
        <div className="h-6 w-6 bg-gray-700 rounded-full"></div> {/* Icon placeholder */}
      </div>
    </div>
  );
}
