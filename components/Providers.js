'use client';

import { AuthProvider } from '../context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../context/ThemeContext';
import { NotificationProvider } from '../context/NotificationContext'; // Import NotificationProvider

export function Providers({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error("Google Client ID is not configured.");
    // Potentially render an error message or a fallback UI
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId || ""}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider> {/* Add NotificationProvider here */}
            {children}
            <Toaster position="top-right" />
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
