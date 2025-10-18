"use client"

export const AdUnit = ({
  'data-ad-client': dataAdClient = "ca-pub-3792754105959046",
  'data-ad-slot': dataAdSlot = "1937256059",
  'data-ad-format': dataAdFormat = 'auto',
  'data-full-width-responsive': dataFullWidthResponsive = true,
  style = { display: 'block', margin: '20px 0' }
}) => {
  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client={dataAdClient}
      data-ad-slot={dataAdSlot}
      data-ad-format={dataAdFormat}
      data-full-width-responsive={dataFullWidthResponsive}
    ></ins>
  );
};