'use client';

import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import { getBlogPosts } from '@/services/apiService';
import BlogPostCard from './BlogPostCard';

export default function BlogInfiniteScroll({ initialPosts, totalPages }) {
  const [posts, setPosts] = useState(initialPosts);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(currentPage < totalPages);
  const { ref, inView } = useInView();

  useEffect(() => {
    const loadMorePosts = async () => {
      if (inView && hasMore && !loading) {
        setLoading(true);
        try {
          const nextPage = currentPage + 1;
          const response = await getBlogPosts(nextPage, 9);
          
          if (!response.error && response.data.results) {
            setPosts(prevPosts => [...prevPosts, ...response.data.results]);
            setCurrentPage(nextPage);
            setHasMore(nextPage < response.data.total_pages);
          }
        } catch (error) {
          console.error('Error loading more posts:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadMorePosts();
  }, [inView, hasMore, currentPage, loading]);

  return (
    <div className="space-y-8">
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>
      
      <div ref={ref} className="flex justify-center py-8">
        {loading && "loading"}
      </div>
    </div>
  );
}
