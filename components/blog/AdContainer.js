"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const AdContainer = ({ children }) => {
    const pathname = usePathname();

    useEffect(() => {
        try {
            // Check if window exists to prevent server-side errors
            if (typeof window !== 'undefined') {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, [pathname]);

    return (
        <div 
            className='bg-slate-900 rounded-lg overflow-hidden my-6 min-h-[100px]' 
            key={pathname} // <--- This forces the refresh
        >
            <div className='text-[10px] text-gray-500 uppercase tracking-widest text-center py-1'>
                Advertisement
            </div>
            <div className='flex justify-center items-center'>
                {children}
            </div>
        </div>
    );
};