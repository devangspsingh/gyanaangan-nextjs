import api from '../lib/axiosInstance';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gyanaangan.in/api';

// Helper to construct full URL
const getFullUrl = (path) => `${API_BASE_URL}${path}`;

// Helper to handle API responses
const handleApiResponse = async (request) => {
  try {
    const response = await request;
    return { data: response.data, error: false, fullResponse: response };
  } catch (error) {
    console.error("Event API Error:", error.response?.data || error.message);
    return {
      data: error.response?.data || null,
      error: true,
      fullResponse: error.response,
      message: error.response?.data?.error || error.response?.data?.detail || error.message
    };
  }
};

// ==================== Event API ====================

/**
 * Get all events with optional filters
 * @param {Object} params - Query parameters (search, type, organization, status, time, featured, registration_open, page, page_size)
 */
export const getEvents = async (params = {}) => {
  return handleApiResponse(
    api.get(getFullUrl('/events/'), { params })
  );
};

/**
 * Get event by slug
 * @param {string} slug - Event slug
 */
export const getEventBySlug = async (slug) => {
  // Check if running on server or client
  if (typeof window === 'undefined') {
    // Server-side (for SEO/metadata)
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${slug}/`);
      return { data: response.data, error: false, fullResponse: response };
    } catch (error) {
      console.error(`Server-side error fetching event ${slug}:`, error);
      return { data: null, error: true, fullResponse: error.response };
    }
  }

  // Client-side
  return handleApiResponse(
    api.get(getFullUrl(`/events/${slug}/`))
  );
};

/**
 * Create a new event
 * @param {Object} eventData - Event details
 */
export const createEvent = async (eventData) => {
  return handleApiResponse(
    api.post(getFullUrl('/events/'), eventData)
  );
};

/**
 * Update an event
 * @param {string} slug - Event slug
 * @param {Object} eventData - Updated event details
 */
export const updateEvent = async (slug, eventData) => {
  return handleApiResponse(
    api.patch(getFullUrl(`/events/${slug}/`), eventData)
  );
};

/**
 * Delete an event
 * @param {string} slug - Event slug
 */
export const deleteEvent = async (slug) => {
  return handleApiResponse(
    api.delete(getFullUrl(`/events/${slug}/`))
  );
};

/**
 * Publish an event
 * @param {string} slug - Event slug
 */
export const publishEvent = async (slug) => {
  return handleApiResponse(
    api.post(getFullUrl(`/events/${slug}/publish/`))
  );
};

/**
 * Unpublish an event
 * @param {string} slug - Event slug
 */
export const unpublishEvent = async (slug) => {
  return handleApiResponse(
    api.post(getFullUrl(`/events/${slug}/unpublish/`))
  );
};

// ==================== Event Registration API ====================

/**
 * Register for an event
 * @param {string} slug - Event slug
 * @param {Object} additionalInfo - Additional registration information
 */
export const registerForEvent = async (slug, additionalInfo = {}) => {
  return handleApiResponse(
    api.post(getFullUrl(`/events/${slug}/register/`), { additional_info: additionalInfo })
  );
};

/**
 * Cancel event registration
 * @param {string} slug - Event slug
 */
export const cancelEventRegistration = async (slug) => {
  return handleApiResponse(
    api.post(getFullUrl(`/events/${slug}/cancel_registration/`))
  );
};

/**
 * Get all registrations for an event (organization members only)
 * @param {string} slug - Event slug
 * @param {Object} params - Query parameters (status, attendance filters)
 */
export const getEventRegistrations = async (slug, params = {}) => {
  return handleApiResponse(
    api.get(getFullUrl(`/events/${slug}/registrations/`), { params })
  );
};

/**
 * Mark attendance for registrations
 * @param {string} slug - Event slug
 * @param {Array<number>} registrationIds - Array of registration IDs
 * @param {string} attendanceStatus - 'PRESENT' or 'ABSENT'
 */
export const markAttendance = async (slug, registrationIds, attendanceStatus = 'PRESENT') => {
  return handleApiResponse(
    api.post(getFullUrl(`/events/${slug}/mark_attendance/`), {
      registration_ids: registrationIds,
      attendance_status: attendanceStatus
    })
  );
};

// ==================== Manual Participants API ====================

/**
 * Get all manual participants for an event
 * @param {string} slug - Event slug
 */
export const getManualParticipants = async (slug) => {
  return handleApiResponse(
    api.get(getFullUrl(`/events/${slug}/manual_participants/`))
  );
};

/**
 * Add a manual participant to an event
 * @param {string} slug - Event slug
 * @param {Object} participantData - Participant details
 */
export const addManualParticipant = async (slug, participantData) => {
  return handleApiResponse(
    api.post(getFullUrl(`/events/${slug}/add_manual_participant/`), participantData)
  );
};

/**
 * Bulk add manual participants
 * @param {string} slug - Event slug
 * @param {Array<Object>} participants - Array of participant objects
 */
export const bulkAddParticipants = async (slug, participants) => {
  return handleApiResponse(
    api.post(getFullUrl(`/events/${slug}/bulk_add_participants/`), {
      participants: participants
    })
  );
};

// ==================== Event Dashboard API ====================

/**
 * Get event dashboard statistics (organization members only)
 * @param {string} slug - Event slug
 */
export const getEventDashboard = async (slug) => {
  return handleApiResponse(
    api.get(getFullUrl(`/events/${slug}/dashboard/`))
  );
};

// ==================== My Registrations API ====================

/**
 * Get all registrations for current user
 */
export const getMyRegistrations = async () => {
  return handleApiResponse(
    api.get(getFullUrl('/events/my-registrations/'))
  );
};

/**
 * Get upcoming registrations for current user
 */
export const getMyUpcomingRegistrations = async () => {
  return handleApiResponse(
    api.get(getFullUrl('/events/my-registrations/upcoming/'))
  );
};

/**
 * Get past registrations for current user
 */
export const getMyPastRegistrations = async () => {
  return handleApiResponse(
    api.get(getFullUrl('/events/my-registrations/past/'))
  );
};

// ==================== Helper Functions ====================

/**
 * Get upcoming events
 */
export const getUpcomingEvents = async (params = {}) => {
  return getEvents({ ...params, time: 'upcoming' });
};

/**
 * Get ongoing events
 */
export const getOngoingEvents = async (params = {}) => {
  return getEvents({ ...params, time: 'ongoing' });
};

/**
 * Get past events
 */
export const getPastEvents = async (params = {}) => {
  return getEvents({ ...params, time: 'past' });
};

/**
 * Get featured events
 */
export const getFeaturedEvents = async (params = {}) => {
  return getEvents({ ...params, featured: true });
};

/**
 * Get events by type
 * @param {string} eventType - Event type (WORKSHOP, SEMINAR, COMPETITION, etc.)
 */
export const getEventsByType = async (eventType, params = {}) => {
  return getEvents({ ...params, type: eventType });
};

/**
 * Get events by organization
 * @param {string} organizationSlug - Organization slug
 */
export const getEventsByOrganization = async (organizationSlug, params = {}) => {
  return getEvents({ ...params, organization: organizationSlug });
};

/**
 * Search events
 * @param {string} query - Search query
 */
export const searchEvents = async (query, params = {}) => {
  return getEvents({ ...params, search: query });
};

/**
 * Verify event attendance
 * @param {string} registrationId - Registration ID
 */
export const verifyAttendance = async (registrationId) => {
  return handleApiResponse(
    api.get(getFullUrl(`/events/verify-attendance/?registration_id=${registrationId}`))
  );
};

// Default export with all functions
const eventService = {
  getEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  getMyRegistrations,
  getMyUpcomingRegistrations,
  getMyPastRegistrations,
  getEventRegistrations,
  markAttendance,
  //   bulkMarkAttendance,
  getManualParticipants,
  addManualParticipant,
  //   updateEventManualParticipant,
  //   deleteManualParticipant,
  bulkAddParticipants,
  //   getEventStats,
  getEventDashboard,
  getUpcomingEvents,
  getOngoingEvents,
  getPastEvents,
  getFeaturedEvents,
  //   getEventsByStatus,
  getEventsByType,
  getEventsByOrganization,
  searchEvents,
  verifyAttendance,
};

export default eventService;
