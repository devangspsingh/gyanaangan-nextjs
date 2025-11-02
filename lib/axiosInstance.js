import axios from 'axios';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
});

// Request interceptor to add the token
api.interceptors.request.use(
  (config) => {
    // Auth token is set directly in AuthContext on login/init
    // and when the api instance is imported there.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh (simplified for static export context)
// For a true static export, refresh token logic is complex as it requires a secure place
// to call the refresh endpoint. This example assumes the backend API handles refresh.
// If a token expires, the user might need to re-login.
// More robust refresh logic would typically involve a backend-for-frontend (BFF) or secure cookie handling,
// which are not typical for pure static exports.

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const storedTokens = localStorage.getItem('tokens');
      if (storedTokens) {
        const { refresh: currentRefreshToken } = JSON.parse(storedTokens); // Renamed to avoid conflict
        if (currentRefreshToken) {
          try {
            const { data } = await axios.post(`${NEXT_PUBLIC_API_URL}/auth/jwt/refresh/`, { refresh: currentRefreshToken });
            // Use the new refresh token from response if available (for token rotation), else keep the current one.
            const newRefreshToken = data.refresh || currentRefreshToken;
            localStorage.setItem('tokens', JSON.stringify({ access: data.access, refresh: newRefreshToken }));
            
            // Update user info if needed, or rely on existing user data
            const storedUser = localStorage.getItem('user');
            if(storedUser) {
                // Potentially re-decode token to update user if roles/info changed
            }

            api.defaults.headers.Authorization = `Bearer ${data.access}`;
            originalRequest.headers.Authorization = `Bearer ${data.access}`;
            return api(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Trigger logout / clear auth state
            localStorage.removeItem('user');
            localStorage.removeItem('tokens');
            delete api.defaults.headers.Authorization;
            // Clear the cookie as well
            document.cookie = 'access_token=; path=/; max-age=0';
            console.log('🍪 [Axios] Cleared expired cookie after refresh failure');
            // Redirect to login, handled by useAuth or ProtectedRoute
            window.location.href = '/login'; // Force redirect
            return Promise.reject(refreshError);
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
