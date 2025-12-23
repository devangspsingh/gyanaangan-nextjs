'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { trackBannerClick } from '@/services/apiService';
import BannerContent from './BannerContent';

export default function BannerSlider({ banners: initialBanners }) {
  const [banners] = useState(initialBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide effect
  useEffect(() => {
    if (!banners.length || isPaused || !isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length, isPaused, isVisible]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleBannerClick = async (banner) => {
    await trackBannerClick(banner.id);
    // console.log(banner)
  };

//   const handleClose = () => {
//     setIsVisible(false);
//   };

  if (!isVisible || !banners.length) return null;

  const currentBanner = banners[currentIndex];
  
  // Determine aspect ratio based on screen size and available images
  const hasMobileImage = currentBanner?.mobile_image_url && currentBanner.mobile_image_url !== currentBanner.image_url;

  return (
    <div 
      className="relative w-full overflow-hidden rounded-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Content - Single render with responsive images handled in BannerContent */}
      <div className="relative w-full">
        {/* Desktop aspect ratio */}
        <div className="hidden md:block" style={{ aspectRatio: '1600/324' }}>
          {banners.map((banner, index) => (
            <div
              key={`banner-${banner.id}`}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {banner.link_url ? (
                <Link
                  href={banner.link_url}
                  onClick={() => handleBannerClick(banner)}
                  className="block w-full h-full"
                >
                  <BannerContent banner={banner} />
                </Link>
              ) : (
                <div className="block w-full h-full">
                  <BannerContent banner={banner} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile aspect ratio */}
        <div 
          className="block md:hidden" 
          style={{ aspectRatio: hasMobileImage ? '1600/600' : '1600/300' }}
        >
          {banners.map((banner, index) => (
            <div
              key={`banner-mobile-${banner.id}`}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {banner.link_url ? (
                <Link
                  href={banner.link_url}
                  onClick={() => handleBannerClick(banner)}
                  className="block w-full h-full"
                >
                  <BannerContent banner={banner} />
                </Link>
              ) : (
                <div className="block w-full h-full">
                  <BannerContent banner={banner} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              aria-label="Next banner"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
