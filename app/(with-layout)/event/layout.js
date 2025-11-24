import StickyNotification from "@/components/mine/ui/StickyNotification";

export default function RootLayout({ children }) {
  return (

    <>

      <StickyNotification />
      <div className='h-10'></div>
      {children}
    </>

  );
}
