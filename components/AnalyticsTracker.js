"use client";

import { Suspense } from 'react';
import useAnalytics from '@/hooks/useAnalytics';

function AnalyticsTrackerInner() {
    useAnalytics();
    return null;
}

export default function AnalyticsTracker() {
    return (
        <Suspense fallback={null}>
            <AnalyticsTrackerInner />
        </Suspense>
    );
}
