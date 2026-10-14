import { SITE_URL, fetchSitemapData, buildUrlsetXml, xmlResponse } from '@/lib/sitemapHelper';

export const revalidate = 86400;

export async function GET() {
  const subjects = await fetchSitemapData('subjects', '/subjects/', {
    pageSize: 100,
    maxPages: 50,
    concurrency: 6,
  });

  const routes = subjects
    .filter((s) => s && s.slug)
    .map((subject) => ({
      url: `${SITE_URL}/subjects/${subject.slug}`,
      lastModified: subject.updated_at || subject.updated_at_iso || '2026-10-01T00:00:00.000Z',
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  const xml = buildUrlsetXml(routes);
  return xmlResponse(xml, 86400);
}
