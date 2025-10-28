// Server Component - No 'use client' needed!
import { getSubjects } from '@/services/apiService';
import SubjectCard from '@/components/SubjectCard';

export default async function SubjectsList() {
  const response = await getSubjects(1, 6); // Fetch first 6 subjects
  
  if (response.error) {
    console.error("Failed to load subjects:", response.data);
    return <p className="col-span-full text-center text-red-400">Failed to load subjects.</p>;
  }

  const subjects = response.data?.results || [];

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
