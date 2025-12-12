"use client"

/**
 * AdUnit Component - Supports multiple ad types
 * 
 * Types:
 * - 'display': Standard display ad with fixed sizes
 * - 'horizontal': Wide horizontal ad for sticky footer (auto responsive)
 * - 'multiplex': Multiplex ads for native content
 * - 'in-feed': In-feed ads that blend with content
 */
export const AdUnit = ({
  'data-ad-client': dataAdClient = "ca-pub-3792754105959046",
  'data-ad-slot': dataAdSlot = "1937256059",
  type = "display", // display, horizontal, multiplex, in-feed
  style = { display: 'block' },
  className = ""
}) => {
  // Ad configurations based on type
  const adConfigs = {
    display: {
      className: `adsbygoogle w-[320px] h-[100px] min-[500px]:w-[468px] min-[500px]:h-[60px] min-[800px]:w-[728px] min-[800px]:h-[90px]`,
      style: { display: 'block' },
      format: null,
      responsive: false
    },
    horizontal: {
      className: 'adsbygoogle',
      style: { display: 'block', width: '100%' },
      format: 'horizontal',
      responsive: true
    },
    multiplex: {
      className: 'adsbygoogle',
      style: { display: 'block' },
      format: 'autorelaxed',
      responsive: false
    },
    'in-feed': {
      className: 'adsbygoogle',
      style: { display: 'block' },
      format: 'fluid',
      layout: 'in-article',
      responsive: false
    }
  };

  const config = adConfigs[type] || adConfigs.display;

  return (
    <ins
      className={`${config.className} ${className}`}
      style={{ ...config.style, ...style }}
      data-ad-client={dataAdClient}
      data-ad-slot={dataAdSlot}
      {...(config.format && { 'data-ad-format': config.format })}
      {...(config.responsive && { 'data-full-width-responsive': 'true' })}
      {...(config.layout && { 'data-ad-layout': config.layout })}
    ></ins>
  );
};