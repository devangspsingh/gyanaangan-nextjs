import { Inter, Roboto_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers'; // Adjust path
import '../globals.css';
import DynamicBackground from '@/app/dynamicBackgroud';
import './dashboard.css'
export const metadata = {
  metadataBase: new URL('https://gyanaangan.in'),
  title: 'Gyan Aangan | Explore courses, resources, and subjects....',
  description: 'Explore a variety of courses and resources to enhance your knowledge at Gyan Aangan.',
}

import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script';

// After (in files like layout.js)
// import AdSenseComponent from '@/components/blog/AdSenseComponent';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const roboto_mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono', display: 'swap' });



export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto_mono.variable}`}>
    

      <body className="bg-[#010717]">
        <Providers>
          
            {children}
         
        </Providers>
      </body>
      <GoogleAnalytics gaId="G-P37HBDS10M" />
    </html>
  );
}
