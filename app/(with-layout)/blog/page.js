import { getBlogPosts, getBlogCategories, getFeaturedPosts } from '@/services/apiService';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogPostsGrid from '@/components/blog/BlogPostsGrid';
import { Suspense } from 'react';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { generateBlogListSchema } from '@/lib/schemas/blogSchemas';
import { redirect } from 'next/navigation';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params?.page) || 1;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.in';

  const title = page > 1 ? `Blog - Page ${page} | GyanAangan` : 'Blog - GyanAangan';
  const description = 'Explore our latest articles, tutorials, and educational content.';
  const canonicalUrl = page > 1 ? `${siteUrl}/blog?page=${page}` : `${siteUrl}/blog`;

  // Fetch total pages for prev/next links
  let totalPages = 1;
  try {
    const response = await getBlogPosts(page, 9);
    const totalCount = response.data?.count || 0;
    totalPages = Math.ceil(totalCount / 9);
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }

  const metadata = {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };

  // Add other alternate links for pagination
  if (page > 1 || page < totalPages) {
    metadata.other = {};

    if (page > 1) {
      const prevUrl = page === 2 ? `${siteUrl}/blog` : `${siteUrl}/blog?page=${page - 1}`;
      metadata.other.prev = prevUrl;
    }

    if (page < totalPages) {
      metadata.other.next = `${siteUrl}/blog?page=${page + 1}`;
    }
  }

  return metadata;
}

export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  const currentPage = parseInt(params?.page) || 1;
  const postsPerPage = 9; // Adjust as needed

  // Validate page number - must be positive integer
  if (currentPage < 1 || !Number.isInteger(currentPage)) {
    redirect('/blog');
  }

  // Fetch initial data
  const [postsResponse, categoriesResponse, featuredResponse] = await Promise.all([
    getBlogPosts(currentPage, postsPerPage),
    getBlogCategories(),
    currentPage === 1 ? getFeaturedPosts() : Promise.resolve({ data: [] })
  ]);

  const initialPosts = postsResponse.error ? [] : postsResponse.data.results;
  const categories = categoriesResponse.error ? [] : categoriesResponse.data;
  const featuredPosts = featuredResponse.error ? [] : featuredResponse.data;
  
  // Calculate total pages from count and page size
  const totalCount = postsResponse.data?.count || 0;
  const totalPages = Math.ceil(totalCount / postsPerPage);

  // If requested page is beyond total pages, redirect to last valid page or home
  if (currentPage > totalPages && totalPages > 0) {
    redirect(totalPages === 1 ? '/blog' : `/blog?page=${totalPages}`);
  }

  // If no posts found on page 1, show empty state
  // If no posts found on other pages, redirect to page 1
  if (initialPosts.length === 0 && currentPage > 1) {
    redirect('/blog');
  }

  // Generate structured data for SEO
  const blogListSchema = generateBlogListSchema(initialPosts, currentPage, totalPages);

  return (
    <>
      {/* Add JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-12 xl:col-span-12">
            <h1 className="text-4xl font-bold text-white mb-8">
              {currentPage > 1 ? `Blog - Page ${currentPage}` : 'Blog'}
            </h1>

            {/* Featured Posts Carousel/Grid - Only on first page */}
            {currentPage === 1 && featuredPosts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">Featured Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                  {featuredPosts.map(post => (
                    <BlogPostCard
                      key={post.slug}
                      post={post}
                      featured={true}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Blog Posts Grid with Pagination */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-6">
                {currentPage === 1 ? 'Latest Posts' : `Posts - Page ${currentPage}`}
              </h2>

              <Suspense fallback={<BlogPostsSkeleton />}>
                <BlogPostsGrid
                  key={currentPage}
                  initialPosts={initialPosts}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  enableLoadMore={false}
                />
              </Suspense>
            </section>
          </div>


          {/* Sidebar */}
          {true &&
            <aside className="lg:col-span-4 xl:col-span-3">
              <BlogSidebar
                categories={categories}
                featuredPosts={currentPage === 1 ? featuredPosts.slice(0, 3) : []}
              />
            </aside>}
        </div>
      </main>
    </>
  );
}

function BlogPostsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-stone-800 rounded-lg p-4 h-[300px]">
          <div className="bg-stone-700 h-40 rounded-lg mb-4"></div>
          <div className="bg-stone-700 h-6 w-3/4 rounded mb-2"></div>
          <div className="bg-stone-700 h-4 w-1/2 rounded"></div>
        </div>
      ))}
    </div>

  );
}


export const dynamic = 'force-dynamic';