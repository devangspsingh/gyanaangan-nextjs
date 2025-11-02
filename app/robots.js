const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.in';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/login',
          '/profile/',
          '/_next/',
          '/static/',
          '/api.gyanaangan.in', // Disallow API subdomain
        ],
      },
    //   // Explicitly block API subdomain
    //   {
    //     userAgent: '*',
    //     disallow: '/',
    //     // This rule applies to api.gyanaangan.in if crawlers check it
    //   },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL, // Specify the primary domain
  };
}
