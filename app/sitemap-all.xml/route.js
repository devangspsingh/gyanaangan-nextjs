import { SITE_URL, fetchSitemapData, buildUrlsetXml, xmlResponse } from '@/lib/sitemapHelper';

export const dynamic = 'force-dynamic';

export async function GET() {
  const staticRoutes = [
    { url: `${SITE_URL}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/courses`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/subjects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/resources`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/support`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Fetch all categories in parallel
  const [courses, subjects, resources, posts] = await Promise.all([
    fetchSitemapData('courses', '/courses/', { pageSize: 50, maxPages: 10, concurrency: 3 }),
    fetchSitemapData('subjects', '/subjects/', { pageSize: 100, maxPages: 50, concurrency: 6 }),
    fetchSitemapData('resources', '/resources/', { pageSize: 100, maxPages: 100, concurrency: 8 }),
    fetchSitemapData('blogs', '/blog/posts/', { pageSize: 100, maxPages: 100, concurrency: 6 }),
  ]);

  const courseRoutes = [];
  for (const course of courses) {
    if (!course.slug) continue;
    const courseDate = course.updated_at || course.updated_at_iso || new Date();
    courseRoutes.push({ url: `${SITE_URL}/${course.slug}`, lastModified: courseDate, changeFrequency: 'weekly', priority: 0.8 });
    if (Array.isArray(course.streams)) {
      for (const stream of course.streams) {
        if (!stream.slug) continue;
        courseRoutes.push({ url: `${SITE_URL}/${course.slug}/${stream.slug}`, lastModified: courseDate, changeFrequency: 'weekly', priority: 0.7 });
        if (Array.isArray(stream.years)) {
          for (const year of stream.years) {
            if (!year.slug) continue;
            courseRoutes.push({ url: `${SITE_URL}/${course.slug}/${stream.slug}/${year.slug}`, lastModified: courseDate, changeFrequency: 'weekly', priority: 0.7 });
          }
        }
      }
    }
  }

  const subjectRoutes = subjects
    .filter((s) => s && s.slug)
    .map((s) => ({
      url: `${SITE_URL}/subjects/${s.slug}`,
      lastModified: s.updated_at || s.updated_at_iso || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  const resourceRoutes = resources
    .filter((r) => r && r.slug)
    .map((r) => ({
      url: `${SITE_URL}/resources/${r.slug}`,
      lastModified: r.updated_at || r.updated_at_iso || new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  const blogRoutes = [];
  for (const post of posts) {
    if (!post?.slug) continue;
    blogRoutes.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updated_at || post.publish_date || post.updated_at_iso || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  const postsPerPage = 9;
  const totalPages = Math.ceil(posts.length / postsPerPage);
  for (let page = 2; page <= totalPages; page++) {
    blogRoutes.push({
      url: `${SITE_URL}/blog?page=${page}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    });
  }

  const allRoutes = [
    ...staticRoutes,
    ...courseRoutes,
    ...subjectRoutes,
    ...resourceRoutes,
    ...blogRoutes,
  ];

  const xml = buildUrlsetXml(allRoutes);
  return xmlResponse(xml, 3600);
}
