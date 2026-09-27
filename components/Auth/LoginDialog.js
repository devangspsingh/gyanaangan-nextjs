'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Extracted content to be reusable for both page and modal views
const LoginDialogContentInner = ({ title, description, children, showBenefits, onExplicitClose, isPage }) => {
  return (
    <div className={`rounded-3xl card-gradient-radial text-gray-100 ${isPage ? 'w-full max-w-[480px] mx-auto rounded-lg shadow-xl border border-stone-700' : ''}`}>
      <div className="px-4 py-8 md:p-8 sm:p-10">

        {/* --- 1. Logo and Brand Name (Moved to top) --- */}
        <div className="mb-6 flex flex-col items-center content-center justify-center">
          <Image
            src="/images/logo white.png"
            alt="Gyan Aangan Logo"
            width={88}
            height={88}
            className="h-22 w-auto"
          />
          <div className="self-center text-2xl font-semibold whitespace-nowrap text-white">
            GyanAangan
          </div>
        </div>

        {/* --- 2. Title and Description (Centered) --- */}
        {isPage ? (
          <div className="mb-4 text-center">
            <h2 className="text-primary! text-3xl font-bold leading-none tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-base text-gray-300 pt-3 max-w-sm mx-auto">
                {description}
              </p>
            )}
          </div>
        ) : (
          <DialogHeader className="text-center space-y-0">
            <DialogTitle className="flex items-center justify-center text-3xl font-bold text-primary-second">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-center text-base text-gray-300 max-w-sm mx-auto">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        {/* --- 3. Login Button (Passed as children) --- */}
        <div className="pt-6 pb-2">
          {children}
        </div>
      </div>

      {/* Benefits section is hidden by default based on showBenefits prop */}
      {showBenefits && (
        <div className={`p-6 border-t border-stone-700 ${isPage ? 'bg-stone-850/50 rounded-b-lg' : 'bg-stone-850/50'}`}>
          <p className="text-sm font-medium text-gray-200 mb-3 text-center">Why Log In?</p>
        </div>
      )}
    </div>
  );
};


export default function LoginDialog({
  isOpen: controlledIsOpen,
  onOpenChange,
  children,
  title = "Unlock Full Features",
  description = "By logging in, you can save resources, subscribe to courses and subjects, receive personalized reminders, and more!",
  showBenefits = false,
  isPage = false,
  redirectTo
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [internalOpen, setInternalOpen] = useState(isPage || controlledIsOpen === undefined ? true : controlledIsOpen);

  const currentOpen = typeof controlledIsOpen !== 'undefined' ? controlledIsOpen : internalOpen;

  const currentOnOpenChange = (openStatus) => {
    if (onOpenChange) {
      onOpenChange(openStatus);
    } else {
      setInternalOpen(openStatus);
    }

    if (isPage && !openStatus) {
      const nextUrl = searchParams.get('next') || redirectTo;
      if (nextUrl && !nextUrl.startsWith('/login')) {
        router.push(nextUrl);
      } else {
        router.push('/');
      }
    }
  };

  useEffect(() => {
    if (isPage && controlledIsOpen === undefined) {
      setInternalOpen(true);
    }
    if (!isPage && typeof controlledIsOpen !== 'undefined') {
      setInternalOpen(controlledIsOpen);
    }
  }, [isPage, controlledIsOpen]);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // If it's a page, render content directly with GoogleOAuthProvider
  if (isPage) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <LoginDialogContentInner
          title={title}
          description={description}
          showBenefits={showBenefits}
          isPage={true}
        >
          {children}
        </LoginDialogContentInner>
      </GoogleOAuthProvider>
    );
  }

  // If it's a modal, use the Dialog component and only mount GoogleOAuthProvider when open
  return (
    <Dialog open={currentOpen} onOpenChange={currentOnOpenChange}>
      <DialogContent
        className="bg-transparent border-none p-0 sm:max-w-[480px]"
        hideCloseButton={controlledIsOpen === true && onOpenChange && !isPage}
      >
        <GoogleOAuthProvider clientId={googleClientId}>
          <LoginDialogContentInner
            title={title}
            description={description}
            showBenefits={showBenefits}
            onExplicitClose={() => currentOnOpenChange(false)}
            isPage={false}
          >
            {children}
          </LoginDialogContentInner>
        </GoogleOAuthProvider>
      </DialogContent>
    </Dialog>
  );
}
