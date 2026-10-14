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
          '/event/',
          '/organization/',
             ],
      },
    //   // Explicitly block API subdomain
    //   {
    //     userAgent: '*',
    //     disallow: '/',
    //     // This rule applies to api.gyanaangan.in if crawlers check it
    //   },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/sitemap-blogs.xml`,
      `${SITE_URL}/sitemap-resources.xml`,
      `${SITE_URL}/sitemap-courses.xml`,
      `${SITE_URL}/sitemap-subjects.xml`,
      `${SITE_URL}/sitemap-static.xml`,
    ],
  };
}
