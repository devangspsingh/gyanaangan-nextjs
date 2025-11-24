import api from '../lib/axiosInstance';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gyanaangan.in/api';

// Helper to construct full URL
const getFullUrl = (path) => `${API_BASE_URL}${path}`;

// Helper to handle API responses
const handleApiResponse = async (request) => {
  try {
    const response = await request;
    return { data: response.data, error: false, fullResponse: response };
  } catch (error) {
    console.error("Organization API Error:", error.response?.data || error.message);
    return { 
      data: error.response?.data || null, 
      error: true, 
      fullResponse: error.response,
      message: error.response?.data?.error || error.response?.data?.detail || error.message
    };
  }
};

// ==================== Organization API ====================

/**
 * Get all organizations with optional filters
 * @param {Object} params - Query parameters (search, verified, my_organizations, page, page_size)
 */
export const getOrganizations = async (params = {}) => {
  return handleApiResponse(
    api.get(getFullUrl('/organizations/'), { params })
  );
};

/**
 * Get organization by slug
 * @param {string} slug - Organization slug
 */
export const getOrganizationBySlug = async (slug) => {
  return handleApiResponse(
    api.get(getFullUrl(`/organizations/${slug}/`))
  );
};

/**
 * Create a new organization
 * @param {Object} organizationData - Organization details
 */
export const createOrganization = async (organizationData) => {
  return handleApiResponse(
    api.post(getFullUrl('/organizations/'), organizationData)
  );
};

/**
 * Update an organization
 * @param {string} slug - Organization slug
 * @param {Object} organizationData - Updated organization details
 */
export const updateOrganization = async (slug, organizationData) => {
  return handleApiResponse(
    api.patch(getFullUrl(`/organizations/${slug}/`), organizationData)
  );
};

/**
 * Delete an organization
 * @param {string} slug - Organization slug
 */
export const deleteOrganization = async (slug) => {
  return handleApiResponse(
    api.delete(getFullUrl(`/organizations/${slug}/`))
  );
};

// ==================== Organization Members API ====================

/**
 * Get all members of an organization
 * @param {string} slug - Organization slug
 * @param {Object} params - Query parameters (role filter)
 */
export const getOrganizationMembers = async (slug, params = {}) => {
  return handleApiResponse(
    api.get(getFullUrl(`/organizations/${slug}/members/`), { params })
  );
};

/**
 * Add a member to an organization
 * @param {string} slug - Organization slug
 * @param {Object} memberData - Member details (user, role, permissions)
 */
export const addOrganizationMember = async (slug, memberData) => {
  return handleApiResponse(
    api.post(getFullUrl(`/organizations/${slug}/add_member/`), memberData)
  );
};

/**
 * Update a member's role or permissions
 * @param {string} slug - Organization slug
 * @param {number} memberId - Member ID
 * @param {Object} memberData - Updated member details
 */
export const updateOrganizationMember = async (slug, memberId, memberData) => {
  return handleApiResponse(
    api.patch(getFullUrl(`/organizations/${slug}/update_member/`), {
      member_id: memberId,
      ...memberData
    })
  );
};

/**
 * Remove a member from an organization
 * @param {string} slug - Organization slug
 * @param {number} memberId - Member ID
 */
export const removeOrganizationMember = async (slug, memberId) => {
  return handleApiResponse(
    api.post(getFullUrl(`/organizations/${slug}/remove_member/`), {
      member_id: memberId
    })
  );
};

// ==================== Organization Gallery API ====================

/**
 * Get organization gallery images
 * @param {string} slug - Organization slug
 */
export const getOrganizationGallery = async (slug) => {
  return handleApiResponse(
    api.get(getFullUrl(`/organizations/${slug}/gallery/`))
  );
};

/**
 * Add an image to organization gallery
 * @param {string} slug - Organization slug
 * @param {FormData} imageData - Form data with image file and metadata
 */
export const addGalleryImage = async (slug, imageData) => {
  return handleApiResponse(
    api.post(getFullUrl(`/organizations/${slug}/add_gallery_image/`), imageData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  );
};

/**
 * Remove an image from organization gallery
 * @param {string} slug - Organization slug
 * @param {number} imageId - Gallery image ID
 */
export const removeGalleryImage = async (slug, imageId) => {
  return handleApiResponse(
    api.delete(getFullUrl(`/organizations/${slug}/remove_gallery_image/`), {
      params: { image_id: imageId }
    })
  );
};

// ==================== Organization Events API ====================

/**
 * Get all events by an organization
 * @param {string} slug - Organization slug
 * @param {Object} params - Query parameters (status filter)
 */
export const getOrganizationEvents = async (slug, params = {}) => {
  return handleApiResponse(
    api.get(getFullUrl(`/organizations/${slug}/events/`), { params })
  );
};

// ==================== Organization Stats API ====================

/**
 * Get organization statistics (members only)
 * @param {string} slug - Organization slug
 */
export const getOrganizationStats = async (slug) => {
  return handleApiResponse(
    api.get(getFullUrl(`/organizations/${slug}/stats/`))
  );
};

// ==================== My Organizations ====================

/**
 * Get organizations where current user is a member
 */
export const getMyOrganizations = async () => {
  return handleApiResponse(
    api.get(getFullUrl('/organizations/'), { 
      params: { my_organizations: true } 
    })
  );
};

// Default export with all functions
const organizationService = {
  getOrganizations,
  getOrganizationBySlug,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMember,
  removeOrganizationMember,
  getOrganizationEvents,
  getOrganizationGallery,
  addGalleryImage,
  removeGalleryImage,
//   deleteOrganizationGalleryImage,

  getOrganizationStats,
  getMyOrganizations,
};

export default organizationService;
