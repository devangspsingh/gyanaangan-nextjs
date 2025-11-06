'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAdminBlogPost } from '@/services/blogService';
import BlogEditor from '@/components/BlogEditor';

export default function EditBlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getAdminBlogPost(params.slug);
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
        alert('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    
    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Post not found</p>
      </div>
    );
  }

  return <BlogEditor initialData={post} isEdit={true} />;
}
