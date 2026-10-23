import { Inter, Barlow, Roboto_Mono } from 'next/font/google';
import { Providers } from '../../components/Providers'; // Adjust path
import '@/app/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer'; // Import the Footer component
import FooterNavigation from '@/components/FooterNavigation'; // Import the new FooterNavigation component
import ProfileCompleteAlert from '@/components/ProfileCompleteAlert'; // Import ProfileCompleteAlert
import DynamicBackground from '../dynamicBackgroud';

export const metadata = {
  metadataBase: new URL('https://gyanaangan.in'),
  title: 'Gyan Aangan | Explore courses, resources, and subjects....',
  description: 'Explore a variety of courses and resources to enhance your knowledge at Gyan Aangan.',
}

import { GoogleAnalytics } from '@next/third-parties/google';

// After (in files like layout.js)
// import AdSenseComponent from '@/components/blog/AdSenseComponent';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const barlow = Barlow({ weight: ['700'], subsets: ['latin'], variable: '--font-barlow', display: 'swap' });
const roboto_mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono', display: 'swap' });
import { Suspense } from 'react';
import AnalyticsTracker from '@/components/AnalyticsTracker'; // Import AnalyticsTracker
import GoogleAdSenseLoader from '@/components/Ads/GoogleAdSenseLoader';
import LoginNudge from '@/components/Auth/LoginNudge'; // Import LoginNudge
import StickyAd from '@/components/Ads/stickyAds';
import StickyNotification from '@/components/mine/ui/StickyNotification';

export default function WithLayout({ children }) {
  return (
    <>
      <DynamicBackground />
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      <GoogleAdSenseLoader />
      <Suspense fallback={null}>
        <LoginNudge />
      </Suspense>
      <Header />
      <StickyNotification />
      <div className="relative container-app pt-16 pb-20 md:pb-0 md:pl-20 max-w-screen-xl mx-auto min-h-[calc(100vh-theme(space.16))]">
        {children}
      </div>

      <div className="printable-message hidden">
        <p>🚫 Oops! This page does not like printers. 😊<br />Please enjoy it online!</p>
      </div>
      <Footer />
      <StickyAd />
      <ProfileCompleteAlert />
      <FooterNavigation />
    </>
  );
}
