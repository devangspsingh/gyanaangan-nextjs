'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdUnit } from '@/components/blog/AdUnit';

export default function StickyAd() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();

  // Check for desktop screen size to prevent AdSense errors on mobile (availableWidth=0)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768); // 768px is standard md breakpoint
    //   setIsDesktop(true); // 768px is standard md breakpoint
    };
    
    // Initial check
    checkScreenSize();
    
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Reset visibility to TRUE whenever the user navigates to a new page
  useEffect(() => {
    setIsVisible(true);
  }, [pathname]);

  // Trigger the AdSense push command whenever the path changes (after render)
  useEffect(() => {
    if (isVisible && isDesktop) {
      try {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }, 100);
      } catch (err) {
        console.error('AdSense push error:', err);
      }
    }
  }, [pathname, isVisible, isDesktop]);

  // Don't render anything if closed or not on desktop
  if (!isVisible || !isDesktop) return null;

  return (
    // FIXED HEIGHT WRAPPER
    <div className="fixed left-0 right-0 bottom-0 z-30 h-24 overflow-hidden">
      
      {/* Visual Container - Compact with strict height limit */}
      <div className="relative mx-auto w-full h-24 border-t border-slate-800/50 bg-slate-950/95 backdrop-blur-sm overflow-hidden">
        
        {/* Close Button - More subtle */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-1 right-2 text-gray-500 hover:text-red-400 text-xs transition-colors z-10"
          aria-label="Close Ad"
        >
          ✕
        </button>

        {/* Ad Area - key={pathname} forces a complete re-render on route change */}
        <div 
          key={pathname} 
          className="flex justify-center items-center h-24 overflow-hidden"
        >
          {/* Horizontal ad unit - Wrapper with strict height control */}
          <div className="w-full h-full flex items-center justify-center">
            <AdUnit 
              type="horizontal"
              data-ad-slot="3516444227"
              style={{ display: 'inline', width: '728px', maxHeight: '90px' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}