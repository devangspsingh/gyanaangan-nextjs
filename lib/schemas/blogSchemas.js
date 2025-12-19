export function generateBlogListSchema(posts, currentPage, totalPages) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.in';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': currentPage > 1 ? `Blog - Page ${currentPage}` : 'Blog',
    'description': 'Explore our latest articles, tutorials, and educational content.',
    'url': currentPage > 1 ? `${siteUrl}/blog?page=${currentPage}` : `${siteUrl}/blog`,
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': posts.map((post, index) => ({
        '@type': 'ListItem',
        'position': (currentPage - 1) * 9 + index + 1,
        'url': `${siteUrl}/blog/${post.slug}`,
        'name': post.title,
      })),
    },
  };
}

export function generateBlogPostSchema(post) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.in';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.excerpt || post.meta_description,
    'image': post.featured_image || post.og_image,
    'datePublished': post.publish_date,
    'dateModified': post.updated_at_iso || post.publish_date,
    'author': {
      '@type': 'Person',
      'name': post.author?.name || 'GyanAangan',
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'GyanAangan',
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl}/images/logo.png`,
      },
    },
    'url': `${siteUrl}/blog/${post.slug}`,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  };
}

export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url,
    })),
  };
}
