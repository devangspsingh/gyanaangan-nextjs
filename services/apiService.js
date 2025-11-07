import { cache } from 'react';
import api from '../lib/axiosInstance';
import axios from 'axios'; // Import axios directly for server-side calls
import { fetchFromServer } from './serverSideFether'; // Import server-side fetcher

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gyanaangan.in/api';

// Helper to construct full URL
const getFullUrl = (path) => `${API_BASE_URL}${path}`;

// Helper to handle API responses, now returns the full response for pagination
const handleApiResponse = async (request) => {
  try {
    const response = await request;
    return { data: response.data, error: false, fullResponse: response }; // Return full response
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return { data: error.response?.data || null, error: true, fullResponse: error.response };
  }
};

// Modified functions to support pagination
export const getCourses = async (page = 1, pageSize = 10) => {
  return handleApiResponse(api.get(getFullUrl('/courses/'), { params: { page, page_size: pageSize } }));
};

export const getCourseBySlug = async (slug) => {
  try {
    const response = await api.get(`/courses/${slug}/`);
    return { data: response.data, error: false };
  } catch (error) {
    console.error(`Error fetching course ${slug}:`, error);
    return { data: null, error: true };
  }
};

export const getStreamBySlug = async (slug) => {
  try {
    const response = await api.get(getFullUrl(`/streams/${slug}/`));
    return { data: response.data, error: false, fullResponse: response };
  } catch (error) {
    console.error(`Error fetching stream ${slug}:`, error);
    return { data: null, error: true, fullResponse: error.response };
  }
};

export const getSubjects = async (page = 1, pageSize = 9, params = {}) => { 
  return handleApiResponse(api.get(getFullUrl('/subjects/'), { params: { page, page_size: pageSize, ...params } }));
};

export const getSubjectBySlug = cache(async (slug) => {
  try {
    const response = await api.get(`/subjects/${slug}/`);
    return { data: response.data, error: false };
  } catch (error) {
    console.error(`Error fetching subject ${slug}:`, error);
    return { data: null, error: true };
  }
});

export const getResources = async (page = 1, pageSize = 9, params = {}) => { 
  // Ensure params are spread correctly, not nested.
  return handleApiResponse(api.get(getFullUrl('/resources/'), { params: { page, page_size: pageSize, ...params } }));
};

// Server-side version of getResources (with authentication via cookies)
export const getResourcesServerSide = async (page = 1, pageSize = 9, params = {}) => {
  // This function can ONLY be called from Server Components
  // It reads cookies using Next.js cookies() function
  console.log('📚 [getResourcesServerSide] Called with:', { page, pageSize, params });

  const result = await fetchFromServer('/resources/', 'GET', null, null, { 
    page, 
    page_size: pageSize, 
    ...params 
  });

  console.log('📚 [getResourcesServerSide] Result:', {
    error: result.error,
    status: result.status,
    hasData: !!result.data,
    resultsCount: result.data?.results?.length
  });

  return result;
};

// Server-side version of getResourceBySlug with authentication
export const getResourceBySlugServerSide = async (slug) => {
  // This function can ONLY be called from Server Components
  // It reads cookies using Next.js cookies() function for authentication
  console.log('📚 [getResourceBySlugServerSide] Called with slug:', slug);

  const result = await fetchFromServer(`/resources/${slug}/`, 'GET', null, null, {});

  console.log('📚 [getResourceBySlugServerSide] Result:', {
    error: result.error,
    status: result.status,
    hasData: !!result.data,
    resourceName: result.data?.name
  });

  return result;
};

// Example: getResourceBySlug
export const getResourceBySlug = async (slug) => { // Removed accessToken parameter as it's not used effectively here
  // Check if running on the server or client
  if (typeof window === 'undefined') {
    // Server-side context (e.g., for generateMetadata)
    // Use a direct axios call to avoid client-side interceptors from the global `api` instance.
    // This call is typically for public, unauthenticated data for SEO.
    try {
      const response = await axios.get(`${API_BASE_URL}/resources/${slug}/`);
      return { data: response.data, error: false, fullResponse: response };
    } catch (error) {
      console.error(`Server-side error fetching resource ${slug} for metadata:`, error.response?.data || error.message);
      return { data: null, error: true, fullResponse: error.response };
    }
  } else {
    // Client-side context (e.g., from ResourceDetailPageClient)
    // This uses the global `api` instance which includes auth interceptors.
    return handleApiResponse(api.get(getFullUrl(`/resources/${slug}/`)));
  }
};

export const getLatestNotification = async () => {
  // This typically fetches one or few items, pagination might not be critical
  // but ensure it returns in the new { data, error, fullResponse } structure if it uses handleApiResponse
  try {
    const response = await api.get(getFullUrl('/notifications/?page_size=1')); // Example: fetch latest one
    // Directly process for simplicity if not using handleApiResponse broadly
    if (response.data && response.data.results && response.data.results.length > 0) {
      return { data: response.data.results[0], error: false, fullResponse: response };
    }
    return { data: null, error: false, fullResponse: response }; // No notification found
  } catch (error) {
    console.error("Error fetching latest notification:", error);
    return { data: null, error: true, fullResponse: error.response };
  }
};

