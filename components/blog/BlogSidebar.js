'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, usePathname } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import {
    ArrowRightIcon,
    HashtagIcon,
    BookmarkIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { formatDate } from './utils';
import { getGradientForSlug } from './gradients';

export default function BlogSidebar({ categories = [], featuredPosts = [], currentPost = null }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentCategory = searchParams.get('category');
    const currentTag = searchParams.get('tag');

    return (
        <div className="space-y-8">
            {/* Categories Section */}
            {categories.length > 0 && (
                <Card className="bg-stone-800/50 border-stone-700">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                        <ul className="space-y-2">
                            {categories.map(category => (
                                <li key={category.slug}>
                                    <Link
                                        href={`/blog?category=${category.slug}`}
                                        className={`flex items-center justify-between group p-2 rounded-md transition-colors ${
                                            currentCategory === category.slug
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-gray-300 hover:bg-stone-700/50'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <HashtagIcon className="w-4 h-4" />
                                            {category.name}
                                        </span>
                                        {category.post_count && (
                                            <span className="text-sm text-gray-400">
                                                {category.post_count}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Featured/Related Posts Section */}
            {featuredPosts.length > 0 && (
                <Card className="bg-stone-800/50 border-stone-700">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            {currentPost ? 'Related Posts' : 'Featured Posts'}
                        </h3>
                        <div className="space-y-4">
                            {featuredPosts.map(post => (
                                <Link
                                    key={post.slug}
                                    href={`/blog/${post.slug}`}
                                    className="group block"
                                >
                                    <article className="flex gap-4">
                                        <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                                            {post.featured_image ? (
                                                <img
                                                    src={post.featured_image}
                                                    alt={post.title}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div 
                                                    className="w-full h-full"
                                                    style={{ background: getGradientForSlug(post.slug) }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="text-gray-200 group-hover:text-primary line-clamp-2 text-sm font-medium mb-1">
                                                {post.title}
                                            </h4>
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                <time dateTime={post.publish_date}>
                                                    {formatDate(post.publish_date)}
                                                </time>
                                                {post.reading_time && (
                                                    <span className="flex items-center gap-1">
                                                        <ClockIcon className="w-3 h-3" />
                                                        {post.reading_time} min read
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* About Section - Only show on post detail pages */}
            {currentPost && (
                <Card className="bg-stone-800/50 border-stone-700">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">About This Post</h3>
                        <div className="space-y-3 text-sm text-gray-300">
                            {currentPost.author_name && (
                                <div>
                                    <strong className="text-gray-200">Author:</strong>{' '}
                                    {currentPost.author_name}
                                </div>
                            )}
                            <div>
                                <strong className="text-gray-200">Published:</strong>{' '}
                                {formatDate(currentPost.publish_date)}
                            </div>
                            {currentPost.reading_time && (
                                <div>
                                    <strong className="text-gray-200">Reading Time:</strong>{' '}
                                    {currentPost.reading_time} minutes
                                </div>
                            )}
                            {currentPost.view_count && (
                                <div>
                                    <strong className="text-gray-200">Views:</strong>{' '}
                                    {currentPost.view_count}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
