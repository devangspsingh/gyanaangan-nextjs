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

        AnalyticsService.trackPageView(url);
        lastTrackedPath.current = url;

    }, [pathname, searchParams]);

    return {
        trackEvent: AnalyticsService.trackEvent
    };
};

export default useAnalytics;
