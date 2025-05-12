'use client';

import { useEffect, useState } from 'react';
import { getSubjects } from '@/services/apiService';
import SubjectCard from '@/components/SubjectCard';
import SubjectCardSkeleton from '@/components/SubjectCardSkeleton'; // Assuming this is your skeleton

const SectionContentSkeleton = ({ count = 3, CardSkeletonComponent }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, index) => <CardSkeletonComponent key={index} />)}
  </div>
);

export default function SubjectsListClient() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      const response = await getSubjects(1, 6); // Fetch first 6 subjects
      if (response.error) {
        setError('Failed to load subjects.');
        console.error("Failed to load subjects:", response.data);
      } else {
        setSubjects(response.data?.results || []);
      }
      setLoading(false);
    };
    fetchSubjects();
  }, []);

  if (loading) {
    return <SectionContentSkeleton count={6} CardSkeletonComponent={SubjectCardSkeleton} />;
  }

  if (error) {
    return <p className="col-span-full text-center text-red-400">{error}</p>;
  }

  if (subjects.length === 0) {
    return <p className="col-span-full text-center text-gray-400">No subjects available at the moment.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.map(subject => (
        <SubjectCard key={subject.id || subject.slug} subject={subject} url={`/subjects/${subject.slug}`} />
      ))}
    </div>
  );
}
