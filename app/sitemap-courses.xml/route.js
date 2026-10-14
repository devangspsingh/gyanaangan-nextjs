import { SITE_URL, fetchSitemapData, buildUrlsetXml, xmlResponse } from '@/lib/sitemapHelper';

export const dynamic = 'force-dynamic';

export async function GET() {
  const courses = await fetchSitemapData('courses', '/courses/', {
    pageSize: 50,
    maxPages: 10,
    concurrency: 3,
  });

  const routes = [];

  for (const course of courses) {
    if (!course.slug) continue;

    const courseDate = course.updated_at || course.updated_at_iso || new Date();

    // Course main page: /course-slug
    routes.push({
      url: `${SITE_URL}/${course.slug}`,
      lastModified: courseDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // Sub-streams & years if present
    if (Array.isArray(course.streams)) {
      for (const stream of course.streams) {
        if (!stream.slug) continue;

        routes.push({
          url: `${SITE_URL}/${course.slug}/${stream.slug}`,
          lastModified: courseDate,
          changeFrequency: 'weekly',
          priority: 0.7,
        });

        if (Array.isArray(stream.years)) {
          for (const year of stream.years) {
            if (!year.slug) continue;
            routes.push({
              url: `${SITE_URL}/${course.slug}/${stream.slug}/${year.slug}`,
              lastModified: courseDate,
              changeFrequency: 'weekly',
              priority: 0.7,
            });
          }
        }
      }
    }
  }

  const xml = buildUrlsetXml(routes);
  return xmlResponse(xml, 3600);
}
