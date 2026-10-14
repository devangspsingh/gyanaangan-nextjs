/**
 * Helper utilities for generating robust, fast, and standard-compliant Sitemaps
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.gyanaangan.in/api').replace(/\/+$/, '');
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://gyanaangan.in').replace(/\/+$/, '');

/**
 * Escapes XML special characters for safe inclusion in XML tags.
 */
export function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Normalizes dates to an ISO 8601 string or returns current time if invalid.
 */
export function formatIsoDate(dateVal) {
  if (!dateVal) return new Date().toISOString();
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Fetches sitemap data for a given section.
 * First attempts the dedicated lightweight endpoint (/sitemap/<section>/).
 * If not yet deployed or unavailable, gracefully falls back to fetchAllPagesConcurrently.
 *
 * @param {string} section - 'blogs' | 'resources' | 'subjects' | 'courses'
 * @param {string} fallbackEndpoint - Path like '/blog/posts/'
 * @param {object} fallbackOptions - Options for fetchAllPagesConcurrently
 */
export async function fetchSitemapData(section, fallbackEndpoint, fallbackOptions = {}) {
  const fastUrl = `${API_BASE}/sitemap/${section}/`;
  try {
    const res = await fetch(fastUrl, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Fast endpoint not available, silently proceed to fallback
  }

  return fetchAllPagesConcurrently(fallbackEndpoint, fallbackOptions);
}

/**
 * Fetches all pages of a paginated API endpoint using parallel batching.
 * Handles both standard 100-item pages and 9-item pages gracefully.
 *
 * @param {string} endpoint - Path like '/blog/posts/' or '/resources/'
 * @param {object} options - Configuration options
 * @returns {Promise<Array>} Array of all combined items
 */
export async function fetchAllPagesConcurrently(endpoint, options = {}) {
  const {
    pageSize = 100,
    maxPages = 200,
    concurrency = 6,
    revalidateSeconds = 3600,
    extraParams = {},
  } = options;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const baseFetchUrl = `${API_BASE}${cleanEndpoint}`;

  // Helper to construct URL with query params
  const buildPageUrl = (pageNumber) => {
    const url = new URL(baseFetchUrl);
    url.searchParams.set('page', String(pageNumber));
    url.searchParams.set('page_size', String(pageSize));
    for (const [k, v] of Object.entries(extraParams)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    }
    return url.toString();
  };

  try {
    // 1. Fetch Page 1
    const page1Url = buildPageUrl(1);
    const res1 = await fetch(page1Url, {
      next: { revalidate: revalidateSeconds },
      headers: { Accept: 'application/json' },
    });

    if (!res1.ok) {
      console.error(`[Sitemap] Failed to fetch page 1 for ${cleanEndpoint}: status ${res1.status}`);
      return [];
    }

    const data1 = await res1.json();
    const results1 = Array.isArray(data1) ? data1 : data1.results || [];
    const totalCount = typeof data1.count === 'number' ? data1.count : results1.length;

    // If no pagination or only 1 page
    if (!data1.next || results1.length === 0 || results1.length >= totalCount) {
      return results1;
    }

    // 2. Determine how many total pages exist
    const itemsPerPage = results1.length;
    const totalPages = Math.min(Math.ceil(totalCount / itemsPerPage), maxPages);

    const remainingPages = [];
    for (let p = 2; p <= totalPages; p++) {
      remainingPages.push(p);
    }

    // 3. Batch fetch remaining pages with controlled concurrency
    const allResults = [...results1];
    for (let i = 0; i < remainingPages.length; i += concurrency) {
      const chunk = remainingPages.slice(i, i + concurrency);
      const chunkPromises = chunk.map(async (pageNumber) => {
        try {
          const res = await fetch(buildPageUrl(pageNumber), {
            next: { revalidate: revalidateSeconds },
            headers: { Accept: 'application/json' },
          });
          if (!res.ok) {
            console.warn(`[Sitemap] Warning: Failed to fetch page ${pageNumber} for ${cleanEndpoint}: ${res.status}`);
            return [];
          }
          const pageData = await res.json();
          return Array.isArray(pageData) ? pageData : pageData.results || [];
        } catch (err) {
          console.warn(`[Sitemap] Error fetching page ${pageNumber} for ${cleanEndpoint}:`, err.message);
          return [];
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      for (const items of chunkResults) {
        allResults.push(...items);
      }
    }

    return allResults;
  } catch (err) {
    console.error(`[Sitemap] Exception fetching all pages for ${cleanEndpoint}:`, err);
    return [];
  }
}

/**
 * Builds standard XML for a urlset sitemap.
 *
 * @param {Array<{url: string, lastModified?: string|Date, changeFrequency?: string, priority?: number}>} entries
 * @returns {string} XML string
 */
export function buildUrlsetXml(entries = []) {
  const xmlEntries = entries
    .filter((e) => e && e.url)
    .map((e) => {
      const loc = escapeXml(e.url);
      const lastmod = formatIsoDate(e.lastModified);
      const lines = [
        `  <url>`,
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
      ];
      if (e.changeFrequency) {
        lines.push(`    <changefreq>${escapeXml(e.changeFrequency)}</changefreq>`);
      }
      if (typeof e.priority === 'number') {
        lines.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
      }
      lines.push(`  </url>`);
      return lines.join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries}\n</urlset>`;
}

/**
 * Builds standard XML for a sitemap index file.
 *
 * @param {Array<{url: string, lastModified?: string|Date}>} sitemaps
 * @returns {string} XML string
 */
export function buildSitemapIndexXml(sitemaps = []) {
  const xmlEntries = sitemaps
    .filter((s) => s && s.url)
    .map((s) => {
      const loc = escapeXml(s.url);
      const lastmod = formatIsoDate(s.lastModified);
      return `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries}\n</sitemapindex>`;
}

/**
 * Creates a standard XML HTTP response with proper caching headers.
 */
export function xmlResponse(xmlString, maxAgeSeconds = 3600) {
  return new Response(xmlString, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, s-maxage=${maxAgeSeconds}, stale-while-revalidate=86400`,
    },
  });
}
