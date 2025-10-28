import { getCourses } from '@/services/apiService';
import CourseCard from '@/components/CourseCard';

export default async function CoursesList() {
  const response = await getCourses(1, 4); // Fetch first 4 courses
  
  if (response.error) {
    console.error("Failed to load courses:", response.data);
    return <p className="col-span-full text-center text-red-400">Failed to load courses.</p>;
  }

  const courses = response.data?.results || [];

  if (courses.length === 0) {
    return <p className="col-span-full text-center text-gray-400">No courses available at the moment.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {courses.map(course => (
        <CourseCard key={course.id || course.slug} course={course} />
      ))}
    </div>
  );
}
