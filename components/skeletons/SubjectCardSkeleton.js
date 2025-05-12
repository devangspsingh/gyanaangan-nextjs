export default function SubjectCardSkeleton() {
  return (
    <div className="rounded-xl shadow-2xl overflow-hidden bg-customSlate-700 animate-pulse">
      <div className="bg-customSlate-600 p-5 h-16"> {/* Header part */}
        <div className="h-6 bg-customSlate-500 rounded w-3/4"></div>
      </div>
      <div className="p-5">
        <div className="h-4 bg-customSlate-500 rounded w-full mb-2"></div>
        <div className="h-4 bg-customSlate-500 rounded w-5/6 mb-4"></div>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="bg-customSlate-500 h-6 w-20 rounded-full"></div>
          <div className="bg-customSlate-500 h-6 w-24 rounded-full"></div>
        </div>
        <div className="h-8 bg-customSlate-500 rounded w-1/3"></div>
      </div>
    </div>
  );
}
