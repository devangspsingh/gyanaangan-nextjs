'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown, Check } from 'lucide-react';

export default function ResourceMetadataForm({ 
  resource, 
  onChange, 
  disabled = false, 
  allSubjects = [], 
  educationalYears = [] 
}) {
  const [openCombobox, setOpenCombobox] = useState(false);

  const currentSubject = allSubjects.find(s => s.id == resource.subject);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-100 transition-opacity">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
          <input
            type="text"
            value={resource.name}
            onChange={(e) => onChange('name', e.target.value)}
            disabled={disabled}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
            <select
              value={resource.resource_type}
              onChange={(e) => onChange('resource_type', e.target.value)}
              disabled={disabled}
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
              onChange={(e) => onChange('educational_year', e.target.value)}
              disabled={disabled}
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
              onChange={(e) => onChange('status', e.target.value)}
              disabled={disabled}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
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
                disabled={disabled}
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
                    {allSubjects.map((sub) => (
                      <CommandItem
                        key={sub.id}
                        value={sub.name}
                        onSelect={() => {
                          onChange('subject', sub.id);
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
            value={resource.keywords || ''}
            onChange={(e) => onChange('keywords', e.target.value)}
            disabled={disabled}
            placeholder="Comma separated"
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 mb-4"
          />
        </div>
      </div>
      
      <div className="col-span-1 md:col-span-2">
        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
        <textarea
          value={resource.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          disabled={disabled}
          rows={6}
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>
    </div>
  );
}
