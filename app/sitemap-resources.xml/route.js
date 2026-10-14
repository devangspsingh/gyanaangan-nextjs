import { SITE_URL, fetchSitemapData, buildUrlsetXml, xmlResponse } from '@/lib/sitemapHelper';

export const revalidate = 86400;

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
      lastModified: resource.updated_at && !String(resource.updated_at).includes('ago')
        ? resource.updated_at
        : (resource.created_at || '2026-10-09T19:19:08.000Z'),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  const xml = buildUrlsetXml(routes);
  return xmlResponse(xml, 86400);
}
