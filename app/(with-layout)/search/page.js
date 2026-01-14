'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CourseCard from '../../../components/CourseCard';
import SubjectCard from '../../../components/SubjectCard';
import ResourceCard from '@/components/ResourceCard';
import { searchSite, getCourses } from '../../../services/apiService';
import api from '@/lib/axiosInstance';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

// Shadcn UI Imports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Params
  const query = searchParams.get('q');
  const courseParam = searchParams.get('course');
  const streamParam = searchParams.get('stream');
  const yearParam = searchParams.get('year');

  // Search Data State
  const [results, setResults] = useState({ courses: [], subjects: [], resources: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  // Form State
  const [searchTerm, setSearchTerm] = useState(query || '');

  // Filter Data Options
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [years, setYears] = useState([]);

  // Selected Filter Values
  const [selectedCourse, setSelectedCourse] = useState(courseParam || '');
  const [selectedStream, setSelectedStream] = useState(streamParam || '');
  const [selectedYear, setSelectedYear] = useState(yearParam || '');

  // 1. Initial Data Fetch (Courses) & Restore Filters from URL
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses(1, 100);
        if (!response.error) {
          const courseList = response.data.results || response.data || [];
          setCourses(courseList);

          // If we have a course param in URL, trigger the stream fetch immediately
          if (courseParam) {
            handleCourseParamLoad(courseParam, courseList);
          }
        }
      } catch (err) {
        console.error("Failed to load courses", err);
      }
    };
    fetchCourses();
  }, []);

  // Helper to load streams/years if URL has params
  const handleCourseParamLoad = async (cSlug, courseList) => {
    try {
      const response = await api.get(`/courses/${cSlug}/`);
      if (response.data?.streams) {
        setStreams(response.data.streams);

        if (streamParam) {
          const currentStream = response.data.streams.find(s => s.slug === streamParam);
          if (currentStream?.years) {
            setYears(currentStream.years);
          }
        }
      }
    } catch (e) { console.error("Error loading initial streams", e); }
  };

  // 2. Perform Search when URL Params Change
  useEffect(() => {
    setSearchTerm(query || '');
    setSelectedCourse(courseParam || '');
    setSelectedStream(streamParam || '');
    setSelectedYear(yearParam || '');

    if (query || courseParam || streamParam || yearParam) {
      setLoading(true);
      setError(null);

      const filters = {
        course: courseParam,
        stream: streamParam,
        year: yearParam
      };

      searchSite(query, filters)
        .then(data => {
          if (data.error) {
            toast.error("Search failed.");
            setResults({ courses: [], subjects: [], resources: [] });
            setTotalResults(0);
          } else {
            const newResults = {
              courses: data.data?.courses || [],
              subjects: data.data?.subjects || [],
              resources: data.data?.resources || []
            };
            setResults(newResults);
            setTotalResults(
              (newResults.courses?.length || 0) +
              (newResults.subjects?.length || 0) +
              (newResults.resources?.length || 0)
            );
          }
        })
        .catch(err => {
          console.error(err);
          setError("An unexpected error occurred.");
        })
        .finally(() => setLoading(false));
    } else {
      setResults({ courses: [], subjects: [], resources: [] });
      setTotalResults(0);
      setLoading(false);
    }
  }, [searchParams]);

  // 3. Handlers for Dropdowns (Updated for Shadcn onValueChange)
  const handleCourseChange = async (value) => {
    // Shadcn returns the value directly string
    const cSlug = value === "all" ? "" : value;

    setSelectedCourse(cSlug);
    setSelectedStream('');
    setSelectedYear('');
    setStreams([]);
    setYears([]);

    if (cSlug) {
      try {
        const response = await api.get(`/courses/${cSlug}/`);
        if (response.data?.streams) {
          setStreams(response.data.streams);
        }
      } catch (error) {
        console.error('Error fetching streams:', error);
      }
    }
  };

  const handleStreamChange = (value) => {
    const sSlug = value === "all" ? "" : value;
    setSelectedStream(sSlug);
    setSelectedYear('');

    const currentStream = streams.find(s => s.slug === sSlug);
    if (currentStream?.years) {
      setYears(currentStream.years);
    } else {
      setYears([]);
    }
  };

  const handleYearChange = (value) => {
    const yId = value === "all" ? "" : value;
    setSelectedYear(yId);
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (selectedCourse) params.set('course', selectedCourse);
    if (selectedStream) params.set('stream', selectedStream);
    if (selectedYear) params.set('year', selectedYear);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 text-gray-100">
      <div className="mb-10">
        <form onSubmit={handleSearchSubmit} className="w-full">

          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">

            {/* 1. Styled Search Bar (Matches your specific request) */}
            <div className="relative flex-grow">
              <label htmlFor="search-main" className="mb-2 text-sm font-medium sr-only text-white">Search</label>
              <div className="relative flex items-center">
                <input
                  type="search"
                  id="search-main"
                  name="q"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  // Used your requested shape classes, but mapped colors to Dark Theme (customSlate-800)
                  className="block w-full p-2 pl-5 text-base text-gray-200  border  rounded-full rounded-br-lg placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Search Courses, Subjects..."
                />
                <button
                  type="submit"
                  className="absolute end-2.5 bottom-1.5 p-2 text-sm font-medium h-auto text-blue-400 hover:text-blue-300 focus:outline-none"
                  aria-label="Search"
                >
                  <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke='currentColor' strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 2. Shadcn Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:w-auto gap-3">
              {/* Course Select */}
              <div className="w-full lg:w-[180px]">
                <Select value={selectedCourse} onValueChange={handleCourseChange}>
                  <SelectTrigger className="w-full h-[50px] rounded-lg  text-gray-200 focus:ring-blue-500">
                    <SelectValue placeholder="Course" />
                  </SelectTrigger>
                  <SelectContent className="  text-gray-200">
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map(c => (
                      <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stream Select */}
              <div className="w-full lg:w-[180px]">
                <Select value={selectedStream} onValueChange={handleStreamChange} disabled={!selectedCourse}>
                  <SelectTrigger className="w-full h-[50px] rounded-lg   text-gray-200 focus:ring-blue-500 disabled:opacity-50">
                    <SelectValue placeholder="Stream" />
                  </SelectTrigger>
                  <SelectContent className="  text-gray-200">
                    <SelectItem value="all">All Streams</SelectItem>
                    {streams.map(s => (
                      <SelectItem key={s.id} value={s.slug}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Select */}
              <div className="w-full lg:w-[140px]">
                <Select value={selectedYear} onValueChange={handleYearChange} disabled={!selectedStream}>
                  <SelectTrigger className="w-full h-[50px] rounded-lg   text-gray-200 focus:ring-blue-500 disabled:opacity-50">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="  text-gray-200">
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map(y => (
                      <SelectItem key={y.id} value={y.id.toString()}>{y.name || `Year ${y.year}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>
        </form>
      </div>

      {loading && (
        <div className="text-center py-12 flex justify-center gap-3 items-center text-gray-300">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-lg">Searching...</span>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-8 text-red-400 bg-red-900/10 rounded-lg border border-red-900/50 mx-auto max-w-2xl">
          <p>{error}</p>
        </div>
      )}

      {/* Results Display */}
      {!loading && !error && (query || courseParam || streamParam || yearParam) && (
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-baseline mb-6 border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-white mb-2 sm:mb-0">
              {query ? <span>Results for <span className="text-blue-400">&quot;{query}&quot;</span></span> : 'Filtered Results'}
            </h1>
            <span className="text-gray-400 text-sm font-medium  px-3 py-1 rounded-full">
              {totalResults} found
            </span>
          </div>

          {/* Courses Section */}
          {results.courses.length > 0 && (
            <section className="mb-12">
              <h2 className="text-lg font-semibold mb-4 text-blue-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span> Courses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.courses.map(course => (
                  <CourseCard key={`course-${course.slug}`} course={course} />
                ))}
              </div>
            </section>
          )}

          {/* Subjects Section */}
          {results.subjects.length > 0 && (
            <section className="mb-12">
              <h2 className="text-lg font-semibold mb-4 text-blue-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span> Subjects
              </h2>
              <div className="space-y-6">
                {results.subjects.map(subject => (
                  <div key={`subject-section-${subject.slug}`} className="bg-primary-900/40 p-5 rounded-xl border border-slate-400 hover: transition-colors">
                    <SubjectCard subject={subject} url={`/subjects/${subject.slug}`} />
                    {subject.related_resources?.length > 0 && (
                      <div className="mt-5 pl-4 border-l-2 ">
                        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Relevant Resources</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {subject.related_resources.map(res => (
                            <ResourceCard key={`rel-res-${res.slug}`} resource={res} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Resources Section */}
          {results.resources.length > 0 && (
            <section className="mb-12">
              <h2 className="text-lg font-semibold mb-4 text-blue-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span> All Resources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.resources.map(resource => (
                  <ResourceCard key={`resource-${resource.slug}`} resource={resource} />
                ))}
              </div>
            </section>
          )}

          {totalResults === 0 && (
            <div className="text-center py-24 bg-customSlate-900/20 rounded-xl border border-dashed border-customSlate-800">
              <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-customSlate-700 mb-4" />
              <p className="text-xl text-gray-400 font-medium">No results found.</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State (No Search, No Filters) */}
      {!loading && !error && !query && !courseParam && !streamParam && !yearParam && (
        <div className="text-center py-24 px-4">
          <div className="/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FunnelIcon className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Start your search</h3>
          <p className="text-gray-400 max-w-md mx-auto">Select your course and year above, or type a keyword to find study materials.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-customBlue-950">
      <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading search...</div>}>
        <SearchResults />
      </Suspense>
    </main>
  );
}