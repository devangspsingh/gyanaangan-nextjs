"use client"
import React, { useState } from 'react';
import { X, AlertCircle, Mail, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';


const StickyNotification = ({ className }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Email Configuration
  const email = "gyanaangan.in@gmail.com";
  const subject = "Issue Report: Events Beta";
  const body = "I encountered an issue with the Events Beta...";

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
        //   initial={{ opacity: 0, y: -20, scale: 0.95 }}
        //   animate={{ opacity: 1, y: 0, scale: 1 }}
        //   exit={{ opacity: 0, y: -20, height: 0, marginBottom: 0 }}
        //   transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
          className={cn(
            "sticky top-16 z-50 w-auto left-0 right-0 mx-auto", // Positioning
            "md:ml-auto ", // Desktop specific alignment
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="md:rounded-b-full md:px-4 mx-auto max-w-4xl relative group overflow-hidden shadow-xl backdrop-blur-md border border-white/20">
            {/* Background with animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-violet-950 to-blue-950 opacity-95 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

            {/* Content Container */}
            <div className="relative flex sm:flex-row items-center justify-between p-1.5 pl-4 pr-2 gap-3 sm:gap-6">
              
              {/* Message Side */}
              <div className="flex items-center gap-3 text-white">
               
                <span className="font-medium text-sm tracking-wide text-orange-50">
                  Events are in <span className="font-bold text-white uppercase bg-orange-600/40 px-2 py-0.5 rounded text-xs tracking-wider border border-orange-400/30">Beta</span>
                </span>
              </div>

              {/* Action Side */}
              <div className="flex items-center gap-2 sm:w-auto justify-between sm:justify-end">
                {/* Contact Button */}
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-all duration-200 border border-white/10 hover:border-white/30 group/btn"
                >
                  <Mail size={14} />
                  <span>Report Issue</span>
                  <ArrowRight size={12} className="opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300" />
                </a>

                {/* Vertical Divider */}
                {/* <div className="h-6 w-px bg-white/20 mx-1 hidden sm:block" /> */}

                {/* Close Button */}
                {/* <button
                  onClick={() => setIsVisible(false)}
                  className="p-1.5 rounded-full hover:bg-black/20 text-white/70 hover:text-white transition-colors duration-200"
                  aria-label="Close notification"
                >
                  <X size={18} />
                </button> */}
              </div>
            </div>
            
          
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyNotification