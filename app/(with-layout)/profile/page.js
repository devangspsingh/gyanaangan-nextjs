'use client';

import { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Adjust path
import { useTheme } from '../../../context/ThemeContext'; // Adjust path
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import toast from 'react-hot-toast';
import Link from 'next/link'; // Import Link
import StudentProfileForm from '@/components/StudentProfileForm';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; // Import shadcn Breadcrumb components

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        Loading profile...
      </div>
    );
  }

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
    toast.success('Theme updated!');
  };
  
  const handleLogout = () => {
    logout(); // This should internally clear user state and tokens
    toast.success('Logged out successfully.');
    router.push('/'); 
  };


  return (
    <>
      <Head>
        <title>{user.name || user.username}&apos;s Profile - Gyan Aangan</title>
        <meta name="description" content={`Manage your profile and preferences on Gyan Aangan.`} />
      </Head>
      <main className="container mx-auto px-4 text-gray-100 py-8"> {/* Added py-8 for consistency */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{user.name || user.username}&apos;s Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-2xl mx-auto shadow-xl bg-primary-dark/20 backdrop-blur-sm rounded-lg p-2">
          <div className="flex flex-col items-center mb-8">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name || user.username}
                className="w-32 h-32 rounded-full mb-4 border-4 border-primary"
              />
            )}
            <h2 className="text-3xl font-semibold text-white">{user.name || user.username}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>

          <div className="space-y-6">
            {/* Student Profile Section */}
            <div>
              {/* <h3 className="text-xl font-semibold text-white mb-3">Academic Profile</h3> */}
              {/* <div className="bg-stone-700/50 rounded-md"> */}
                <StudentProfileForm />
              {/* </div> */}
            </div>

            {user.profile?.bio && ( // Assuming bio might come from user.profile if you extend AuthContext user object
                <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Bio</h3>
                    <p className="text-gray-300 bg-stone-700 p-4 rounded-md">{user.profile.bio}</p>
                </div>
            )}

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Theme Preference</h3>
              <div className="bg-stone-700 p-4 rounded-md">
                <label htmlFor="theme-select" className="block text-sm font-medium text-gray-300 mb-2">
                  Select Background Theme:
                </label>
                <select
                  id="theme-select"
                  value={currentTheme}
                  onChange={handleThemeChange}
                  className="block w-full p-3 text-sm text-gray-200 bg-stone-600 border border-gray-500 rounded-md focus:ring-primary focus:border-primary"
                >
                  {availableThemes.map((themeOpt) => (
                    <option key={themeOpt.file} value={themeOpt.file}>
                      {themeOpt.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  Your selected theme will be applied across the site. This preference is saved in your browser.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
                {/* Admin Dashboard Button - Only shown for admin/staff users */}
                {(user.is_staff || user.is_superuser) && (
                  <Link 
                    href="/admin" 
                    className="block w-full text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Admin
                  </Link>
                )}
                {(user.is_staff || user.is_superuser) && (
                  <Link 
                    href="https://api.gyanaangan.in/admin" 
                    className="block w-full text-center px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Admin Old
                  </Link>
                )}
                
                <Link href="/profile/saved" className="block w-full text-center px-6 py-3 border border-primary text-primary-light rounded-md hover:bg-primary hover:text-white transition-colors duration-200">
                    View Subscriptions & Saved Resources
                </Link>
                {/* Add other profile links here if needed */}
            </div>


            <div className="mt-8 border-t border-gray-700 pt-6">
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-stone-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
