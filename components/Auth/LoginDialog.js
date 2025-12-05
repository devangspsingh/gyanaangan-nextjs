'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Extracted content to be reusable for both page and modal views
const LoginDialogContentInner = ({ title, description, children, showBenefits, onExplicitClose, isPage }) => {
  return (
    // Applied your radial gradient class
    <div className={`rounded-3xl card-gradient-radial text-gray-100 ${isPage ? 'w-full max-w-[480px] mx-auto rounded-lg shadow-xl border border-stone-700' : ''}`}>
      <div className="px-4 py-8 md:p-8 sm:p-10">

        {/* --- 1. Logo and Brand Name (Moved to top) --- */}
        <div className="mb-6 flex flex-col items-center content-center justify-center">
          <img
            className="h-22 w-auto" // Adjusted size
            src="/images/logo white.png" // Assuming this is the tree/book logo
            alt="Gyan Aangan Logo"
          />
          <div className="self-center text-2xl font-semibold whitespace-nowrap text-white">
            GyanAangan {/* Added space, removed font-mono */}
          </div>
        </div>

        {/* --- 2. Title and Description (Centered) --- */}
        {isPage ? (
          // Custom header for page view (no Dialog context)
          <div className="mb-4 text-center"> {/* Mimicking DialogHeader, forced text-center */}
            <h2 className="text-primary! text-3xl font-bold leading-none tracking-tight"> {/* Mimicking DialogTitle, removed icon, adjusted style */}
              {title}
            </h2>
            {description && (
              <p className="text-base text-gray-300 pt-3 max-w-sm mx-auto"> {/* Mimicking DialogDescription, adjusted style */}
                {description}
              </p>
            )}
          </div>
        ) : (
          // Standard DialogHeader for modal view
          <DialogHeader className="text-center space-y-0">
            <DialogTitle className="flex items-center justify-center text-3xl font-bold text-primary-second"> {/* Removed icon, adjusted style */}
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-center text-base text-gray-300 max-w-sm mx-auto"> {/* Adjusted style */}
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        {/* --- 3. Login Button (Passed as children) --- */}
        <div className="pt-6 pb-2">
          {children} {/* Login mechanism (e.g., GoogleLogin button) goes here */}
        </div>

        {/* --- 4. Close Button (for Modal) --- */}
        {/* {!isPage && onExplicitClose && (
          <DialogFooter className="sm:justify-center px-6 pb-0 pt-2">
            <Button variant="outline" onClick={onExplicitClose}>Close</Button>
          </DialogFooter>
        )} */}
      </div>

      {/* Benefits section is hidden by default based on showBenefits prop */}
      {showBenefits && (
        <div className={`p-6 border-t border-stone-700 ${isPage ? 'bg-stone-850/50 rounded-b-lg' : 'bg-stone-850/50'}`}>
          <p className="text-sm font-medium text-gray-200 mb-3 text-center">Why Log In?</p>
          {/* ... benefits list items ... */}
        </div>
      )}
    </div>
  );
};


export default function LoginDialog({
  isOpen: controlledIsOpen,
  onOpenChange,
  children,
  // Updated default props to match the image
  title = "Unlock Full Features",
  description = "By logging in, you can save resources, subscribe to courses and subjects, receive personalized reminders, and more!",
  showBenefits = false, // Set to false by default
  isPage = false,
  redirectTo // For modal usage, to pass where to redirect after login
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

  // If it's a page, render content directly without Dialog wrapper
  if (isPage) {
    return (
      <LoginDialogContentInner
        title={title}
        description={description}
        showBenefits={showBenefits}
        isPage={true}
      >
        {children}
      </LoginDialogContentInner>
    );
  }

  // If it's a modal, use the Dialog component
  return (
    <Dialog open={currentOpen} onOpenChange={currentOnOpenChange}>
      <DialogContent
        className={`bg-transparent border-none p-0 ${
          // If forced, use typical modal size but ensure it cannot be closed interaction-wise (handled by onOpenChange)
          // User requested "full screen non closeable". 
          // We can make it larger or centered. Shadcn Dialog is already centered.
          // Let's rely on the backdrop and removing close button.
          // If purely full screen content is desired: "w-screen h-screen max-w-none rounded-none"
          // usage: isForced ? "w-screen h-screen max-w-none rounded-none flex items-center justify-center" : "sm:max-w-[480px]"
          // But looking at "LoginDialogContentInner", it has rounded corners. 
          // Let's stick to the card design but make it very prominent.
          "sm:max-w-[480px]"
          }`}
        // Hide close button if forced (requires Shadcn override or css)
        // Usually [&>button]:hidden in regular css or class
        hideCloseButton={controlledIsOpen === true && onOpenChange && !isPage} // Heuristic or pass explicit prop
      >
        {/* DialogContent is made transparent, actual styling is in LoginDialogContentInner */}
        <LoginDialogContentInner
          title={title}
          description={description}
          // eslint-disable-next-line react/no-children-prop
          children={children}
          showBenefits={showBenefits}
          onExplicitClose={() => currentOnOpenChange(false)}
          isPage={false}
        />
      </DialogContent>
    </Dialog>
  );
}
