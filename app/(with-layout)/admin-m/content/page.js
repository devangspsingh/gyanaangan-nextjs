'use client';

import { useEffect, useState } from 'react';
import { FileText, Eye, UploadCloud, Edit } from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';

export default function AdminContentDashboard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/content/resources/');
      setResources(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Resources', value: resources.length, icon: FileText, color: 'bg-blue-500' },
    { name: 'Published', value: resources.filter(r => r.status === 'published').length, icon: Eye, color: 'bg-green-500' },
    { name: 'Drafts', value: resources.filter(r => r.status === 'draft').length, icon: FileText, color: 'bg-yellow-500' },
  ];

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Content Manager
          </h1>
          <p className="text-gray-400 mt-2">
            Manage educational resources, PDFs, notes, and pyq.
          </p>
        </div>
        <Link
          href="/admin-m/content/create"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <UploadCloud className="w-5 h-5 mr-2" />
          Upload Content
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {loading ? '...' : stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Resources */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            All Content
          </h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : resources.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No resources found
            </p>
            <Link
              href="/admin-m/content/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload your first resource
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {resources.map((resource) => (
              <div key={resource.slug} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {resource.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {resource.description ? (resource.description.substring(0, 100) + '...') : 'No description'}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className={`px-2 py-1 rounded text-xs ${
                        resource.status === 'published' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {resource.status}
                      </span>
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded text-xs">
                        {resource.resource_type}
                      </span>
                      <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {/* For simplicity we use a slug for edit although it doesn't exist yet */}
                  {resource.can_edit && (
                    <Link
                      href={`/admin-m/content/edit/${resource.slug}`}
                      className="ml-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center text-sm"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
