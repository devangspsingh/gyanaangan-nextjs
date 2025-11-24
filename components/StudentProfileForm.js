'use client';

import { useState, useEffect } from 'react';
import { getMyStudentProfile, updateMyStudentProfile, getCourses } from '@/services/apiService';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { User, GraduationCap, Building2, Phone, Calendar, Edit } from 'lucide-react';
import api from '@/lib/axiosInstance';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function StudentProfileForm({ onComplete }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [years, setYears] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    course_id: '',
    stream_id: '',
    year_id: '',
    college_name: '',
    mobile_number: '',
    year_of_graduation: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch courses first
      const coursesResponse = await getCourses(1, 100);
      if (!coursesResponse.error) {
        setCourses(coursesResponse.data.results || coursesResponse.data || []);
      }

      // Fetch existing profile
      const profileResponse = await getMyStudentProfile();
      if (!profileResponse.error && profileResponse.data) {
        const profile = profileResponse.data;
        setProfileData(profile); // Store the full profile data

        setFormData({
          course_id: profile.course?.slug || '',
          stream_id: profile.stream?.slug || '',
          year_id: profile.year?.id || '',
          college_name: profile.college_name || '',
          mobile_number: profile.mobile_number || '',
          year_of_graduation: profile.year_of_graduation || '',
        });

        // If profile has a course, load its streams
        if (profile.course?.slug) {
          try {
            const courseResponse = await api.get(`/courses/${profile.course.slug}/`);
            if (courseResponse.data?.streams) {
              const loadedStreams = courseResponse.data.streams;
              setStreams(loadedStreams);

              if (profile.stream?.slug) {
                const selectedStream = loadedStreams.find(
                  s => s.slug === profile.stream.slug
                );
                if (selectedStream?.years) {
                  setYears(selectedStream.years);
                }
              }
            }
          } catch (error) {
            console.error('Error loading profile course data:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = async (courseSlug) => {
    // The parameter is the slug from the <select> value
    setFormData({ ...formData, course_id: courseSlug, stream_id: '', year_id: '' });
    setStreams([]);
    setYears([]);

    if (courseSlug) {
      try {
        // This API call is correct, it uses the slug (e.g., "b-tech")
        const response = await api.get(`/courses/${courseSlug}/`);
        if (response.data?.streams) {
          setStreams(response.data.streams);
        }
      } catch (error) {
        console.error('Error fetching streams:', error);
      }
    }
  };

  const handleStreamChange = (streamSlug) => {
    setFormData({ ...formData, stream_id: streamSlug, year_id: '' });

    const selectedStream = streams.find(s => s.slug === streamSlug);
    if (selectedStream?.years) {
      setYears(selectedStream.years);
    } else {
      setYears([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.course_id || !formData.stream_id || !formData.year_id) {
      toast.error('Please select course, stream, and year');
      return;
    }

    setSaving(true);
    try {
      // Convert slugs to IDs for submission
      const selectedCourse = courses.find(c => c.slug === formData.course_id);
      const selectedStream = streams.find(s => s.slug === formData.stream_id);

      const submissionData = {
        course_id: selectedCourse?.id,
        stream_id: selectedStream?.id,
        year_id: parseInt(formData.year_id), // Already an ID
        college_name: formData.college_name,
        mobile_number: formData.mobile_number,
        year_of_graduation: formData.year_of_graduation,
      };

      const response = await updateMyStudentProfile(submissionData);

      if (!response.error) {
        toast.success('Profile updated successfully!');
        setProfileData(response.data); // Update profile data
        setIsDialogOpen(false); // Close dialog
        if (onComplete) {
          onComplete(response.data);
        }
      } else {
        toast.error(response.data?.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If profile is complete, show profile display with edit button
  if (profileData && profileData.is_profile_complete) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Academic Profile</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Academic Profile</DialogTitle>
                <DialogDescription>
                  Update your academic information below
                </DialogDescription>
              </DialogHeader>
              {renderForm()}
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-gray-500 dark:text-gray-400">Course</p>
              <p className="font-medium text-gray-900 dark:text-white">{profileData.course?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-gray-500 dark:text-gray-400">Branch/Stream</p>
              <p className="font-medium text-gray-900 dark:text-white">{profileData.stream?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-gray-500 dark:text-gray-400">Year</p>
              <p className="font-medium text-gray-900 dark:text-white">{profileData.year?.name || `Year ${profileData.year?.year}`}</p>
            </div>
          </div>

          {profileData.college_name && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-500 dark:text-gray-400">College</p>
                <p className="font-medium text-gray-900 dark:text-white">{profileData.college_name}</p>
              </div>
            </div>
          )}

          {profileData.mobile_number && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-500 dark:text-gray-400">Mobile</p>
                <p className="font-medium text-gray-900 dark:text-white">{profileData.mobile_number}</p>
              </div>
            </div>
          )}

          {profileData.year_of_graduation && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-500 dark:text-gray-400">Graduation Year</p>
                <p className="font-medium text-gray-900 dark:text-white">{profileData.year_of_graduation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If profile is not complete, show the form directly
  return renderForm();

  function renderForm() {
    return (
      <form onSubmit={handleSubmit} className="space-y-6 p-2">
        <div className="text-center mb-6">
          <User className="w-12 h-12 mx-auto mb-2 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Help us personalize your experience by completing your student profile
          </p>
        </div>

        {/* Course Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <GraduationCap className="w-4 h-4" />
            Course *
          </label>
          <select
            value={formData.course_id} // This is the slug, e.g., "b-tech"
            onChange={(e) => handleCourseChange(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select your course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.slug}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stream Selection */}
        {streams.length > 0 && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <GraduationCap className="w-4 h-4" />
              Branch/Stream *
            </label>
            <select
              value={formData.stream_id} // This is the slug, e.g., "cs"
              onChange={(e) => handleStreamChange(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your branch/stream</option>
              {streams.map((stream) => (
                <option key={stream.id} value={stream.slug}>
                  {stream.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Year Selection */}
        {years.length > 0 && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <GraduationCap className="w-4 h-4" />
              Year *
            </label>
            <select
              value={formData.year_id} // This is the ID (as per your original code)
              onChange={(e) => setFormData({ ...formData, year_id: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your year</option>
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name || `Year ${year.year}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Year of Graduation */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4" />
            Expected Year of Graduation *
          </label>
          <input
            type="number"
            value={formData.year_of_graduation}
            onChange={(e) => setFormData({ ...formData, year_of_graduation: e.target.value })}
            placeholder="e.g., 2026"
            min="2024"
            max="2035"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* College Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Building2 className="w-4 h-4" />
            College Name
          </label>
          <input
            type="text"
            value={formData.college_name}
            onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
            placeholder="Enter your college name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Phone className="w-4 h-4" />
            Mobile Number
          </label>
          <input
            type="tel"
            value={formData.mobile_number}
            onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
            placeholder="Enter your mobile number"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>



        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          * Required fields
        </p>
      </form>
    );
  }
}