'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AdUnit } from '@/components/blog/AdUnit';
import { trackEvent } from '@/services/analyticsService';

// IP Watermark Component
const IPWatermark = () => {
  const [ip, setIp] = useState('Fetching IP...');
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp('IP N/A'));
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
      <p className="text-stone-500/20 text-4xl md:text-6xl font-bold transform -rotate-12 select-none whitespace-nowrap">
        Gyan Aangan
      </p>
      <p className="absolute bottom-2 right-2 md:bottom-5 md:right-5 text-stone-500/30 text-xl md:text-2xl font-mono select-none px-2 py-1 rounded">
        {ip}
      </p>
    </div>
  );
};

// Internal Iframe Component
const DocsIframe = ({ viewerUrl, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setIframeKey(0);
    setRetryCount(0);
    setIsLoading(true);
  }, [viewerUrl]);

  useEffect(() => {
    let timer;
    if (isLoading && retryCount < 4) {
      timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setIframeKey((prev) => prev + 1);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isLoading, retryCount, iframeKey]);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-800 z-20 backdrop-blur-sm">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 border-r-purple-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-pink-400 animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <p className="text-gray-200 font-semibold text-lg">Loading Document...</p>
          {retryCount > 3 && (
            <p className="text-sm text-gray-400 mt-3 animate-pulse">
              Taking longer than expected... (Retrying {retryCount}/4)
            </p>
          )}
        </div>
      )}
      <iframe
        key={iframeKey}
        src={viewerUrl}
        title="Google Docs PDF Viewer"
        frameBorder="0"
        className={`${className} transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => setIsLoading(false)}
      ></iframe>
      <IPWatermark />
    </div>
  );
};

// Google Docs Viewer Component
const GoogleDocsViewer = ({ resourceViewUrl, resource }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  // States: 'mobile' (<768), 'mid' (768-1280), 'large' (>=1280)
  const [screenSize, setScreenSize] = useState('mobile');

  // Intelligent resize handler
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setScreenSize('large');
      } else if (width >= 768) {
        setScreenSize('mid');
      } else {
        setScreenSize('mobile');
      }
    };

    // Initial check
    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle AdSense push based on visible slots
  useEffect(() => {
    if (isFullScreen) {
      const pushAds = () => {
        try {
          // Determine how many ads are visible based on screen size
          let adsToPush = 0;
          if (screenSize === 'mobile') adsToPush = 1;      // Bottom ad
          else if (screenSize === 'mid') adsToPush = 1;    // Right ad
          else if (screenSize === 'large') adsToPush = 2;  // Left + Right ads

          if (window.adsbygoogle) {
            for (let i = 0; i < adsToPush; i++) {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
          }
        } catch (e) {
          console.error("AdSense push error:", e);
        }
      };

      // Slight delay to ensure Dialog DOM is fully mounted
      const timer = setTimeout(pushAds, 500);
      return () => clearTimeout(timer);
    }
  }, [isFullScreen, screenSize]);

  if (!resourceViewUrl) {
    return <p className="text-center text-gray-400 py-10">Google Viewer: Resource URL not available.</p>;
  }

  let viewerUrl = resourceViewUrl;
  if (!resourceViewUrl.startsWith("https://drive.google.com")) {
    viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(resourceViewUrl)}&embedded=true`;
  }

  return (
    <div className="aspect-w-16 aspect-h-9 bg-stone-800 rounded-lg overflow-hidden md:min-h-[90vh] min-h-[80vh] relative group">
      {/* Default Inline View */}
      <DocsIframe viewerUrl={viewerUrl} className="w-full h-full min-h-[80vh] md:min-h-[90vh]" />

      {/* Full Screen Trigger */}
      <div className="absolute top-4 right-4 z-30 transition-opacity duration-300">
        <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
          <DialogTrigger asChild>
            <button
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all transform hover:scale-110"
              title="Full Screen View"
              onClick={() => {
                if (resource) {
                  trackEvent('click', {
                    resource_name: resource.name,
                    click_target: "Full Screen Viewer",
                    resource_slug: resource.slug
                  }, resource.slug);
                }
              }}
            >
              <ArrowsPointingOutIcon className="w-5 h-5" />
            </button>
          </DialogTrigger>

          <DialogContent className="max-w-[100vw] w-screen p-0 bg-stone-900 border-none rounded-none overflow-hidden [&>[data-slot=dialog-close]]:hidden">
            <DialogTitle className="sr-only">Full Screen PDF Viewer</DialogTitle>

            {/* Full Screen Layout Wrapper 
              Using h-[100dvh] for mobile browser compatibility (address bar)
            */}
            <div className="!w-screen !h-screen flex flex-col md:flex-row">

              {/* Left Ad - Only for Large Screens (>1280px) */}
              {screenSize === 'large' && (
                <div className="hidden xl:flex !w-[300px] !min-w-[300px] !max-w-[300px] h-full flex-col justify-center items-center bg-stone-950 border-r border-stone-800 shrink-0 z-40 overflow-hidden relative">
                  <div className="text-stone-500 text-xs mb-4 uppercase tracking-wider">Advertisement</div>
                  <div className="!w-[300px] !min-w-[300px] !max-w-[300px] h-full overflow-hidden flex items-center justify-center">
                    <AdUnit type="vertical" data-ad-slot="3516444227" />
                  </div>
                </div>
              )}

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col h-screen! relative min-w-0 bg-stone-900">

                {/* Close Button - Overlay */}
                <div className="absolute top-4 right-4 z-50">
                  <DialogClose className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all hover:rotate-90 shadow-lg">
                    <XMarkIcon className="w-6 h-6" />
                  </DialogClose>
                </div>

                {/* Iframe Container 
                  flex-1 + min-h-0 is CRITICAL here. 
                  It forces the container to take exactly the remaining height 
                  and allows the child absolute iframe to fill it. 
                */}
                <div className="relative w-full min-h-90vh h-[calc(100vh-90px)] md:h-screen">
                  <DocsIframe viewerUrl={viewerUrl} className={"h-full! md:h-screen w-full"} />
                </div>

                {/* Mobile Bottom Ad - Only for Mobile (<768px) 
                   - Added !h-[90px] !max-h-[90px] !min-h-[90px] to enforce strict height
                   - Added overflow-hidden to clip any expanding content
                   - Added z-index to ensure it sits on top if needed
                */}
                {screenSize === 'mobile' && (
                  <div
                  // className="!h-[90px] !max-h-[90px] !min-h-[90px] bg-stone-950 flex items-center justify-center shrink-0 border-t border-stone-800 !w-full z-40 overflow-hidden relative"
                  // style={{ height: '90px', maxHeight: '90px', minHeight: '90px', width: '100%' }} // Inline styles as backup
                  >
                    <div className="relative w-full h-full max-h-22.5! flex items-center justify-center overflow-hidden">
                      <AdUnit
                        type="horizontal"
                        data-ad-slot="3516444227"
                        style={{ display: 'inline', width: '728px', maxHeight: '90px' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Ad - For Mid (768px+) and Large Screens */}
              {(screenSize === 'mid' || screenSize === 'large') && (
                <div className="hidden md:flex !w-[300px] !min-w-[300px] !max-w-[300px] h-full flex-col justify-center items-center bg-stone-950 border-l border-stone-800 shrink-0 z-40 overflow-hidden relative">
                  <div className="text-stone-500 text-xs mb-4 uppercase tracking-wider">Advertisement</div>
                  <div className="!w-[300px] !min-w-[300px] !max-w-[300px] h-full overflow-hidden flex items-center justify-center">
                    <AdUnit type="vertical" data-ad-slot="3516444227" />
                  </div>
                </div>
              )}

            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default function Viewer({ resource }) {
  if (!resource || !resource.privacy?.includes('view')) {
    return <p className="text-center text-gray-400 py-10">Preview not available for this resource.</p>;
  }

  const canView = resource.privacy?.includes('view');
  let primaryViewer = null;

  // Priority 1: File upload
  if (resource.file && resource.view_url && resource.resource_type !== 'video' && canView) {
    primaryViewer = (
      <section className="mb-8 relative">
        <h2 className="text-xl font-semibold text-white mb-3">Preview</h2>
        <GoogleDocsViewer resourceViewUrl={resource.view_url} resource={resource} />
      </section>
    );
  }
  // Priority 2: YouTube embed
  else if (resource.resource_type === 'video' && resource.embed_link && canView) {
    primaryViewer = (
      <section className="mb-8 relative">
        <h2 className="text-xl font-semibold text-white mb-3">Video Preview</h2>
        <div className="aspect-video bg-stone-800 rounded-lg overflow-hidden shadow">
          <iframe
            src={resource.embed_link}
            title={resource.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </section>
    );
  }
  // Priority 3: External Link
  else if (resource.resource_link && canView) {
    primaryViewer = (
      <section className="mb-8 relative">
        <h2 className="text-xl font-semibold text-white mb-3">Preview</h2>
        <GoogleDocsViewer resourceViewUrl={resource.resource_link} resource={resource} />
      </section>
    );
  }

  if (primaryViewer || resource.content) {
    return (
      <>
        {primaryViewer}
        {resource.content && canView && (
          <section className="mb-8">
            <article
              className="prose prose-invert prose-sm lg:prose-lg max-w-none bg-slate-950 rounded-lg"
              dangerouslySetInnerHTML={{ __html: resource.content }}
            />
          </section>
        )}
      </>
    );
  }

  if (canView) {
    return <p className="text-center text-gray-400 py-10">Preview for this resource type is not currently supported, but viewing is permitted.</p>;
  }

  return <p className="text-center text-gray-400 py-10">No preview available.</p>;
}