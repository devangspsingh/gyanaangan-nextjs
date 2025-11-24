'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';

const navigation = [
  { name: 'Subjects', href: '/subjects' },
  { name: 'Resources', href: '/resources' },
  { name: 'Courses', href: '/courses' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
  { name: 'Events', href: '/event', mobileOnly: true }, // Added mobileOnly flag
  { name: 'Organizations', href: '/organization', mobileOnly: true }, // Added mobileOnly flag
];

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const navigateToSearchPage = () => {
    router.push('/search');
  };

  return (
    <nav className="bg-gray-950/10 backdrop-blur-sm fixed top-0 w-full z-30 border-b border-gray-700/50">
      <div className="mx-auto max-w-screen-xl px-2 sm:px-4 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
            {/* Mobile menu button using Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="bg-gray-950/90 backdrop-blur-sm text-gray-300 border-r border-gray-700/50 w-[280px] p-6 pt-10"
              >
                <SheetHeader><SheetTitle className="text-gray-200">Menu</SheetTitle></SheetHeader>
                <div className="space-y-1">
                  {/* Mobile Menu renders ALL items (Events & Org included) */}
                  {navigation.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        href={item.href}
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                  
                  <SheetClose asChild>
                    <button
                      onClick={navigateToSearchPage}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-300 hover:bg-gray-700 hover:text-primary-light"
                    >
                      <MagnifyingGlassIcon className="h-5 w-5" />
                      Search
                    </button>
                  </SheetClose>
                  
                  {/* My Certificates remains in Mobile Menu */}
                  {/* {isAuthenticated && (
                    <SheetClose asChild>
                      <Link
                        href="/event/my-registrations"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
                      >
                        My Certificates
                      </Link>
                    </SheetClose>
                  )} */}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
            <Link href="/" className="flex flex-shrink-0 items-center">
              <img
                className="h-10 w-auto"
                src="/images/logo white.png"
                alt="Gyan Aangan Logo"
              />
              <span className="ml-2 self-center font-mono text-xl font-semibold whitespace-nowrap text-white">
                GyanAangan
              </span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {/* Desktop Menu: Filters out items with mobileOnly: true */}
              {navigation.map((item) => (
                !item.mobileOnly && (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>
          </div>
          
          <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2 md:static md:inset-auto md:ml-6 md:pr-0">
            
            <button
              onClick={navigateToSearchPage}
              title="Search"
              className="p-2 text-gray-300 hover:text-primary-light focus:outline-none"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
              <span className="sr-only">Search</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}