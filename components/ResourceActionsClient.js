'use client';

import { useState, useEffect } from 'react';
import { toggleSaveResource } from '@/services/apiService';
import toast from 'react-hot-toast';
import { BookmarkIcon as BookmarkOutlineIcon, ShareIcon, ArrowDownIcon as DownloadIconHero } from 'lucide-react';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/context/AuthContext';
import LoginDialog from '@/components/Auth/LoginDialog';
import { GoogleLogin } from '@react-oauth/google';
import api_client from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ResourceActionsClient({ resource }) {
  const { isAuthenticated, login: setAuthState } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentIsSaved, setCurrentIsSaved] = useState(resource?.is_saved || false);

  useEffect(() => {
    if (resource) {
      setCurrentIsSaved(resource.is_saved);
    }
  }, [resource, isAuthenticated]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!resource) return;

    setIsSaving(true);
    const response = await toggleSaveResource(resource.slug);
    if (!response.error) {
      setCurrentIsSaved(response.data.saved);
      toast.success(response.data.saved ? 'Resource saved!' : 'Resource unsaved.');
    } else {
      toast.error(response.data?.detail || 'Failed to update save status.');
    }
    setIsSaving(false);
  };

  const handleShare = async () => {
    if (navigator.share && resource) {
      try {
        await navigator.share({
          title: resource.name,
          text: resource.description || `Check out this resource: ${resource.name}`,
          url: window.location.href,
        });
      } catch (error) {
        if (error.name !== 'AbortError') toast.error('Error sharing');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      toast.error('Please login to download resources');
      return;
    }
    
    // If authenticated, open the download URL
    if (resource?.download_url) {
      window.open(resource.download_url, '_blank');
    }
  };

  const handleGoogleLoginSuccessForModal = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      const backendResponse = await api_client.post('/auth/google/', { id_token: idToken });
      const { user: loggedInUser, access, refresh } = backendResponse.data;
      setAuthState(loggedInUser, access, refresh);
      toast.success('Logged in successfully!');
      setIsLoginModalOpen(false);
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
          title="Unlock Full Features"
          description="By logging in, you can save resources, subscribe to courses and subjects, receive personalized reminders, and more!"
        >
          <div className="flex flex-col items-center space-y-4 p-4">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccessForModal}
              onError={() => toast.error('Google login failed.')}
              theme="outline"
              shape="rectangular"
            />
          </div>
        </LoginDialog>
      )}

      <div className="rounded-lg shadow">
        <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
        <div className="space-y-3">
          <Button
            onClick={handleSaveToggle}
            disabled={isSaving}
            variant="outline"
            className="w-full justify-start text-gray-200 hover:bg-stone-700 border-stone-600"
          >
            {currentIsSaved ? (
              <BookmarkSolidIcon className="w-5 h-5 mr-2 text-primary" />
            ) : (
              <BookmarkOutlineIcon className="w-5 h-5 mr-2" />
            )}
            {isSaving ? 'Saving...' : (currentIsSaved ? 'Unsave Resource' : 'Save Resource')}
          </Button>
          {console.log(resource)}
          {resource?.privacy?.includes('download') && (
            <Button 
              onClick={handleDownload}
              variant="outline" 
              className="w-full justify-start text-gray-200 hover:bg-stone-700 border-stone-600"
            >
              <DownloadIconHero className="w-5 h-5 mr-2" />
              Download
            </Button>
          )}
          
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full justify-start text-gray-200 hover:bg-stone-700 border-stone-600"
          >
            <ShareIcon className="w-5 h-5 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </>
  );
}
