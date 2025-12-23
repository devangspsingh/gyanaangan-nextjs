
import { getImageProps } from 'next/image';

export default function BannerContent({ banner }) {
  const desktopImage = banner.image_url;
  const mobileImage = banner.mobile_image_url || banner.image_url;
  const altText = banner.description || banner.title || 'Banner';

  // Use getImageProps for art direction - browser only downloads the matching image
  const common = { 
    alt: altText, 
    sizes: '100vw',
    quality: 85,
    priority: true,
  };

  const {
    props: { srcSet: desktopSrcSet, src: desktopSrc, ...desktopRest },
  } = getImageProps({ 
    ...common, 
    width: 1600, 
    height: 324, 
    src: desktopImage 
  });

  const {
    props: { srcSet: mobileSrcSet, src: mobileSrc, ...mobileRest },
  } = getImageProps({ 
    ...common, 
    width: 1600, 
    height: 648, 
    src: mobileImage 
  });

  return (
    <div className="relative w-full h-full">
      <picture>
        {/* Desktop image - loads only on md+ screens */}
        <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
        {/* Mobile image - loads only on smaller screens */}
        <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
        <img
          src={desktopSrc}
          alt={altText}
          className="w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
    </div>
  );
}
