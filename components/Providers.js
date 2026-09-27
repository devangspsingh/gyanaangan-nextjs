'use client';

import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { NotificationProvider } from '../context/NotificationContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider> {/* Add NotificationProvider here */}
          {children}
          <Toaster position="top-right" />
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
