
export default function BannerContent({ banner, isMobile }) {
  // Use mobile image on mobile if available, otherwise use desktop image
  const imageUrl = isMobile && banner.mobile_image_url 
    ? banner.mobile_image_url 
    : banner.image_url;
  
  const aspectRatio = isMobile && banner.mobile_image_url 
    ? '1600/648' 
    : '1600/324';

  return (
    <div className="relative w-full h-full">
      <img
        src={imageUrl}
        alt={banner.description || banner.title}
        className="w-full h-full object-cover"
        style={{ aspectRatio }}
      />

      {/* Overlay Text (if link_text exists) */}
      {/* {banner.link_text && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-4 sm:pb-6 md:pb-8">
          <div className="text-center px-4">
            {banner.description && (
              <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-medium mb-2 md:mb-3 drop-shadow-lg">
                {banner.description}
              </p>
            )}
            <span className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-primary hover:bg-primary-light text-primary-dark text-sm sm:text-base font-bold rounded-lg transition-colors shadow-lg">
              {banner.link_text}
            </span>
          </div>
        </div>
      )} */}
    </div>
  );
}
