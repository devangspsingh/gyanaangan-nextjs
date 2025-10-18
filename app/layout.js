import { Inter, Roboto_Mono } from 'next/font/google';
import { Providers } from '../components/Providers'; // Adjust path
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer'; // Import the Footer component
import FooterNavigation from '@/components/FooterNavigation'; // Import the new FooterNavigation component
import DynamicBackground from './dynamicBackgroud';
export const metadata = {
  title: 'Gyan Aangan | Explore courses, resources, and subjects....',
  description: 'Explore a variety of courses and resources to enhance your knowledge at Gyan Aangan.',
}

// After (in files like layout.js)
// import AdSenseComponent from '@/components/blog/AdSenseComponent';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const roboto_mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono', display: 'swap' });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto_mono.variable}`}>
      <head>
        {/* <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3792754105959046`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        /> */}
        <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
      crossOrigin="anonymous"
    ></script>
      </head>

      <body className="bg-[#010717]">
        <Providers>
          <DynamicBackground /> {/* Use the client component for dynamic background */}
          <Header />
          {/* <GoogleAdSense publisherId="ca-pub-3792754105959046" /> */}
          {/* <AdSenseComponent/> */}
          <div className="container-app pt-16 pb-20 md:pb-0 md:pl-20 max-w-screen-xl mx-auto min-h-[calc(100vh-theme(space.16))]">

            {children}
          </div>

          <div className="printable-message hidden">
            <p>🚫 Oops! This page does not like printers. 😊<br />Please enjoy it online!</p>
          </div>
          <Footer />
          <FooterNavigation />
        </Providers>
      </body>
    </html>
  );
}
