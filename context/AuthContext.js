'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../lib/axiosInstance'; // Adjust path as needed
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const initializeAuth = useCallback(async () => { // Make initializeAuth async
    setLoading(true);
    try {
      const storedTokens = localStorage.getItem('tokens');
      if (storedTokens) {
        const parsedTokens = JSON.parse(storedTokens);
        let currentAccessToken = parsedTokens.access;
        let currentRefreshToken = parsedTokens.refresh;

        if (!currentAccessToken) {
          clearAuth();
          setLoading(false);
          return;
        }

        const decodedAccessToken = jwtDecode(currentAccessToken);
        
        if (decodedAccessToken.exp * 1000 > Date.now()) {
          // Access token is valid, fetch fresh user data from API
          setTokens(parsedTokens);
          api.defaults.headers.Authorization = `Bearer ${currentAccessToken}`;
          
          // Ensure cookie is also set (in case it was cleared but localStorage persists)
          document.cookie = `access_token=${currentAccessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          console.log('🍪 [Init] Cookie synced from localStorage');
          
          // Fetch fresh user profile data from API
          try {
            const profileResponse = await api.get('/profiles/me/');
            const profileData = profileResponse.data;
            
            // Transform profile data to user object
            const userData = {
              id: profileData.user.id,
              email: profileData.user.email,
              username: profileData.user.username,
              name: profileData.user.first_name,
              picture: profileData.profile_pic_url || profileData.img_google_url,
              is_staff: profileData.user.is_staff,
              is_superuser: profileData.user.is_superuser,
              bio: profileData.bio,
              emoji_tag: profileData.emoji_tag,
            };
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('✅ [Init] User profile fetched from API');
          } catch (profileError) {
            console.error('❌ [Init] Failed to fetch user profile:', profileError);
            // If profile fetch fails, try to use stored user data as fallback
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
              console.log('⚠️ [Init] Using cached user data');
            } else {
              clearAuth();
            }
          }
        } else {
          // Access token is expired, try to refresh
          // console.log("Access token expired, attempting refresh...");
          if (currentRefreshToken) {
            try {
              const refreshResponse = await api.post('/auth/jwt/refresh/', { refresh: currentRefreshToken });
              const newAccessToken = refreshResponse.data.access;
              // Djoser's refresh might also return a new refresh token if ROTATE_REFRESH_TOKENS is True
              const newRefreshToken = refreshResponse.data.refresh || currentRefreshToken; 

              localStorage.setItem('tokens', JSON.stringify({ access: newAccessToken, refresh: newRefreshToken }));
              
              const newDecodedAccessToken = jwtDecode(newAccessToken);
              // Assuming user data doesn't change on refresh, otherwise re-fetch or update user
              const storedUser = localStorage.getItem('user'); 
              if (storedUser) {
                 // Optionally, verify if user ID in new token matches stored user
                const userObj = JSON.parse(storedUser);
                if (userObj.id === newDecodedAccessToken.user_id) {
                    setUser(userObj);
                } else {
                    // Mismatch, clear and force re-login or fetch new user data
                    console.warn("User ID mismatch after token refresh. Clearing auth.");
                    clearAuth();
                    setLoading(false);
                    return;
                }
              } else {
                // If no user stored, but token refreshed, this is an edge case.
                // Might need to fetch user details based on new token or clear.
                // For now, if user was not in local storage, we might not set it.
                // Or, if your token contains enough info, decode and set user.
                // This part depends on how much info is in your JWT and if user object is critical.
                // For simplicity, if user was not in local storage, we might clear auth.
                console.warn("No user in local storage after token refresh. Clearing auth.");
                clearAuth();
                setLoading(false);
                return;
              }
              
              setTokens({ access: newAccessToken, refresh: newRefreshToken });
              api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
              // console.log("Token refreshed successfully.");
            } catch (refreshError) {
              // console.error('Failed to refresh token:', refreshError);
              clearAuth(); // Refresh failed, clear auth
            }
          } else {
            // console.log("No refresh token available. Clearing auth.");
            clearAuth(); // No refresh token, clear auth
          }
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, []); // Removed router from dependencies as it's stable

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (userData, access, refresh) => {
    // Store tokens first
    localStorage.setItem('tokens', JSON.stringify({ access, refresh }));
    
    // ALSO store access token in cookie (for server-side)
    document.cookie = `access_token=${access}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    console.log('🍪 [Login] Cookie set:', `access_token=${access.substring(0, 20)}...`);
    
    setTokens({ access, refresh });
    api.defaults.headers.Authorization = `Bearer ${access}`;
    
    // Fetch fresh profile data from API instead of using login response
    try {
      const profileResponse = await api.get('/profiles/me/');
      const profileData = profileResponse.data;
      
      // Transform profile data to user object
      const freshUserData = {
        id: profileData.user.id,
        email: profileData.user.email,
        username: profileData.user.username,
        name: profileData.user.first_name,
        picture: profileData.profile_pic_url || profileData.img_google_url,
        is_staff: profileData.user.is_staff,
        is_superuser: profileData.user.is_superuser,
        bio: profileData.bio,
        emoji_tag: profileData.emoji_tag,
      };
      
      localStorage.setItem('user', JSON.stringify(freshUserData));
      setUser(freshUserData);
      console.log('✅ [Login] User profile fetched from API');
    } catch (error) {
      console.error('❌ [Login] Failed to fetch profile, using login data:', error);
      // Fallback to login response data
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const logout = () => {
    clearAuth();
    router.push('/login');
  };
  
  const refreshUserProfile = async () => {
    if (!tokens?.access) {
      console.warn('⚠️ [RefreshProfile] No access token available');
      return;
    }
    
    try {
      const profileResponse = await api.get('/profiles/me/');
      const profileData = profileResponse.data;
      
      const userData = {
        id: profileData.user.id,
        email: profileData.user.email,
        username: profileData.user.username,
        name: profileData.user.first_name,
        picture: profileData.profile_pic_url || profileData.img_google_url,
        is_staff: profileData.user.is_staff,
        is_superuser: profileData.user.is_superuser,
        bio: profileData.bio,
        emoji_tag: profileData.emoji_tag,
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      console.log('✅ [RefreshProfile] User profile refreshed');
      return userData;
    } catch (error) {
      console.error('❌ [RefreshProfile] Failed to refresh profile:', error);
      throw error;
    }
  };
  
  const clearAuth = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    
    // ALSO remove the cookie
    document.cookie = 'access_token=; path=/; max-age=0';
    console.log('🍪 [Logout] Cookie cleared');
    
    setUser(null);
    setTokens(null);
    delete api.defaults.headers.Authorization;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      tokens, 
      login, 
      logout, 
      refreshUserProfile, 
      loading, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
