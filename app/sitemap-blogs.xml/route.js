import { SITE_URL, fetchSitemapData, buildUrlsetXml, xmlResponse } from '@/lib/sitemapHelper';

export const dynamic = 'force-dynamic';

export async function GET() {
  const posts = await fetchSitemapData('blogs', '/blog/posts/', {
    pageSize: 100,
    maxPages: 100,
    concurrency: 6,
  });

  const routes = [];

  // Individual blog posts
  for (const post of posts) {
    if (!post?.slug) continue;
    routes.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updated_at || post.publish_date || post.updated_at_iso || new Date(),
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
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    });
  }

  const xml = buildUrlsetXml(routes);
  return xmlResponse(xml, 3600);
}
