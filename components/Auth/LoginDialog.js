'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LockKeyholeIcon, SparklesIcon, SaveIcon, PaletteIcon, TrendingUpIcon } from 'lucide-react';

// Extracted content to be reusable for both page and modal views
const LoginDialogContentInner = ({ title, description, children, showBenefits, onExplicitClose, isPage }) => {
  return (
    <div className={`bg-stone-800 text-gray-100 ${isPage ? 'w-full max-w-[480px] mx-auto rounded-lg shadow-xl border border-stone-700' : ''}`}>
      <div className="p-6">
        {isPage ? (
          // Custom header for page view (no Dialog context)
          <div className="mb-4 text-center sm:text-left"> {/* Mimicking DialogHeader structure */}
            <h2 className="text-2xl font-semibold leading-none tracking-tight flex items-center justify-center sm:justify-start"> {/* Mimicking DialogTitle */}
              <LockKeyholeIcon className="w-7 h-7 mr-2 text-primary" /> {title}
            </h2>
            {description && (
              <p className="text-sm text-muted-foreground pt-2 text-gray-400"> {/* Mimicking DialogDescription */}
                {description}
              </p>
            )}
          </div>
        ) : (
          // Standard DialogHeader for modal view
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl">
              <LockKeyholeIcon className="w-7 h-7 mr-2 text-primary" /> {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="pt-2 text-gray-400">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        
        <div className="py-6">
          {children} {/* Login mechanism (e.g., GoogleLogin button) goes here */}
        </div>

        {!isPage && onExplicitClose && (
          <DialogFooter className="sm:justify-end px-6 pb-0 pt-2">
            <Button variant="outline" onClick={onExplicitClose}>Close</Button>
          </DialogFooter>
        )}
      </div>

      {showBenefits && (
        <div className={`p-6 border-t border-stone-700 ${isPage ? 'bg-stone-850/50 rounded-b-lg' : 'bg-stone-850/50'}`}>
          <p className="text-sm font-medium text-gray-200 mb-3 text-center">Why Log In?</p>
          <ul className="space-y-2 text-xs text-gray-400 max-w-xs mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <li className="flex items-center">
              <SparklesIcon className="w-4 h-4 mr-2 text-yellow-400 flex-shrink-0" /> Unlock all features.
            </li>
            <li className="flex items-center">
              <SaveIcon className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" /> Save your resources.
            </li>
            <li className="flex items-center">
              <PaletteIcon className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" /> Customize your theme.
            </li>
            <li className="flex items-center">
              <TrendingUpIcon className="w-4 h-4 mr-2 text-purple-400 flex-shrink-0" /> Priority course demand.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};


export default function LoginDialog({
  isOpen: controlledIsOpen,
  onOpenChange,
  children,
  title = "Login to Gyan Aangan",
  description = "Sign in to unlock exclusive features, save your progress, and personalize your learning experience.",
  showBenefits = true,
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
      <DialogContent className="sm:max-w-[480px] bg-transparent border-none p-0 shadow-none">
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
