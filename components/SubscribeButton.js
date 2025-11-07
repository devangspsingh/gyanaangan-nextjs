'use client';

import { useState, useEffect } from 'react';
import { toggleSpecialPageSubscription } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginDialog from '@/components/Auth/LoginDialog';
import { GoogleLogin } from '@react-oauth/google';
import api from '@/lib/axiosInstance';

export default function SubscribeButton({ specialPageId, isSubscribed: initialIsSubscribed = false }) {
  const { isAuthenticated, login: setAuthState } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    setIsSubscribed(initialIsSubscribed);
  }, [initialIsSubscribed]);

  const handleSubscribeToggle = async () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await toggleSpecialPageSubscription(specialPageId);
      
      if (!response.error) {
        setIsSubscribed(response.data.subscribed);
        toast.success(response.data.message || (response.data.subscribed ? 'Subscribed successfully!' : 'Unsubscribed successfully!'));
      } else {
        toast.error(response.data?.error || 'Failed to update subscription');
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      const backendResponse = await api.post('/auth/google/', { id_token: idToken });
      const { user: loggedInUser, access, refresh } = backendResponse.data;
      setAuthState(loggedInUser, access, refresh);
      toast.success('Logged in successfully!');
      setIsLoginModalOpen(false);
      
      // Optionally trigger subscription after login
      // You can uncomment the line below if you want auto-subscribe after login
      // handleSubscribeToggle();
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Login failed.');
    }
  };

  return (
    <>
      {isLoginModalOpen && (
        <LoginDialog
          isOpen={isLoginModalOpen}
          onOpenChange={setIsLoginModalOpen}
          title="Login to Subscribe"
          description="Please login to subscribe to this course and receive updates about new resources and announcements."
        >
          <div className="flex flex-col items-center space-y-4 p-4">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => toast.error('Google login failed.')}
              theme="outline"
              shape="rectangular"
            />
          </div>
        </LoginDialog>
      )}

      <Button
        onClick={handleSubscribeToggle}
        disabled={isLoading}
        variant={isSubscribed ? "default" : "outline"}
        className={`gap-2 ${isSubscribed ? 'bg-primary text-primary-foreground' : ''}`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
            <span>Processing...</span>
          </>
        ) : isSubscribed ? (
          <>
            <BellOff className="w-4 h-4" />
            <span>Unsubscribe</span>
          </>
        ) : (
          <>
            <Bell className="w-4 h-4" />
            <span>Subscribe</span>
          </>
        )}
      </Button>
    </>
  );
}
