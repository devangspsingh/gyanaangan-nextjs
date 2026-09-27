'use client';

import { useEffect } from 'react';

/**
 * High-performance, non-blocking Google AdSense Loader.
 * - Prevents the "AdSense head tag doesn't support data-nscript attribute" warning by creating a native clean <script> element.
 * - Defers loading until user interaction (scroll, touch, move) or idle time (requestIdleCallback) to protect Core Web Vitals (FCP, LCP, TBT).
 */
export default function GoogleAdSenseLoader() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if AdSense is already loaded
    if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
      return;
    }

    let loaded = false;

    const loadScript = () => {
      if (loaded) return;
      loaded = true;

      // Clean up event listeners
      window.removeEventListener('scroll', loadScript);
      window.removeEventListener('mousemove', loadScript);
      window.removeEventListener('touchstart', loadScript);
      window.removeEventListener('keydown', loadScript);

      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3792754105959046';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    };

    // Trigger on first user interaction for instant monetization
    window.addEventListener('scroll', loadScript, { passive: true, once: true });
    window.addEventListener('mousemove', loadScript, { passive: true, once: true });
    window.addEventListener('touchstart', loadScript, { passive: true, once: true });
    window.addEventListener('keydown', loadScript, { passive: true, once: true });

    // Fallback: load during idle time if user remains inactive
    let idleId;
    let timerId;
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(loadScript, { timeout: 5000 });
    } else {
      timerId = setTimeout(loadScript, 4500);
    }

    return () => {
      window.removeEventListener('scroll', loadScript);
      window.removeEventListener('mousemove', loadScript);
      window.removeEventListener('touchstart', loadScript);
      window.removeEventListener('keydown', loadScript);
      if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  return null;
}
