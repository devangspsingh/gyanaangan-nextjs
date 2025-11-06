import axiosInstance from '@/lib/axiosInstance';

// Blog Posts
export const getBlogPosts = async (page = 1, params = {}) => {
  const response = await axiosInstance.get('/blog/posts/', {
    params: { page, ...params }
  });
  return response.data;
};

// Get all posts including drafts (for authenticated users)
export const getAllBlogPosts = async (page = 1, params = {}) => {
  const response = await axiosInstance.get('/admin/blog/posts/', {
    params: { page, ...params }
  });
  return response.data;
};

// Get draft posts only (for authenticated users)
export const getDraftBlogPosts = async (page = 1, params = {}) => {
  const response = await axiosInstance.get('/admin/blog/posts/', {
    params: { page, status: 'draft', ...params }
  });
  return response.data;
};

export const getBlogPost = async (slug) => {
  const response = await axiosInstance.get(`/blog/posts/${slug}/`);
  return response.data;
};

// Get post including drafts (for authenticated users in admin)
export const getAdminBlogPost = async (slug) => {
  const response = await axiosInstance.get(`/admin/blog/posts/${slug}/`);
  return response.data;
};

export const createBlogPost = async (data) => {
  // Transform data for API
  const apiData = {
    ...data,
    category_id: data.category || null,
  };
  delete apiData.category;
  
  const response = await axiosInstance.post('/admin/blog/posts/', apiData);
  return response.data;
};

export const updateBlogPost = async (slug, data) => {
  // Transform data for API
  const apiData = {
    ...data,
    category_id: data.category || null,
  };
  delete apiData.category;
  
  const response = await axiosInstance.patch(`/admin/blog/posts/${slug}/`, apiData);
  return response.data;
};

export const deleteBlogPost = async (slug) => {
  const response = await axiosInstance.delete(`/admin/blog/posts/${slug}/`);
  return response.data;
};

// Image Upload
export const uploadBlogImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await axiosInstance.post('/admin/blog/posts/upload-image/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadFeaturedImage = async (slug, file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await axiosInstance.post(`/admin/blog/posts/${slug}/upload-featured-image/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadOGImage = async (slug, file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await axiosInstance.post(`/admin/blog/posts/${slug}/upload-og-image/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Categories
export const getCategories = async () => {
  const response = await axiosInstance.get('/blog/categories/');
  return response.data;
};

export const getCategory = async (slug) => {
  const response = await axiosInstance.get(`/blog/categories/${slug}/`);
  return response.data;
};

export const createCategory = async (data) => {
  const response = await axiosInstance.post('/admin/blog/categories/', data);
  return response.data;
};

export const updateCategory = async (slug, data) => {
  const response = await axiosInstance.patch(`/admin/blog/categories/${slug}/`, data);
  return response.data;
};

export const deleteCategory = async (slug) => {
  const response = await axiosInstance.delete(`/admin/blog/categories/${slug}/`);
  return response.data;
};

// Featured & Popular Posts
export const getFeaturedPosts = async () => {
  const response = await axiosInstance.get('/blog/posts/featured/');
  return response.data;
};

export const getPopularPosts = async () => {
  const response = await axiosInstance.get('/blog/posts/popular/');
  return response.data;
};
