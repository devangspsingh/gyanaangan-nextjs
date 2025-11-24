'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import LoginDialog from './Auth/LoginDialog';
import { GoogleLogin } from '@react-oauth/google';
import api from '../lib/axiosInstance';
import { cn } from '@/lib/utils';

// Shadcn UI Imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import {
  HomeIcon,
  BookmarkIcon,
  ShareIcon,
  BellIcon,
  UserCircleIcon,
  CalendarIcon,
  BuildingLibraryIcon,
  AcademicCapIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  BellIcon as BellSolidIcon,
  UserCircleIcon as UserCircleSolidIcon,
  CalendarIcon as CalendarSolidIcon,
  BuildingLibraryIcon as BuildingLibrarySolidIcon,
} from '@heroicons/react/24/solid';

const Footer = () => {
  const { user, isAuthenticated, login: setAuthState, logout } = useAuth();
  const { hasUnread: hasUnreadNotifications, refreshNotifications } = useNotification();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginRedirectPath, setLoginRedirectPath] = useState('/');

  useEffect(() => {
    refreshNotifications();
  }, [pathname, refreshNotifications]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Error sharing');
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
      href: '/profile/saved',
      label: 'Saved',
      icon: BookmarkIcon,
      activeIcon: BookmarkSolidIcon,
      authRequired: true,
    },
    {
      label: 'Share',
      action: handleShare,
      icon: ShareIcon,
      activeIcon: ShareIcon,
    },
    {
      href: '/profile/notifications',
      label: 'Notifications',
      icon: BellIcon,
      activeIcon: BellSolidIcon,
      showIndicator: hasUnreadNotifications,
    },
    // Desktop Only Items
    {
      href: '/event',
      label: 'Events',
      icon: CalendarIcon,
      activeIcon: CalendarSolidIcon,
      desktopOnly: true,
    },
    {
      href: '/organization',
      label: 'Organization',
      icon: BuildingLibraryIcon,
      activeIcon: BuildingLibrarySolidIcon,
      desktopOnly: true,
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
      router.push(loginRedirectPath || '/profile');
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  const renderNavItems = (isDesktop = false) =>
    navItems.map((item) => {
      // Filter out desktop-only items on mobile
      if (!isDesktop && item.desktopOnly) return null;

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
      };

      const commonProps = {
        className: cn(
          "flex flex-col items-center p-2 rounded-md transition-colors duration-200 ease-in-out",
          isActive ? "text-primary" : "text-gray-400 hover:text-primary-light",
          isDesktop && "w-full justify-start"
        ),
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
      return (
        <button type="button" {...commonProps} key={listItemKey+1}>
          {iconElement}
          {isDesktop && <span key={item.label+4} className="mt-1 text-xs">{item.label}</span>}
        </button>
      );
    });

  const profileHref = isAuthenticated ? '/profile' : '#';
  const isProfileActive = pathname.startsWith('/profile') || (!isAuthenticated && pathname === '/login');
  const ProfileIconComponent = isProfileActive ? UserCircleSolidIcon : UserCircleIcon;

  const handleProfileClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setLoginRedirectPath('/profile');
      setIsLoginModalOpen(true);
    }
    // If authenticated, the DropdownMenuTrigger handles the click automatically
  };

  // Shared Profile Button UI to reuse in both Mobile/Desktop triggers
  const ProfileButtonContent = ({ isDesktop }) => (
    <div 
      className={cn(
        "relative flex flex-col items-center p-2 rounded-md transition-colors cursor-pointer",
        isProfileActive ? "text-primary" : "text-gray-400 hover:text-primary-light",
        isDesktop && "w-full"
      )}
    >
      {isAuthenticated && user?.picture ? (
        <img src={user.picture} alt="Profile" className={cn("rounded-full", isDesktop ? "w-8 h-8" : "w-6 h-6")} />
      ) : (
        <ProfileIconComponent className={cn(isDesktop ? "w-8 h-8" : "w-6 h-6")} />
      )}
      {!isAuthenticated && (
        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-1 ring-gray-900 bg-primary animate-pulse" />
      )}
      {isDesktop && <span className="mt-1 text-xs">Profile</span>}
    </div>
  );

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
          </div>
        </LoginDialog>
      )}

      {/* Mobile Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur-md border-t border-gray-700/50 text-white flex justify-around items-center p-2 shadow-lg md:hidden z-40">
        {renderNavItems(false)}
        
        {/* Mobile Profile Button with Shadcn Dropdown */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none">
                <ProfileButtonContent isDesktop={false} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="bg-gray-900 border-gray-800 text-gray-200">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-gray-500">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-800" />
              
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer flex items-center gap-2 focus:bg-gray-800 focus:text-white">
                  <UserIcon className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/event/my-registrations" className="cursor-pointer flex items-center gap-2 focus:bg-gray-800 focus:text-white">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>My Events (Beta)</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-gray-800" />
              {/* <DropdownMenuItem onClick={logout} className="text-red-400 focus:text-red-300 focus:bg-gray-800 cursor-pointer">
                Log out
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button onClick={handleProfileClick}>
             <ProfileButtonContent isDesktop={false} />
          </button>
        )}
      </footer>

      {/* Desktop Left Sidebar */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-theme(space.16))] bg-gray-950/10 backdrop-blur-sm border-r border-gray-700/50 text-white hidden md:flex flex-col items-center justify-center space-y-4 p-3 shadow-lg z-40 w-20">
        <div className="flex flex-col items-center space-y-4 w-full">
          {renderNavItems(true)}
        </div>
        
        <div className="mt-auto mb-4 w-full flex justify-center"> 
          {/* Desktop Profile Button with Shadcn Dropdown */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="outline-none w-full">
                  <ProfileButtonContent isDesktop={true} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56 bg-gray-900 border-gray-800 text-gray-200 ml-2">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{user?.name || 'User'}</p>
                    <p className="text-xs leading-none text-gray-500">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer flex items-center gap-2 focus:bg-gray-800 focus:text-white">
                    <UserIcon className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/event/my-registrations" className="cursor-pointer flex items-center gap-2 focus:bg-gray-800 focus:text-white">
                    <AcademicCapIcon className="w-4 h-4" />
                    <span>My Registrations</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem onClick={logout} className="text-red-400 focus:text-red-300 focus:bg-gray-800 cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button onClick={handleProfileClick} className="w-full">
               <ProfileButtonContent isDesktop={true} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Footer;