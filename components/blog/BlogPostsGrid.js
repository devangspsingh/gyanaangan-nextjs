'use client';

import { useState } from 'react';
import BlogPostCard from './BlogPostCard';
import BlogPagination from './BlogPagination';
import { getBlogPosts } from '@/services/apiService';

export default function BlogPostsGrid({ 
  initialPosts, 
  currentPage, 
  totalPages,
  enableLoadMore = false 
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [loadedPages, setLoadedPages] = useState(new Set([currentPage]));

  const loadMorePosts = async () => {
    if (loading) return;
    
    const nextPage = currentPage + loadedPages.size;
    if (nextPage > totalPages) return;

    setLoading(true);
    try {
      const response = await getBlogPosts(nextPage, 9);
      
      if (!response.error && response.data.results) {
        setPosts(prevPosts => [...prevPosts, ...response.data.results]);
        setLoadedPages(prev => new Set([...prev, nextPage]));
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-8">
        {posts.map(post => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>

      {/* Pagination */}
      <BlogPagination currentPage={currentPage} totalPages={totalPages} />

      {/* Optional Load More Button (for hybrid approach) */}
      {enableLoadMore && currentPage + loadedPages.size <= totalPages && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMorePosts}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : (
              'Load More Posts'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
