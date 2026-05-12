'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, Check, ChevronDown } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export default function EditContentPage() {
  const router = useRouter();
  const { slug } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  
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
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
              <input
                type="text"
                value={resource.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                <select
                  value={resource.resource_type}
                  onChange={(e) => handleChange('resource_type', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="notes">Notes</option>
                  <option value="pyq">PYQ</option>
                  <option value="lab manual">Lab Manual</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select
                  value={resource.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Educational Year</label>
              <select
                value={resource.educational_year || ""}
                onChange={(e) => handleChange('educational_year', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year...</option>
                {educationalYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <button
                    role="combobox"
                    aria-expanded={openCombobox}
                    className={`w-full flex items-center justify-between bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${!currentSubject ? 'text-gray-400' : ''}`}
                  >
                    {currentSubject ? currentSubject.name : "Search Subject..."}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 border-gray-600 bg-gray-800" side="bottom" align="start">
                  <Command filter={(value, search) => value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0}>
                    <CommandInput placeholder="Search subject..." className="text-white" />
                    <CommandList>
                      <CommandEmpty className="py-6 text-center text-sm text-gray-400">No subject found.</CommandEmpty>
                      <CommandGroup>
                        {allSubjects.map((sub) => (
                          <CommandItem
                            key={sub.id}
                            value={sub.name}
                            onSelect={() => {
                              handleChange('subject', sub.id);
                              setOpenCombobox(false);
                            }}
                            className="text-gray-100 hover:bg-gray-700 cursor-pointer"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                resource.subject == sub.id ? "opacity-100 text-blue-500" : "opacity-0"
                              }`}
                            />
                            {sub.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Keywords</label>
              <input
                type="text"
                value={resource.keywords}
                onChange={(e) => handleChange('keywords', e.target.value)}
                placeholder="Comma separated"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 mb-4"
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
          <textarea
            value={resource.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={10}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
