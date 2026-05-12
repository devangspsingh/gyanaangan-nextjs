'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, UploadCloud, X, Save, File, CheckCircle, ChevronDown, Check } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export default function CreateContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [openCombobox, setOpenCombobox] = useState({}); // Track open state of popovers
  
  // Data for dropdowns
  const [allSubjects, setAllSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]); // Filter Years
  const [streams, setStreams] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [educationalYears, setEducationalYears] = useState([]);
  
  // Auth state
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [globalUploadedById, setGlobalUploadedById] = useState('');
  const [globalResourceType, setGlobalResourceType] = useState('pdf');
  const [globalEducationalYear, setGlobalEducationalYear] = useState('');

  // Global Filters & Settings
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [namingConvention, setNamingConvention] = useState("CSW | May 2025 | PYQ");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStream, setSelectedStream] = useState("");

  // File uploads
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [resourcesData, setResourcesData] = useState([]);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [subjectsRes, coursesRes, yearsRes, streamsRes, templatesRes, profileRes, eduYearsRes] = await Promise.all([
        axiosInstance.get('/admin/content/subjects/'),
        axiosInstance.get('/admin/content/courses/'),
        axiosInstance.get('/admin/content/years/'),
        axiosInstance.get('/admin/content/streams/'),
        axiosInstance.get('/admin/content/templates/'),
        axiosInstance.get('/profiles/me/'),
        axiosInstance.get('/admin/content/educational-years/'),
      ]);
      setAllSubjects(subjectsRes.data.results || subjectsRes.data || []);
      setCourses(coursesRes.data.results || coursesRes.data || []);
      setYears(yearsRes.data.results || yearsRes.data || []);
      setStreams(streamsRes.data.results || streamsRes.data || []);
      setTemplates(templatesRes.data.results || templatesRes.data || []);
      setEducationalYears(eduYearsRes.data.results || eduYearsRes.data || []);
      
      if (profileRes.data && profileRes.data.user && profileRes.data.user.is_superuser) {
        setIsSuperuser(true);
        fetchUsers('');
      }
    } catch (error) {
      console.error("Failed to load options", error);
      toast.error("Failed to load form options");
    }
  };

  const fetchUsers = async (query) => {
    try {
      const res = await axiosInstance.get(`/admin/content/users/?search=${query}`);
      setUsers(res.data.results || res.data || []);
    } catch (e) {
      console.error("Failed to fetch users");
    }
  };

  const handleTemplateChange = (e) => {
    const val = e.target.value;
    setSelectedTemplate(val);
    if (val) {
      const tmpl = templates.find(t => t.id == val);
      if (tmpl) {
        setNamingConvention(tmpl.naming_convention || "");
        setCustomPrompt(tmpl.description_prompt || "");
      }
    } else {
      setNamingConvention("");
      setCustomPrompt("");
    }
  };

  // Filter subjects based on selected global filters
  const getFilteredSubjects = () => {
    return allSubjects.filter(sub => {
      let matches = true;
      if (selectedCourse && sub.courses && !sub.courses.includes(Number(selectedCourse))) {
         matches = false;
      }
      if (selectedYear && sub.years && !sub.years.includes(Number(selectedYear))) {
         matches = false;
      }
      if (selectedStream && sub.streams && !sub.streams.includes(Number(selectedStream))) {
         matches = false;
      }
      return matches;
    });
  };

  const filteredSubjects = getFilteredSubjects();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    
    // Initialize data for each new file
    const newResources = files.map((file) => ({
      file: file,
      name: file.name.split('.')[0] || '',
      resource_type: globalResourceType,
      status: 'published',
      description: '',
      meta_description: '',
      keywords: '',
      subject: '',
      educational_year: globalEducationalYear,
      privacy: ['view'],
      isGenerating: false,
      isSaved: false,
    }));
    
    setResourcesData((prev) => [...prev, ...newResources]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setResourcesData((prev) => prev.filter((_, i) => i !== index));
  };

  const updateResourceData = (index, field, value) => {
    setResourcesData((prev) => {
      const newData = [...prev];
      newData[index][field] = value;
      return newData;
    });
  };

  const applyGlobalBaselineToAll = () => {
    setResourcesData(prev => prev.map(r => {
      if (r.isSaved) return r;
      return {
        ...r,
        resource_type: globalResourceType || r.resource_type,
        educational_year: globalEducationalYear || r.educational_year
      };
    }));
    toast.success("Applied global baseline settings to all pending files!");
  };

  const generateAllAIContent = async () => {
    // Only generate for files that aren't saved yet
    const unsavedResources = resourcesData.filter(r => !r.isSaved);
    if (unsavedResources.length === 0) return;

    setIsGeneratingAll(true);
    toast.loading("Generating content for all files with AI...", { id: 'ai-bulk' });

    const payload = {
      filenames: unsavedResources.map(r => r.file.name),
      subjects: filteredSubjects.map(s => ({ id: s.id, name: s.name })),
      educational_years: educationalYears.map(y => ({ id: y.id, name: y.name })),
      naming_convention: namingConvention,
      custom_prompt: customPrompt,
    };

    try {
      const response = await axiosInstance.post('/ai/generate-content/', payload);
      
      const aiResults = response.data.results || [];
      
      // Update resources Data by mapping original filename
      setResourcesData(prev => prev.map(resource => {
        if (resource.isSaved) return resource;
        
        const aiData = aiResults.find(r => r.original_filename === resource.file.name);
        if (aiData) {
          return {
            ...resource,
            name: aiData.name || resource.name,
            description: aiData.description || resource.description,
            meta_description: aiData.meta_description || resource.meta_description,
            keywords: aiData.keywords || resource.keywords,
            subject: aiData.subject_id || resource.subject,
            resource_type: aiData.resource_type || resource.resource_type,
            educational_year: aiData.educational_year_id || resource.educational_year,
          };
        }
        return resource;
      }));

      toast.success("AI Generation complete!", { id: 'ai-bulk' });
    } catch (error) {
      console.error("AI Gen Error:", error);
      toast.error("AI Generation failed.", { id: 'ai-bulk' });
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const submitAll = async () => {
    setLoading(true);
    let successCount = 0;
    
    for (let i = 0; i < resourcesData.length; i++) {
      const resource = resourcesData[i];
      if (resource.isSaved) continue; // Skip already saved ones

      const formData = new FormData();
      formData.append('name', resource.name);
      formData.append('resource_type', resource.resource_type);
      formData.append('status', resource.status);
      formData.append('description', resource.description);
      formData.append('meta_description', resource.meta_description);
      formData.append('keywords', resource.keywords);
      if (resource.subject) formData.append('subject', resource.subject);
      if (resource.educational_year) formData.append('educational_year', resource.educational_year);
      if (globalUploadedById) formData.append('uploaded_by_id', globalUploadedById);
      
      // Privacy is multiselect
      resource.privacy.forEach(p => formData.append('privacy', p));
      formData.append('file', resource.file);

      try {
        await axiosInstance.post('/admin/content/resources/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        updateResourceData(i, 'isSaved', true);
        successCount++;
      } catch (error) {
        console.error(`Failed to save resource ${i}`, error);
        toast.error(`Failed to save ${resource.name}`);
      }
    }

    setLoading(false);
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} resources!`);
      if (successCount === resourcesData.length) {
        setTimeout(() => router.push('/admin/content'), 1500);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Upload Resources</h1>
          <p className="text-gray-400 mt-2">Bulk upload and use AI to auto-fill metadata.</p>
        </div>
      </div>

      {/* Global Settings & Filters */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700 shadow-md">
        <h3 className="text-lg font-medium text-white mb-4">AI & Categorization Settings</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-1">Select Upload Type Template (Optional)</label>
          <select
            value={selectedTemplate}
            onChange={handleTemplateChange}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 mb-2"
          >
            <option value="">-- Manual Configuration --</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Global Baseline Content Type</label>
            <select
              value={globalResourceType}
              onChange={(e) => setGlobalResourceType(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">PDF / Document</option>
              <option value="notes">Notes</option>
              <option value="pyq">Previous Year Question</option>
              <option value="lab manual">Lab Manual</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Global Baseline Educational Year</label>
            <div className="flex gap-2">
              <select
                value={globalEducationalYear}
                onChange={(e) => setGlobalEducationalYear(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Year --</option>
                {educationalYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
              {resourcesData.length > 0 && (
                <button 
                  onClick={applyGlobalBaselineToAll}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow whitespace-nowrap"
                >
                  Apply to All
                </button>
              )}
            </div>
          </div>
        </div>

        {isSuperuser && (
          <div className="mb-6 border-b border-gray-700 pb-6">
            <label className="block text-sm font-medium text-blue-400 mb-1">Global Credit Attribution (Superuser Override)</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  role="combobox"
                  className={`w-full md:w-1/2 flex items-center justify-between bg-gray-700 border border-blue-600/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${!globalUploadedById ? 'text-gray-400' : ''}`}
                >
                  {globalUploadedById ? users.find(u => u.id === globalUploadedById)?.username || 'Selected' : "Default Admin Credit..."}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0 border-gray-600 bg-gray-800" side="bottom" align="start">
                <Command filter={(value, search) => value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0}>
                  <CommandInput 
                    placeholder="Search username or email..." 
                    className="text-white"
                    onValueChange={(val) => {
                      setSearchUserQuery(val);
                      fetchUsers(val);
                    }}
                  />
                  <CommandList>
                    <CommandEmpty className="py-6 text-center text-sm text-gray-400">No users found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                          value="default"
                          onSelect={() => setGlobalUploadedById('')}
                          className="text-gray-100 hover:bg-gray-700 cursor-pointer"
                      >
                          <Check className={`mr-2 h-4 w-4 ${!globalUploadedById ? "opacity-100 text-blue-500" : "opacity-0"}`} />
                          Use Default System Credit
                      </CommandItem>
                      {users.map((u) => (
                        <CommandItem
                          key={u.id}
                          value={u.username}
                          onSelect={() => {
                            setGlobalUploadedById(u.id);
                          }}
                          className="text-gray-100 hover:bg-gray-700 cursor-pointer"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              globalUploadedById === u.id ? "opacity-100 text-blue-500" : "opacity-0"
                            }`}
                          />
                          {u.username} ({u.first_name})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Naming Convention</label>
            <input
              type="text"
              value={namingConvention}
              onChange={(e) => setNamingConvention(e.target.value)}
              placeholder="e.g., CSW | May 2025 | PYQ"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">AI will follow this pattern for titles.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Custom Prompt Instructions</label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Keep descriptions short and bulleted."
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Extra instructions sent to the AI model.</p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <p className="text-sm font-medium text-gray-300">Global Filters & Context (Helps AI Contextualize)</p>
            {resourcesData.filter(r => !r.isSaved).length > 0 && (
              <button 
                onClick={generateAllAIContent}
                disabled={isGeneratingAll}
                className="flex items-center text-sm px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 mr-2 ${isGeneratingAll ? 'animate-spin' : ''}`} />
                {isGeneratingAll ? 'Generating...' : '✨ AI Auto-fill All Files'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Streams</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects Years</option>
              {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
            <div className="flex items-center">
              <span className="text-sm text-gray-400 italic">Select filters to narrow down the AI's subject choices and context.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl p-10 text-center mb-8 relative hover:bg-gray-750 transition-colors">
        <input 
          type="file" 
          multiple 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Drag & Drop files here</h3>
        <p className="text-gray-400">or click to browse from your computer</p>
      </div>

      {/* Forms List */}
      <div className="space-y-8">
        {resourcesData.map((resource, index) => {
          const currentSubject = filteredSubjects.find(s => s.id == resource.subject);
          
          return (
          <div key={index} className={`bg-gray-800 rounded-xl shadow-lg border ${resource.isSaved ? 'border-green-500' : 'border-gray-700'} overflow-hidden transition-all`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium text-white">{resource.file.name}</h4>
                {resource.isSaved && <span className="flex items-center text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3 mr-1"/> Saved</span>}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => removeFile(index)} 
                  disabled={resource.isSaved}
                  className="text-gray-400 hover:text-red-400 p-1 rounded-md transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-100 transition-opacity">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={resource.name}
                    onChange={(e) => updateResourceData(index, 'name', e.target.value)}
                    disabled={resource.isSaved}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    value={resource.description}
                    onChange={(e) => updateResourceData(index, 'description', e.target.value)}
                    disabled={resource.isSaved}
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                    <select
                      value={resource.resource_type}
                      onChange={(e) => updateResourceData(index, 'resource_type', e.target.value)}
                      disabled={resource.isSaved}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                    <label className="block text-sm font-medium text-gray-400 mb-1">Educational Year</label>
                    <select
                      value={resource.educational_year || ""}
                      onChange={(e) => updateResourceData(index, 'educational_year', e.target.value)}
                      disabled={resource.isSaved}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="">Select Year...</option>
                      {educationalYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                    <select
                      value={resource.status}
                      onChange={(e) => updateResourceData(index, 'status', e.target.value)}
                      disabled={resource.isSaved}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                  
                  <Popover open={openCombobox[index] || false} onOpenChange={(val) => setOpenCombobox(prev => ({...prev, [index]: val}))}>
                    <PopoverTrigger asChild>
                      <button
                        role="combobox"
                        aria-expanded={openCombobox[index] || false}
                        disabled={resource.isSaved}
                        className={`w-full flex items-center justify-between bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${!currentSubject ? 'text-gray-400' : ''}`}
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
                            {filteredSubjects.map((sub) => (
                              <CommandItem
                                key={sub.id}
                                value={sub.name}
                                onSelect={(currentValue) => {
                                  updateResourceData(index, 'subject', sub.id);
                                  setOpenCombobox(prev => ({...prev, [index]: false}));
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
                    onChange={(e) => updateResourceData(index, 'keywords', e.target.value)}
                    disabled={resource.isSaved}
                    placeholder="Comma separated"
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 mb-4"
                  />
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Action Bar */}
      {resourcesData.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-gray-900 border-t border-gray-800 p-4 shadow-2xl z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <span className="text-gray-400">
              {resourcesData.filter(r => r.isSaved).length} of {resourcesData.length} saved
            </span>
            <button
              onClick={submitAll}
              disabled={loading || resourcesData.every(r => r.isSaved)}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Saving...</span>
              ) : (
                <span className="flex items-center"><Save className="w-5 h-5 mr-2" /> Submit All Resources</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
