import { getBlogPostBySlug, getBlogPosts } from '@/services/apiService';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDate } from '@/components/blog/utils';
import BlogSidebar from '@/components/blog/BlogSidebar';
import ShareButtons from '@/components/blog/ShareButtons';
import { Metadata } from 'next';
import { getGradientForSlug } from '@/components/blog/gradients';
import { AdContainer } from '@/components/blog/AdContainer';
import { AdUnit } from '@/components/blog/AdUnit';

// Generate static metadata for SEO
export async function generateMetadata({ params }) {
  const { blogSlug } = await params;
  const response = await getBlogPostBySlug(blogSlug);
  const post = response.data;

  if (!post) {
    return {
      title: 'Post Not Found - GyanAangan Blog',
      description: 'The requested blog post could not be found.',
    };
  }

  return {
    title: `${post.title} - GyanAangan Blog`,
    description: post.excerpt || post.meta_description,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.meta_description,
      type: 'article',
      authors: [post.author_name],
      publishedTime: post.publish_date,
      modifiedTime: post.updated_at,
      images: [post.featured_image || post.og_image],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { blogSlug } = await params;
  const response = await getBlogPostBySlug(blogSlug);

  if (!response.data) {
    notFound();
  }

  const post = response.data;

  // Fetch related posts based on category
  const relatedResponse = await getBlogPosts(1, 3, { 
    category: post.category?.slug,
    exclude: blogSlug 
  });
  const relatedPosts = relatedResponse.error ? [] : relatedResponse.data.results;

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <article className="lg:col-span-8 xl:col-span-9">
          {/* Header */}
          <header className="mb-8">
            <div className="relative mb-6 rounded-lg overflow-hidden">
              {post.featured_image ? (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="object-cover w-full h-full"
                  priority
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center relative"
                  style={{ background: getGradientForSlug(post.slug) }}
                >
                  {/* Decorative overlay */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.5),transparent)]"></div>
                  
                  {/* Title watermark */}
                  <div className="relative z-10 text-white/30 font-bold text-5xl text-center px-12 line-clamp-4">
                    {post.title}
                  </div>
                </div>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">{post.title}</h1>
            <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
              {post.author_name && (
                <span>By {post.author_name}</span>
              )}
              <time dateTime={post.publish_date}>
                {formatDate(post.publish_date)}
              </time>
              {post.category && (
                <Link 
                  href={`/blog?category=${post.category.slug}`}
                  className="text-primary hover:text-primary-light"
                >
                  {post.category.name}
                </Link>
              )}
            </div>
          </header>

          <div className="my-8">
            <AdContainer>
              <AdUnit />
            </AdContainer>
          </div>

          {/* Content */}
          <article 
            className="prose prose-invert lg:prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Advertisement Banner */}
          <div className="my-8">
            <AdContainer>
              <AdUnit />
            </AdContainer>
          </div>

          {/* Footer */}
          <footer className="mt-8 pt-8 border-t border-stone-700">
            {/* <ShareButtons post={post} /> */}
            {post.tags?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${tag}`}
                      className="px-3 py-1 bg-stone-800 text-gray-300 rounded-full text-sm hover:bg-stone-700"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </footer>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3">
          {/* Advertisement in Sidebar */}
          <div className="mb-6">
            <AdContainer>
              <AdUnit 
                data-ad-slot="1937256059"
                data-ad-format="vertical"
              />
            </AdContainer>
          </div>
          
          <BlogSidebar 
            featuredPosts={relatedPosts}
            currentPost={post}
          />
        </aside>
      </div>
    </main>
  );
}
