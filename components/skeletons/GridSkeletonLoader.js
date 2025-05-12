export default function GridSkeletonLoader({ SkeletonComponent, count = 6, gridColsClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" }) {
  return (
    <div className={`grid ${gridColsClass} gap-6`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
}
