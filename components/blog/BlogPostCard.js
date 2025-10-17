import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from './utils';
import { Badge } from "@/components/ui/badge";
import { getGradientForSlug } from './gradients';

export default function BlogPostCard({ post }) {
  return (
    // The card is now a flex container, arranged vertically
    <article className="bg-slate-950/80 rounded-lg overflow-hidden flex flex-col transition-transform duration-300 group">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        {/* 1. Image Container (Stays the same) */}
        <div className="relative aspect-video overflow-hidden">
          {post.featured_image ? (
            <img
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center relative overflow-hidden"
              style={{ background: getGradientForSlug(post.slug) }}
            >
              {/* Optional: Add a subtle pattern overlay */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.5),transparent)]"></div>
              
              {/* Optional: Add the title as a watermark */}
              <div className="relative z-10 text-white/20 font-bold text-4xl text-center px-8 line-clamp-3">
                {post.title}
              </div>
            </div>
          )}
          {post.category && (
            <Badge className="absolute top-4 left-4 bg-slate-700/40 hover:bg-gray-700/50 z-10">
              {post.category.name}
            </Badge>
          )}
        </div>

        {/* 2. Content Wrapper (This will grow to fill space) */}
        <div className="p-3 flex flex-col flex-grow">
          <h2 className='font-bold text-white mb-1 line-clamp-2'>
            {post.title}
          </h2>
          
          {/* <p className="text-gray-300 text-sm line-clamp-3">
            {post.excerpt}
          </p> */}

          {/* 3. Meta Footer (Pushed to the bottom) */}
          {/* "mt-auto" is the magic class that pushes this block down */}
          <div className="flex items-center text-xs text-gray-400 pt-2">
            <time dateTime={post.publish_date}>
              {formatDate(post.publish_date)}
            </time>
            <span className="ml-auto font-semibold text-white/90">
              Read More →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}