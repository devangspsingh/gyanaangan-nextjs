'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext'; // Adjust path
import { useRouter, useSearchParams, redirect as nextRedirect } from 'next/navigation'; // Renamed redirect to nextRedirect
import api from '../../lib/axiosInstance'; // Adjust path
import { useEffect, Suspense } from 'react'; // Added Suspense
import toast from 'react-hot-toast';
import LoginDialog from '../../components/Auth/LoginDialog'; // Import the LoginDialog
import Link from 'next/link';
function LoginPageContent() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  // const router = useRouter(); // Not strictly needed if only using nextRedirect
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      let nextUrl = searchParams.get('next');
      // If nextUrl is not present, is the login page itself, or an invalid internal redirect, default to profile.
      if (!nextUrl || nextUrl === '/login' || nextUrl.startsWith('/login?')) {
        nextUrl = '/profile';
      }
      nextRedirect(nextUrl);
    }
  }, [isAuthenticated, authLoading, searchParams]); // router removed as nextRedirect is stable

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      if (!idToken) {
        toast.error("Google login failed: No ID token received.");
        return;
      }

      const backendResponse = await api.post('/auth/google/', {
        id_token: idToken,
      });

      const { user, access, refresh } = backendResponse.data;
      login(user, access, refresh); // This should update isAuthenticated
      toast.success('Logged in successfully!');
      
      // Redirection is handled by the useEffect above once isAuthenticated becomes true
      // Or, you can redirect explicitly here if preferred:
      // const nextUrl = searchParams.get('next') || '/profile';
      // router.push(nextUrl);

    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Loading authentication status...</div>;
  }

  // If already authenticated, useEffect will redirect. Show minimal content or null.
  if (isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Redirecting...</div>;
  }

  return (
    <div className="flex h-full items-center justify-center p-4"> {/* Ensure this div takes height if needed */}
      <LoginDialog
        isPage={true} // Indicates it's the primary content of the /login route
        title="Welcome to Gyan Aangan"
        description="Sign in with Google to continue."
      >
        <div className="flex flex-col items-center space-y-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.error('Google Login Failed');
              toast.error('Google login failed. Please try again.');
            }}
            theme="outline"
            shape="rectangular"
            size="large"
            // className=""
            // width="300px" // Adjust width as needed or make it responsive
          />
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <Link href="/terms-and-conditions" className="text-primary-light hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-primary-light hover:underline">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
      </LoginDialog>
    </div>
  );
}

export default function LoginPage() {
  return (
    // Suspense is needed because LoginPageContent uses useSearchParams
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Loading Login Page...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
