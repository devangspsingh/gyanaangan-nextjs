'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import axiosInstance from '@/lib/axiosInstance';
import ImageUploadCrop from '@/components/ImageUploadCrop';
import { Save, Eye, ArrowLeft, Calendar, Plus, User, Image as ImageIcon, Maximize2, X } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Dynamic import of TipTap Simple Editor
const SimpleEditor = dynamic(
  () => import('@/components/tiptap-templates/simple/simple-editor').then(mod => mod.SimpleEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

export default function BlogEditor({ initialData = null, isEdit = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    status: 'draft',
    is_featured: false,
    sticky_post: false,
    meta_description: '',
    keywords: '',
    tags: '',
    publish_date: '',
    featured_image: null, // Store the blob/file
    og_image: null, // Store the blob/file
  });

  useEffect(() => {
    fetchCategories();
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        excerpt: initialData.excerpt || '',
        category: initialData.category?.id || '',
        status: initialData.status || 'draft',
        is_featured: initialData.is_featured || false,
        sticky_post: initialData.sticky_post || false,
        meta_description: initialData.meta_description || '',
        keywords: initialData.keywords || '',
        tags: initialData.tags?.map(t => t.name).join(', ') || '',
        publish_date: initialData.publish_date ? new Date(initialData.publish_date).toISOString().slice(0, 16) : '',
      });
    }
  }, [initialData]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/blog/categories/');
      setCategories(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.excerpt && formData.excerpt.length > 500) {
      newErrors.excerpt = 'Excerpt must be less than 500 characters';
    }

    if (formData.meta_description && formData.meta_description.length > 160) {
      newErrors.meta_description = 'Meta description must be less than 160 characters';
    }

    if (formData.keywords && formData.keywords.length > 200) {
      newErrors.keywords = 'Keywords must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, publishNow = false) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Use FormData to handle file uploads
      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('excerpt', formData.excerpt || '');
      formDataToSend.append('category_id', formData.category || '');
      formDataToSend.append('status', publishNow ? 'published' : formData.status);
      formDataToSend.append('is_featured', formData.is_featured);
      formDataToSend.append('sticky_post', formData.sticky_post);
      formDataToSend.append('meta_description', formData.meta_description || '');
      formDataToSend.append('keywords', formData.keywords || '');
      formDataToSend.append('tags', formData.tags || '');
      formDataToSend.append('publish_date', formData.publish_date || '');

      // Append images if they exist
      if (formData.featured_image) {
        formDataToSend.append('featured_image', formData.featured_image, 'featured_image.jpg');
      }

      if (formData.og_image) {
        formDataToSend.append('og_image', formData.og_image, 'og_image.jpg');
      }

      let response;
      if (isEdit && initialData?.slug) {
        response = await axiosInstance.patch(
          `/admin/blog/posts/${initialData.slug}/`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        response = await axiosInstance.post(
          '/admin/blog/posts/',
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      alert(isEdit ? 'Post updated successfully!' : 'Post created successfully!');
      router.push('/admin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
      const errorMessage = error.response?.data?.detail
        || error.response?.data?.message
        || JSON.stringify(error.response?.data)
        || 'Failed to save post. Make sure you have admin permissions.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFeaturedImageUpload = (croppedBlob) => {
    // Store the cropped blob in formData
    handleChange('featured_image', croppedBlob);
  };

  const handleOGImageUpload = (croppedBlob) => {
    // Store the cropped blob in formData
    handleChange('og_image', croppedBlob);
  };

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              {isEdit ? 'Update your blog post' : 'Write a new blog post'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Centered */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label> */}
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter post title..."
                className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Content Editor */}
            <div className="rounded-lg shadow border-b border-t py-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(true)}
                  className="gap-2"
                >
                  <Maximize2 className="w-4 h-4" />
                  Fullscreen
                </Button>
              </div>
              <SimpleEditor
                key="main-editor"
                content={formData.content}
                onChange={(html) => handleChange('content', html)}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-2">{errors.content}</p>
              )}
            </div>

            <hr />

            {/* Excerpt */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                placeholder="Brief summary of the post..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Max 500 characters
              </p>
            </div>

            {/* SEO Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                SEO Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => handleChange('meta_description', e.target.value)}
                    placeholder="SEO meta description..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Max 160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => handleChange('keywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Publish
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4" />
                    Publish Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.publish_date}
                    onChange={(e) => handleChange('publish_date', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.publish_date ?
                      `Will be published on ${new Date(formData.publish_date).toLocaleString()}` :
                      'Leave empty to publish immediately'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.is_featured}
                    onChange={(e) => handleChange('is_featured', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300">
                    Featured post
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sticky"
                    checked={formData.sticky_post}
                    onChange={(e) => handleChange('sticky_post', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="sticky" className="text-sm text-gray-700 dark:text-gray-300">
                    Sticky post
                  </label>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : (isEdit ? 'Update' : 'Save Draft')}
                </button>

                {formData.status === 'draft' && (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye className="w-4 h-4" />
                    Publish Now
                  </button>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Category
              </h3>

              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Image */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Featured Image
              </h3>

              <ImageUploadCrop
                onImageCropped={handleFeaturedImageUpload}
                aspectRatio={16 / 9}
                label="Upload Featured Image (16:9)"
                currentImage={initialData?.featured_image_url}
              />

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Recommended: 1200x675px (16:9 ratio)
              </p>
            </div>

            {/* OG Image */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                OG Image (Optional)
              </h3>

              <ImageUploadCrop
                onImageCropped={handleOGImageUpload}
                aspectRatio={1.91 / 1}
                label="Upload OG Image (1.91:1)"
                currentImage={initialData?.og_image_url}
              />

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Open Graph image for social sharing. Recommended: 1200x630px
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tags
              </h3>

              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Separate tags with commas
              </p>
            </div>

            {/* Author Info */}
            {initialData?.author_name && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Author
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{initialData.author_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Created: {new Date(initialData.created_at).toLocaleString()}
                </p>
                {initialData.updated_at && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Updated: {new Date(initialData.updated_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-full w-screen h-screen p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                {formData.title || 'Untitled Post'}
              </DialogTitle>
              {/* <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(false)}
              >
                <X className="w-5 h-5" />
              </Button> */}
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6">
            <SimpleEditor
              key="fullscreen-editor"
              content={formData.content}
              onChange={(html) => handleChange('content', html)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



