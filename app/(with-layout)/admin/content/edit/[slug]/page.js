'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, Check, ChevronDown } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import ResourceMetadataForm from '@/components/admin/ResourceMetadataForm';

export default function EditContentPage() {
  const router = useRouter();
  const { slug } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data for dropdowns
  const [allSubjects, setAllSubjects] = useState([]);
  const [educationalYears, setEducationalYears] = useState([]);
  
  // Resource state
  const [resource, setResource] = useState({
    name: '',
    description: '',
    resource_type: 'pdf',
    status: 'published',
    subject: '',
    educational_year: '',
    keywords: '',
  });

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      const [resourceRes, subjectsRes, eduYearsRes] = await Promise.all([
        axiosInstance.get(`/admin/content/resources/${slug}/`),
        axiosInstance.get('/admin/content/subjects/'),
        axiosInstance.get('/admin/content/educational-years/'),
      ]);
      
      const resData = resourceRes.data;
      setResource({
        name: resData.name || '',
        description: resData.description || '',
        resource_type: resData.resource_type || 'pdf',
        status: resData.status || 'published',
        subject: resData.subject || '',
        educational_year: resData.educational_year?.id || resData.educational_year || '',
        keywords: resData.keywords || '',
      });
      
      setAllSubjects(subjectsRes.data.results || subjectsRes.data || []);
      setEducationalYears(eduYearsRes.data.results || eduYearsRes.data || []);
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to load resource data", error);
      toast.error("Failed to load resource data");
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setResource(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: resource.name,
        description: resource.description,
        resource_type: resource.resource_type,
        status: resource.status,
        keywords: resource.keywords,
      };
      
      if (resource.subject) payload.subject = resource.subject;
      if (resource.educational_year) payload.educational_year_id = resource.educational_year;

      await axiosInstance.patch(`/admin/content/resources/${slug}/`, payload);
      toast.success("Resource updated successfully!");
      router.push('/admin/content');
    } catch (error) {
      console.error("Failed to update resource", error);
      toast.error("Failed to update resource");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-white">Loading...</div>;
  }

  const currentSubject = allSubjects.find(s => s.id == resource.subject);

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Resource</h1>
        <p className="text-gray-400 mt-2">Update the metadata for this resource.</p>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-md overflow-hidden">
        <ResourceMetadataForm
          resource={resource}
          onChange={handleChange}
          disabled={saving}
          allSubjects={allSubjects}
          educationalYears={educationalYears}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : <><Save className="w-5 h-5 mr-2" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
