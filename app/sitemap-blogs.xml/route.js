import { SITE_URL, fetchSitemapData, buildUrlsetXml, xmlResponse } from '@/lib/sitemapHelper';

export const revalidate = 86400;

export async function GET() {
  const posts = await fetchSitemapData('blogs', '/blog/posts/', {
    pageSize: 100,
    maxPages: 100,
    concurrency: 6,
  });

  const routes = [];
  const latestBlogDate = posts[0]?.updated_at || posts[0]?.publish_date || '2026-10-14T05:14:13.000Z';

  // Individual blog posts
  for (const post of posts) {
    if (!post?.slug) continue;
    routes.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updated_at || post.publish_date || post.updated_at_iso || '2026-10-01T00:00:00.000Z',
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Blog listing pagination pages (9 posts per page as defined in Blog list view)
  const postsPerPage = 9;
  const totalPages = Math.ceil(posts.length / postsPerPage);
  for (let page = 2; page <= totalPages; page++) {
    routes.push({
      url: `${SITE_URL}/blog?page=${page}`,
      lastModified: latestBlogDate,
      changeFrequency: 'daily',
      priority: 0.6,
    });
  }

  const xml = buildUrlsetXml(routes);
  return xmlResponse(xml, 86400);
}
