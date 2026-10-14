import { SITE_URL, fetchSitemapData, buildUrlsetXml, xmlResponse } from '@/lib/sitemapHelper';

export const dynamic = 'force-dynamic';

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
      lastModified: subject.updated_at || subject.updated_at_iso || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  const xml = buildUrlsetXml(routes);
  return xmlResponse(xml, 3600);
}
