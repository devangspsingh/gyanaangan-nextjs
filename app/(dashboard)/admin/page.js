'use client';

import { useEffect, useState } from 'react';
import { FileText, Eye, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch blog posts stats
      const response = await axiosInstance.get('/blog/posts/?page_size=5');
      const posts = response.data.results || [];
      
      setRecentPosts(posts);
      
      // Calculate stats (in production, you'd want a dedicated stats endpoint)
      setStats({
        totalPosts: response.data.count || 0,
        publishedPosts: posts.filter(p => p.status === 'published').length,
        draftPosts: posts.filter(p => p.status === 'draft').length,
        totalViews: posts.reduce((sum, p) => sum + (p.view_count || 0), 0),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'bg-blue-500' },
    { name: 'Published', value: stats.publishedPosts, icon: Eye, color: 'bg-green-500' },
    { name: 'Drafts', value: stats.draftPosts, icon: FileText, color: 'bg-yellow-500' },
    { name: 'Total Views', value: stats.totalViews, icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Dashboard
        </h1>
        <p className="text-gray-400 mt-2">
          Welcome to your admin console
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      {/* Recent Posts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Blog Posts
          </h2>
          <Link
            href="/admin/blog"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all
          </Link>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No blog posts yet
            </p>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {post.excerpt || 'No excerpt'}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className={`px-2 py-1 rounded text-xs ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {post.status}
                      </span>
                      <span>{post.view_count || 0} views</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/blog/edit/${post.slug}`}
                    className="ml-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/blog/new"
          className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <FileText className="w-8 h-8 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Create New Post</h3>
          <p className="text-blue-100 text-sm">
            Write and publish a new blog post
          </p>
        </Link>

        <Link
          href="/blog"
          className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <Eye className="w-8 h-8 mb-4" />
          <h3 className="text-lg font-semibold mb-2">View Public Blog</h3>
          <p className="text-green-100 text-sm">
            See how your blog looks to visitors
          </p>
        </Link>

        <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow">
          <Users className="w-8 h-8 mb-4" />
          <h3 className="text-lg font-semibold mb-2">More Coming Soon</h3>
          <p className="text-purple-100 text-sm">
            Resources, media management, and more
          </p>
        </div>
      </div>
    </div>
  );
}
