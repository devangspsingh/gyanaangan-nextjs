
import Image from 'next/image';

export default function BannerContent({ banner }) {
  const desktopImage = banner.image_url;
  const mobileImage = banner.mobile_image_url || banner.image_url;
  const hasMobileImage = banner.mobile_image_url && banner.mobile_image_url !== banner.image_url;

  return (
    <div className="relative w-full h-full">
      {/* Desktop Image - hidden on mobile, only loads on md+ screens */}
      <div className="hidden md:block relative w-full h-full">
        <Image
          src={desktopImage}
          alt={banner.description || banner.title || 'Banner'}
          fill
          sizes="100vw"
          className="object-cover"
          priority
          quality={85}
        />
      </div>

      {/* Mobile Image - hidden on desktop, only loads on small screens */}
      <div className="block md:hidden relative w-full h-full">
        <Image
          src={mobileImage}
          alt={banner.description || banner.title || 'Banner'}
          fill
          sizes="100vw"
          className="object-cover"
          priority
          quality={85}
        />
      </div>
    </div>
  );
}
