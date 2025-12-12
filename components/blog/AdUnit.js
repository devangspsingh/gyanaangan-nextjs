"use client"

export const AdUnit = ({
  'data-ad-client': dataAdClient = "ca-pub-3792754105959046",
  'data-ad-slot': dataAdSlot = "1937256059",
  style = { display: 'block' } 
}) => {
  return (
    <ins
      className={`adsbygoogle 
        w-[320px] h-[100px] 
        min-[500px]:w-[468px] min-[500px]:h-[60px] 
        min-[800px]:w-[728px] min-[800px]:h-[90px]
      `}
      style={style}
      data-ad-client={dataAdClient}
      data-ad-slot={dataAdSlot}
      // We explicitly DO NOT include data-ad-format or data-full-width-responsive
      // because strict sizes are defined in the className above.
    ></ins>
  );
};