// app/components/AdContainer.js
"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const AdContainer = ({ children }) => {
    const pathname = usePathname();

    // The `useEffect` hook with `pathname` in the dependency array
    // will re-run this logic every time the user navigates to a new page.
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, [pathname]);

    // The `key={pathname}` is the most important part.
    // It tells React to re-create the component when the URL changes,
    // which is crucial for the ad to re-load.
    return (
        <div className='bg-slate-900 rounded-lg' key={pathname}>
            <div className='p-1 text-xs text-bold text-center mx-auto'>Advertisement</div>
            {children}
        </div>
    );
};