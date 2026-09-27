"use client";

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import AnalyticsService from '../services/analyticsService';

export const useAnalytics = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastTrackedPath = useRef(null);

    useEffect(() => {
        const url = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

        // Avoid duplicate tracking if strict mode causes double mount or rapid updates
        if (lastTrackedPath.current === url) return;

        lastTrackedPath.current = url;

        // Defer tracking to browser idle time so main thread is 100% free for FCP and LCP
        const track = () => {
            AnalyticsService.trackPageView(url);
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            window.requestIdleCallback(track, { timeout: 3500 });
        } else {
            setTimeout(track, 2000);
        }
    }, [pathname, searchParams]);

    return {
        trackEvent: AnalyticsService.trackEvent
    };
};

export default useAnalytics;
