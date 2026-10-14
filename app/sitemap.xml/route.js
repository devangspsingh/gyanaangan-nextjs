import { SITE_URL, buildSitemapIndexXml, xmlResponse } from '@/lib/sitemapHelper';

export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date().toISOString();

  const sitemaps = [
    {
      url: `${SITE_URL}/sitemap-static.xml`,
      lastModified: now,
    },
    {
      url: `${SITE_URL}/sitemap-courses.xml`,
      lastModified: now,
    },
    {
      url: `${SITE_URL}/sitemap-subjects.xml`,
      lastModified: now,
    },
    {
      url: `${SITE_URL}/sitemap-blogs.xml`,
      lastModified: now,
    },
    {
      url: `${SITE_URL}/sitemap-resources.xml`,
      lastModified: now,
    },
  ];

  const xml = buildSitemapIndexXml(sitemaps);
  return xmlResponse(xml, 3600);
}
