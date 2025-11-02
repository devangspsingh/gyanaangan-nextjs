'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext'; // Import useNotification
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import LoginDialog from './Auth/LoginDialog';
import { GoogleLogin } from '@react-oauth/google';
import api from '../lib/axiosInstance';

import {
  HomeIcon,
  BookmarkIcon,
  ShareIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  BellIcon as BellSolidIcon,
  UserCircleIcon as UserCircleSolidIcon,
} from '@heroicons/react/24/solid';

const Footer = () => {
  const { user, isAuthenticated, login: setAuthState } = useAuth();
  const { hasUnread: hasUnreadNotifications, refreshNotifications } = useNotification(); // Use context
  const pathname = usePathname();
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginRedirectPath, setLoginRedirectPath] = useState('/');
  // const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false); // Removed, comes from context

  useEffect(() => {
    // Refresh notifications when path changes, as user might have navigated and read them
    // or new ones might have arrived.
    refreshNotifications();
  }, [pathname, refreshNotifications]);


  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
        // toast.success('Shared successfully!'); // Usually, the browser handles feedback
      } catch (error) {
        if (error.name !== 'AbortError') { // AbortError means user cancelled the share
          toast.error('Error sharing');
          console.error('Error sharing:', error);
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const navItems = [
    { href: '/', label: 'Home', icon: HomeIcon, activeIcon: HomeSolidIcon },
    {
      href: '/profile/saved', // Example path, adjust as needed
      label: 'Saved',
      icon: BookmarkIcon,
      activeIcon: BookmarkSolidIcon,
      authRequired: true,
    },
    {
      label: 'Share',
      action: handleShare,
      icon: ShareIcon,
      activeIcon: ShareIcon, // No separate active state for action
    },
    {
      href: '/profile/notifications',
      label: 'Notifications',
      icon: BellIcon,
      activeIcon: BellSolidIcon,
      // authRequired: true, // Notifications page is now public
      showIndicator: hasUnreadNotifications,
    },
  ];

  const handleGoogleLoginSuccessForModal = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      if (!idToken) {
        toast.error("Google login failed: No ID token received.");
        return;
      }
      const backendResponse = await api.post('/auth/google/', { id_token: idToken });
      const { user: loggedInUser, access, refresh } = backendResponse.data;
      setAuthState(loggedInUser, access, refresh);
      toast.success('Logged in successfully!');
      setIsLoginModalOpen(false);
      router.push(loginRedirectPath || '/profile'); // Redirect after login
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  const renderNavItems = (isDesktop = false) =>
    navItems.map((item) => {
      const isActive = item.href && pathname === item.href;
      const Icon = isActive ? item.activeIcon : item.icon;

      const handleClick = (e) => {
        if (item.action) {
          e.preventDefault();
          item.action();
        } else if (item.authRequired && !isAuthenticated) {
          e.preventDefault();
          setLoginRedirectPath(item.href || pathname);
          setIsLoginModalOpen(true);
        }
        // Navigation will proceed for Links if not prevented
      };

      const commonProps = {
        className: `flex flex-col items-center p-2 rounded-md transition-colors duration-200 ease-in-out ${
          isActive ? 'text-primary' : 'text-gray-400 hover:text-primary-light'
        } ${isDesktop ? 'w-full justify-start' : ''}`,
        onClick: handleClick,
      };

      const listItemKey = item.label;

      const iconElement = (
        <div key={item.label} className="relative">
          <Icon className="w-6 h-6" /> 
          {item.showIndicator && ( 
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary ring-1 ring-offset-1 ring-offset-current ring-gray-900" />
          )}
        </div>
      );

      if (item.href && (!item.authRequired || isAuthenticated)) {
        return (
          <Link href={item.href} {...commonProps} key={listItemKey}>
            {iconElement}
            {isDesktop && <span key={item.label+2} className="mt-1 text-xs">{item.label}</span>} 
          </Link>
        );
      }
      // For actions or auth-required links when not authenticated (will be handled by onClick)
      return (
        <button type="button" {...commonProps} key={listItemKey+1}>
          {iconElement}
          {isDesktop && <span key={item.label+4} className="mt-1 text-xs">{item.label}</span>}
        </button>
      );
    });

  const profileHref = isAuthenticated ? '/profile' : '#';
  const isProfileActive = pathname.startsWith('/profile') || (!isAuthenticated && pathname === '/login'); // login page active state might need review
  const ProfileIconComponent = isProfileActive ? UserCircleSolidIcon : UserCircleIcon;

  const handleProfileClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setLoginRedirectPath('/profile'); // Default redirect for profile
      setIsLoginModalOpen(true);
    } else {
      router.push('/profile'); // Navigate if authenticated
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
          redirectTo={loginRedirectPath}
        >
          <div className="flex flex-col items-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccessForModal}
              onError={() => toast.error('Google login failed. Please try again.')}
              theme="outline"
              shape="rectangular"
              size='large'
              width="100%"
            />

             {/* <div className="text-center">
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
              </div> */}
          </div>
        </LoginDialog>
      )}
      {/* Mobile Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-950/10 backdrop-blur-md border-t border-gray-700/50 text-white flex justify-around items-center p-2 shadow-lg md:hidden z-40">
        {renderNavItems()}
        <button // Changed Link to button to handle click logic
          onClick={handleProfileClick}
          className={`relative flex flex-col items-center p-2 rounded-md transition-colors ${
            isProfileActive ? 'text-primary' : 'text-gray-400 hover:text-primary-light'
          }`}
        >
          {isAuthenticated && user?.picture ? (
            <img src={user.picture} alt="Profile" className="w-6 h-6 rounded-full" />
          ) : (
            <ProfileIconComponent className="w-6 h-6" />
          )}
          {!isAuthenticated && (
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-1 ring-gray-900 bg-primary animate-pulse" />
          )}
        </button>
      </footer>

      {/* Desktop Right Sidebar */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-theme(space.16))] bg-gray-950/10 backdrop-blur-sm border-r border-gray-700/50 text-white hidden md:flex flex-col items-center justify-center space-y-4 p-3 shadow-lg z-40 w-20">
        <div className="flex flex-col items-center space-y-4">
          {renderNavItems(true)}
        </div>
        <div className="mt-auto mb-4"> {/* Pushes profile icon to bottom of its group */}
          <button // Changed Link to button
            onClick={handleProfileClick}
            className={`relative flex flex-col items-center p-2 rounded-md transition-colors ${
              isProfileActive ? 'text-primary' : 'text-gray-400 hover:text-primary-light'
            }`}
            title="Profile"
          >
            {isAuthenticated && user?.picture ? (
              <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full" />
            ) : (
              <ProfileIconComponent className="w-8 h-8" />
            )}
            {!isAuthenticated && (
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full ring-1 ring-gray-900 bg-primary animate-pulse" />
            )}
             <span className="mt-1 text-xs">Profile</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Footer;
