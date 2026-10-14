import { SITE_URL, fetchSitemapData, buildUrlsetXml, xmlResponse } from '@/lib/sitemapHelper';

export const dynamic = 'force-dynamic';

export async function GET() {
  const resources = await fetchSitemapData('resources', '/resources/', {
    pageSize: 100,
    maxPages: 100,
    concurrency: 8,
  });

  const routes = resources
    .filter((r) => r && r.slug)
    .map((resource) => ({
      url: `${SITE_URL}/resources/${resource.slug}`,
      lastModified: resource.updated_at || resource.updated_at_iso || new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  const xml = buildUrlsetXml(routes);
  return xmlResponse(xml, 3600);
}
