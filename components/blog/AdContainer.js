"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const AdContainer = ({ children }) => {
    const pathname = usePathname();

    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                // Trigger the ad request after the component mounts/updates
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, [pathname]);

    return (
        <div 
            className='bg-slate-900/50 rounded-lg overflow-hidden my-6 flex justify-center items-center' 
            key={pathname}
        >
            <div className='relative w-full flex flex-col items-center p-4'>
                <div className='text-[10px] text-gray-400 uppercase tracking-widest mb-2'>
                    Advertisement
                </div>
                {/* We do NOT enforce width here. 
                   We let the child (AdUnit) define its exact pixel width via CSS/Tailwind 
                */}
                {children}
            </div>
        </div>
    );
};