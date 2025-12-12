'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdUnit } from '@/components/blog/AdUnit';

export default function StickyAd() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  // 2. Reset visibility to TRUE whenever the user navigates to a new page
  useEffect(() => {
    setIsVisible(true);
  }, [pathname]);

  // 3. Trigger the AdSense push command whenever the path changes (after render)
  useEffect(() => {
    if (isVisible) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense push error:', err);
      }
    }
  }, [pathname, isVisible]);

  if (!isVisible) return null;

  return (
    // CONTAINER WRAPPER
    // Mobile: bottom-[64px] (Sits above your footer nav which is roughly 60px height)
    // Desktop: bottom-0 (Sits at the very bottom since nav is on the left)
    <div className="fixed left-0 right-0 z-30 transition-all duration-300 ease-in-out bottom-[56px] md:bottom-0">
      
      {/* Visual Container */}
      <div className="relative mx-auto w-full max-w-7xl border-t border-slate-800 bg-slate-950 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute -top-6 right-0 md:right-4 bg-slate-950 text-white-600 px-3 py-1 text-xs font-bold rounded-t-md hover:bg-red-500 hover:text-white transition-colors shadow-sm"
          aria-label="Close Ad"
        >
        X
        </button>

            <div 
              key={pathname} 
              className="flex justify-center items-center min-h-[60px] md:min-h-[90px] overflow-hidden bg-slate-950"
            >
              {/* We wrap the AdUnit to control width/height explicitly if needed */}
              <div className="w-full text-center">
                <AdUnit 
                  data-ad-slot="1937256059"
                  data-ad-format="horizontal"
                />
               style={{ display: 'inline-block', width: '100%', maxWidth: '970px', height: 'auto', minHeight: '50px' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}