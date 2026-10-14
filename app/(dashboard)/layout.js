import DynamicBackground from '@/app/dynamicBackgroud';
import './dashboard.css';
import StickyNotification from '@/components/mine/ui/StickyNotification';

export const metadata = {
  metadataBase: new URL('https://gyanaangan.in'),
  title: 'Gyan Aangan | Explore courses, resources, and subjects....',
  description: 'Explore a variety of courses and resources to enhance your knowledge at Gyan Aangan.',
};

export default function DashboardLayout({ children }) {
  return (
    <>
      <DynamicBackground />
      <StickyNotification />
      {children}
    </>
  );
}
