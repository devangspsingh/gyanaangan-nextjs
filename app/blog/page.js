import { getBlogPosts, getBlogCategories, getFeaturedPosts } from '@/services/apiService';
import BlogPostCard from '@/components/blog/BlogPostCard';
// import BlogSidebar from '@/components/blog/BlogSidebar';
import BlogInfiniteScroll from '@/components/blog/BlogInfiniteScroll';
import { Suspense } from 'react';

export const metadata = {
  title: 'Blog - GyanAangan',
  description: 'Explore our latest articles, tutorials, and educational content.',
};

export default async function BlogPage() {
  // Fetch initial data
  const [postsResponse, categoriesResponse, featuredResponse] = await Promise.all([
    getBlogPosts(1, 9),
    getBlogCategories(),
    getFeaturedPosts()
  ]);

  const initialPosts = postsResponse.error ? [] : postsResponse.data.results;
  const categories = categoriesResponse.error ? [] : categoriesResponse.data;
  const featuredPosts = featuredResponse.error ? [] : featuredResponse.data;
  const totalPages = postsResponse.data?.total_pages || 1;

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-12 xl:col-span-12">
          <h1 className="text-4xl font-bold text-white mb-8">Blog</h1>

          {/* Featured Posts Carousel/Grid - Only on first page */}
          {featuredPosts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-6">Featured Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Blog Posts Grid with Infinite Scroll */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-6">Latest Posts</h2>
            <Suspense fallback={<BlogPostsSkeleton />}>
              <BlogInfiniteScroll
                initialPosts={initialPosts}
                totalPages={totalPages}
              />
            </Suspense>
          </section>
        </div>

        {/* Sidebar */}
        {false &&
          <aside className="lg:col-span-4 xl:col-span-3">
            {/* <BlogSidebar 
            categories={categories}
            featuredPosts={featuredPosts.slice(0, 3)}
          /> */}
          </aside>}
      </div>
    </main>
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
