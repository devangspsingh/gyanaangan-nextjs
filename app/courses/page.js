'use client';

import { useEffect, useState } from 'react';
import { getCourses } from '../../services/apiService'; // Adjust path
import CourseCardSkeleton from '../../components/CourseCardSkeleton'; // Adjust path
import toast from 'react-hot-toast';
import CourseCard from '@/components/CourseCard';


export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    const fetchCoursesData = async () => {
      setLoading(true);
      const response = await getCourses(page, pageSize);
      if (response.error) {
        toast.error('Failed to load courses.');
        setCourses([]);
      } else {
        setCourses(response.data?.results || []);
        const totalCount = response.data?.count || 0;
        setTotalPages(Math.ceil(totalCount / pageSize));
      }
      setLoading(false);
    };
    fetchCoursesData();
  }, [page]);

  // Basic Pagination (improve as needed)
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div className="container mx-auto py-8 px-4 text-gray-100">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary">All Courses</h1>
        <p className="text-gray-300 text-lg mt-2">Browse our comprehensive list of available courses.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {Array.from({ length: pageSize }).map((_, index) => <CourseCardSkeleton key={index} />)}
        </div>
      ) : courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-4">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-300">Page {page} of {totalPages}</span>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-gray-400">No courses available at the moment.</p>
        </div>
      )}
    </div>
  );
}
