import { Inter, Barlow, Roboto_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers';
import '@/app/globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const barlow = Barlow({ weight: ['600', '700', '800'], subsets: ['latin'], variable: '--font-barlow', display: 'swap' });
const roboto_mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono', display: 'swap' });

export const metadata = {
  metadataBase: new URL('https://gyanaangan.in'),
  title: 'Gyan Aangan | Explore courses, resources, and subjects....',
  description: 'Explore a variety of courses and resources to enhance your knowledge at Gyan Aangan.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable} ${roboto_mono.variable}`}>
      <body className="bg-[#010717] text-white">
        <Providers>
          {children}
        </Providers>
        {process.env.NEXT_PUBLIC_DEV ? null : (
          <GoogleAnalytics gaId="G-P37HBDS10M" />
        )}
      </body>
    </html>
  );
}
