import { SITE_URL, buildUrlsetXml, xmlResponse } from '@/lib/sitemapHelper';

export const revalidate = 86400;

// Fixed baseline dates so static sitemap lastmod never randomly changes on page loads
const STATIC_PAGE_DATE = '2026-10-01T00:00:00.000Z';
const ACTIVE_SECTION_DATE = '2026-10-14T00:00:00.000Z';

export async function GET() {
  const staticRoutes = [
    {
      url: `${SITE_URL}`,
      lastModified: ACTIVE_SECTION_DATE,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: STATIC_PAGE_DATE,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/courses`,
      lastModified: ACTIVE_SECTION_DATE,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/subjects`,
      lastModified: ACTIVE_SECTION_DATE,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/resources`,
      lastModified: ACTIVE_SECTION_DATE,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: ACTIVE_SECTION_DATE,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: STATIC_PAGE_DATE,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: STATIC_PAGE_DATE,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms-and-conditions`,
      lastModified: STATIC_PAGE_DATE,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const xml = buildUrlsetXml(staticRoutes);
  return xmlResponse(xml, 86400);
}
