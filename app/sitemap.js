import { 
  getCourses, 
  getSubjects, 
  getResources, 
  getBlogPosts 
} from '@/services/apiService';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.in';

// Helper function to fetch all pages of paginated data
async function fetchAllPages(fetchFunction, pageSize = 100) {
  let allResults = [];
  let currentPage = 1;
  let hasMore = true;

  while (hasMore && currentPage <= 10) { // Limit to 10 pages (1000 items) for safety
    try {
      const response = await fetchFunction(currentPage, pageSize);
      if (!response.error && response.data?.results) {
        allResults = [...allResults, ...response.data.results];
        hasMore = !!response.data.next;
        currentPage++;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error('Error fetching page:', currentPage, error);
      hasMore = false;
    }
  }

  return allResults;
}

export default async function sitemap() {

  // Static pages
  const staticRoutes = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/courses`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/subjects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/resources`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // Fetch all courses
    let coursePages = [];
    try {
      const courses = await fetchAllPages(getCourses);
      coursePages = courses.map((course) => ({
        url: `${SITE_URL}/${course.slug}`,
        lastModified: course.updated_at_iso ? new Date(course.updated_at_iso) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    } catch (error) {
      console.error('❌ [Sitemap] Error fetching courses:', error);
    }

    // Fetch all subjects
    let subjectPages = [];
    try {
      const subjects = await fetchAllPages(getSubjects);
      subjectPages = subjects.map((subject) => ({
        url: `${SITE_URL}/subjects/${subject.slug}`,
        lastModified: subject.updated_at_iso ? new Date(subject.updated_at_iso) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    } catch (error) {
      console.error('❌ [Sitemap] Error fetching subjects:', error);
    }

    // Fetch all resources (first 500 - limit for performance)
    let resourcePages = [];
    try {
      const resources = await fetchAllPages((page, size) => 
        getResources(page, size, {}), 100
      );
      // Limit to first 500 resources to keep sitemap manageable
      const limitedResources = resources.slice(0, 500);
      resourcePages = limitedResources.map((resource) => ({
        url: `${SITE_URL}/resources/${resource.slug}`,
        lastModified: resource.updated_at_iso ? new Date(resource.updated_at_iso) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
    } catch (error) {
      console.error('❌ [Sitemap] Error fetching resources:', error);
    }

    // Fetch all blog posts
    let blogPages = [];
    let blogPaginationPages = [];
    try {
      const posts = await fetchAllPages(getBlogPosts);
      blogPages = posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updated_at_iso ? new Date(post.updated_at_iso) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

      // Add pagination pages for blog
      // Assuming 9 posts per page
      const postsPerPage = 9;
      const totalBlogPages = Math.ceil(posts.length / postsPerPage);
      
      for (let page = 2; page <= totalBlogPages; page++) {
        blogPaginationPages.push({
          url: `${SITE_URL}/blog?page=${page}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.6,
        });
      }
    } catch (error) {
      console.error('❌ [Sitemap] Error fetching blog posts:', error);
    }

    // Combine all routes
    const allRoutes = [
      ...staticRoutes,
      ...coursePages,
      ...subjectPages,
      ...resourcePages,
      ...blogPages,
      ...blogPaginationPages,
    ];


    return allRoutes;
  } catch (error) {
    console.error('❌ [Sitemap] Error generating sitemap:', error);
    // Return at least static routes if dynamic fetching fails
    return staticRoutes;
  }
}