export const searchSite = async (query, page = 1, pageSize = 10) => {
  try {
    // Ensure params are spread correctly for search as well, if it supports pagination
    const response = await api.get(getFullUrl('/search/'), { params: { q: query, page, page_size: pageSize } });
    return { data: response.data, error: false, fullResponse: response };
  } catch (error) {
    console.error('Error during search:', error);
    return {
      courses: [],
      subjects: [],
      resources: [],
      error: true,
    };
  }
};

export const getSpecialPageData = async (courseSlug, streamSlug, yearSlug) => {
  try {
    // Check if we're on server-side
    if (typeof window === 'undefined') {
      // Server-side: use fetchFromServer with cookies for authentication
      const response = await fetchFromServer(`/special-pages/details/${courseSlug}/${streamSlug}/${yearSlug}/`);
      return { data: response.data, error: false };
    } else {
      // Client-side: use axios instance
      const response = await api.get(`/special-pages/details/${courseSlug}/${streamSlug}/${yearSlug}/`);
      return { data: response.data, error: false };
    }
  } catch (error) {
    console.error(`Error fetching special page for ${courseSlug}/${streamSlug}/${yearSlug}:`, error);
    return { data: null, error: true };
  }
};

export const toggleSaveResource = async (resourceSlug) => {
  // Assumes your API instance (api) handles authentication tokens
  return handleApiResponse(api.post(getFullUrl(`/resources/${resourceSlug}/toggle_save/`)));
};

export const getSavedResources = async (page = 1, pageSize = 9, params = {}) => {
  // This endpoint requires authentication, which `api` instance should handle.
  return handleApiResponse(api.get(getFullUrl('/saved-resources/'), { params: { page, page_size: pageSize, ...params } }));
};

export const getNotifications = async (page = 1, pageSize = 10) => {
  // Fetches general notifications, paginated.
  return handleApiResponse(api.get(getFullUrl('/notifications/'), { params: { page, page_size: pageSize } }));
};

// Blog-related API functions
export const getBlogPosts = async (page = 1, pageSize = 100, params = {}) => {
  return handleApiResponse(api.get(getFullUrl('/blog/posts/'), { 
    params: { page, page_size: pageSize, ...params } 
  }));
};

export const getBlogPostBySlug = async (slug) => {
  if (typeof window === 'undefined') {
    // Server-side fetch
    try {
      const response = await axios.get(`${API_BASE_URL}/blog/posts/${slug}/`);
      return { data: response.data, error: false };
    } catch (error) {
      console.error(`Server-side error fetching blog post ${slug}:`, error);
      return { data: null, error: true };
    }
  }
  // Client-side fetch
  return handleApiResponse(api.get(getFullUrl(`/blog/posts/${slug}/`)));
};

export const getBlogCategories = async () => {
  return handleApiResponse(api.get(getFullUrl('/blog/categories/')));
};

export const getFeaturedPosts = async () => {
  return handleApiResponse(api.get(getFullUrl('/blog/posts/featured/')));
};

const correctMalformedUrl = (url) => {
  if (url && url.startsWith('://')) {
    // If URL starts with :// (e.g., ://localhost:8000/...), prepend current window protocol
    return `${window.location.protocol}${url}`;
  }
  return url;
};

export const downloadResourceFile = async (downloadUrl, resourceNameFallback) => {
  if (!downloadUrl) {
    console.warn("downloadResourceFile called with no downloadUrl");
    toast.error("Download URL not provided.");
    return { success: false, error: true, message: "Download URL not provided." };
  }

  try {
    const correctedDownloadUrl = correctMalformedUrl(downloadUrl);

    // Attempt to open the URL in a new tab.
    // The browser will handle the download based on server headers.
    const newTab = window.open(correctedDownloadUrl, '_blank');
    
    if (newTab) {
      newTab.focus(); // Bring the new tab to the front if possible
      // It's hard to reliably know if the download started successfully from here
      // as it's handled by the browser. We'll assume success if the tab opens.
      // The toast message can be optimistic.
      toast.success(`Preparing download for "${resourceNameFallback || 'file'}"...`);
      return { success: true, error: false };
    } else {
      // This can happen if pop-ups are blocked
      toast.error("Could not open download link. Please check your pop-up blocker settings.");
      return { success: false, error: true, message: "Failed to open download link. Pop-up may be blocked." };
    }

  } catch (error) {
    console.error(`Error attempting to open download URL ${downloadUrl}:`, error.message);
    toast.error("An error occurred while trying to start the download.");
    return { 
      success: false, 
      error: true, 
      message: "An error occurred.",
      // status: error.response?.status // Not applicable for window.open errors
    };
  }
};

