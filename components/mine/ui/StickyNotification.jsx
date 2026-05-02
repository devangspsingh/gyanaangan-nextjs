'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const PAYMENT_BUTTON_URL = "https://razorpay.com/payment-button/pl_SkRvaNApeOAmRk/view/";
const RESET_AFTER_VIEWS = 3; // Re-show after 3 pages if dismissed

const StickyNotification = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // 1. Get current stats from localStorage
    const dismissedAt = parseInt(localStorage.getItem('support_dismissed_at') || '-1');
    const totalViews = parseInt(localStorage.getItem('support_total_views') || '0');
    
    // 2. Increment total page views
    const currentViews = totalViews + 1;
    localStorage.setItem('support_total_views', currentViews.toString());

    // 3. Logic to show:
    // Show if never dismissed OR if current views > (dismissed view + 3)
    const shouldShowAgain = dismissedAt === -1 || currentViews > (dismissedAt + RESET_AFTER_VIEWS);

    if (shouldShowAgain) {
      setIsVisible(true);
    }

    // 4. Scroll Direction Logic
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setIsScrollingUp(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsScrollingUp(false); // Scrolling Down
      } else {
        setIsScrollingUp(true); // Scrolling Up
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    
    // Store the EXACT page view number when they dismissed it
    const currentViews = localStorage.getItem('support_total_views');
    localStorage.setItem('support_dismissed_at', currentViews);
  };

  return (
    <AnimatePresence>
      {isVisible && isScrollingUp && (
        <motion.div
          className={cn("fixed bottom-16 z-[100] inset-x-4 md:inset-x-0 mx-auto max-w-lg", className)}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95, transition: { duration: 0.2 } }}
        >
          <a
            href={PAYMENT_BUTTON_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between overflow-hidden border border-white/20 bg-slate-950/95 p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-2xl md:rounded-full transition-all hover:bg-slate-900"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,146,60,0.15),transparent_70%)]" />
            
            <div className="relative flex items-center gap-3 pl-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white shadow-lg">
                <span className="text-lg font-bold">₹</span>
              </div>
              
              <div className="flex flex-col">
                <p className="text-[13px] font-semibold tracking-tight text-white">
                  Support GyanAangan
                </p>
                
              </div>
            </div>

            <div className="relative flex items-center gap-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/80 transition group-hover:bg-orange-500">
                <ArrowRight size={14} />
              </div>
              
              <div className="h-5 w-[1px] bg-white/10 mx-0.5" />

              <button
                onClick={handleDismiss}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/30 transition hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyNotification;