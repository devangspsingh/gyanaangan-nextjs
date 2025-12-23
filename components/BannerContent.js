'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function BannerContent({ banner }) {
  const desktopImage = banner.image_url;
  const mobileImage = banner.mobile_image_url || banner.image_url;
  const hasMobileImage = banner.mobile_image_url && banner.mobile_image_url !== banner.image_url;



  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative w-full h-full">
      <Image
        src={isMobile ? mobileImage : desktopImage}
        alt={banner.description || banner.title || 'Banner'}
        fill
        sizes="100vw"
        className="object-cover"
        priority
        quality={85}
      />
    </div>
  );
}