// viewResourceFileSecurely is no longer primarily used for page-by-page PDF fetching.
// If it's used for other secure file viewing that requires backend processing, it can remain.
// For PDF viewing with direct URLs, it's bypassed.
// For simplicity, I'll keep the function signature but note its changed role.
export const viewResourceFileSecurely = async (fileUrlToFetchDirectly) => {
  // This function would now be used if the frontend needs to fetch a blob from a direct URL
  // (e.g., a presigned URL that cannot be used directly in an iframe or some component props)
  // and needs CORS handling or auth headers via the api instance.
  if (!fileUrlToFetchDirectly) {
    console.warn("viewResourceFileSecurely called with no fileUrlToFetchDirectly");
    return { data: null, error: true, message: "File URL not provided." };
  }

  try {
    const correctedViewUrl = correctMalformedUrl(fileUrlToFetchDirectly);
    
    const response = await api.get(correctedViewUrl, { 
      responseType: 'blob',
      // Note: If fileUrlToFetchDirectly is an S3 presigned URL, 
      // it already includes auth. Using `api.get` might add extra headers
      // that could interfere or be redundant. Consider a direct `fetch` or `axios.get`
      // without the `api` instance's interceptors if issues arise with presigned URLs.
    });
    return { data: response.data, error: false, fullResponse: response };
  } catch (error) {
    const errorData = error.response?.data;
    let errorMessage = "Failed to load secure file.";
    // If the error response is a blob, it might be a JSON error message from the backend
    // that needs to be parsed.
    if (errorData instanceof Blob && errorData.type === 'application/json') {
      try {
        const errorJson = JSON.parse(await errorData.text());
        errorMessage = errorJson.error || errorJson.detail || errorMessage;
      } catch (parseError) {
        console.error("Could not parse error blob:", parseError);
      }
    } else if (typeof errorData?.error === 'string') {
      errorMessage = errorData.error;
    } else if (typeof errorData?.detail === 'string') {
      errorMessage = errorData.detail;
    }
    
    console.error("API Error fetching secure file:", errorMessage, error.response?.status, error.message);
    return { data: null, error: true, message: errorMessage, status: error.response?.status, fullResponse: error.response };
  }
};


// ===========================
// Banner API Functions
// ===========================

/**
 * Get all active banners
 */
export const getActiveBanners = cache(async () => {
  try {
    const response = await axios.get(getFullUrl('/banners/active/'));
    return { data: response.data, error: false };
  } catch (error) {
    console.error('Error fetching active banners:', error);
    return { data: [], error: true };
  }
});

/**
 * Get the primary banner
 */
export const getPrimaryBanner = cache(async () => {
  try {
    const response = await axios.get(getFullUrl('/banners/primary/'));
    return { data: response.data, error: false };
  } catch (error) {
    console.error('Error fetching primary banner:', error);
    return { data: null, error: true };
  }
});

/**
 * Track banner view (for analytics)
 */
export const trackBannerView = async (bannerId) => {
  try {
    const response = await api.post(getFullUrl(`/banners/${bannerId}/track_view/`));
    return { data: response.data, error: false };
  } catch (error) {
    console.error('Error tracking banner view:', error);
    return { data: null, error: true };
  }
};

/**
 * Track banner click (for analytics)
 */
export const trackBannerClick = async (bannerId) => {
  try {
    const response = await api.post(getFullUrl(`/banners/${bannerId}/track_click/`));
    return { data: response.data, error: false };
  } catch (error) {
    console.error('Error tracking banner click:', error);
    return { data: null, error: true };
  }
};

// ==================== Student Profile API ====================

/**
 * Get current user's student profile
 */
export const getMyStudentProfile = async () => {
  try {
    const response = await api.get(getFullUrl('/student-profiles/me/'));
    return { data: response.data, error: false };
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return { data: null, error: true };
  }
};

/**
 * Update current user's student profile
 */
export const updateMyStudentProfile = async (profileData) => {
  try {
    const response = await api.post(getFullUrl('/student-profiles/update-me/'), profileData);
    return { data: response.data, error: false };
  } catch (error) {
    console.error('Error updating student profile:', error);
    return { data: error.response?.data || null, error: true };
  }
};

// ==================== Subscription API ====================

/**
 * Get all subscriptions for the current user
 */
export const getMySubscriptions = async () => {
  try {
    const response = await api.get(getFullUrl('/subscriptions/'));
    return { data: response.data, error: false };
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return { data: null, error: true };
  }
};

/**
 * Toggle subscription to a special page (course/stream/year)
 */
export const toggleSpecialPageSubscription = async (specialPageId) => {
  try {
    const response = await api.post(
      getFullUrl('/subscriptions/toggle-special-page/'),
      { special_page_id: specialPageId }
    );
    return { data: response.data, error: false };
  } catch (error) {
    console.error('Error toggling special page subscription:', error);
    return { data: error.response?.data || null, error: true };
  }
};

/**
 * Toggle subscription to a subject
 */
export const toggleSubjectSubscription = async (subjectId) => {
  try {
    const response = await api.post(
      getFullUrl('/subscriptions/toggle-subject/'),
      { subject_id: subjectId }
    );
    return { data: response.data, error: false };
  } catch (error) {
    console.error('Error toggling subject subscription:', error);
    return { data: error.response?.data || null, error: true };
  }
};


