'use client';

import { useEffect, useState } from 'react';
import { getCourses } from '@/services/apiService';
import CourseCard from '@/components/CourseCard';
import CourseCardSkeleton from '@/components/CourseCardSkeleton'; // Assuming this is your skeleton

// Skeleton for the section content, can be part of this component or imported
const SectionContentSkeleton = ({ count = 2, CardSkeletonComponent }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {[...Array(count)].map((_, index) => <CardSkeletonComponent key={index} />)}
  </div>
);

export default function CoursesListClient() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      const response = await getCourses(1, 4); // Fetch first 4 courses
      if (response.error) {
        setError('Failed to load courses.');
        console.error("Failed to load courses:", response.data);
      } else {
        setCourses(response.data?.results || []);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  if (loading) {
    return <SectionContentSkeleton count={4} CardSkeletonComponent={CourseCardSkeleton} />;
  }

  if (error) {
    return <p className="col-span-full text-center text-red-400">{error}</p>;
  }

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
