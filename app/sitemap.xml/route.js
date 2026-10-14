import { SITE_URL, buildSitemapIndexXml, xmlResponse, getLatestSectionTimestamps } from '@/lib/sitemapHelper';

export const revalidate = 86400;

export async function GET() {
  const timestamps = await getLatestSectionTimestamps();

  const sitemaps = [
    {
      url: `${SITE_URL}/sitemap-static.xml`,
      lastModified: timestamps.static,
    },
    {
      url: `${SITE_URL}/sitemap-courses.xml`,
      lastModified: timestamps.courses,
    },
    {
      url: `${SITE_URL}/sitemap-subjects.xml`,
      lastModified: timestamps.subjects,
    },
    {
      url: `${SITE_URL}/sitemap-blogs.xml`,
      lastModified: timestamps.blogs,
    },
    {
      url: `${SITE_URL}/sitemap-resources.xml`,
      lastModified: timestamps.resources,
    },
  ];

  const xml = buildSitemapIndexXml(sitemaps);
  return xmlResponse(xml, 86400);
}
