import { NextResponse } from 'next/server';

// Match consecutive/compounding percent encodings like %2525, %255c, %2522, etc.
const COMPOUND_PERCENT_REGEX = /(?:%25){2,}|%25(?:25|5c|22|20|2e|2f|3c|3e)/i;

// Match dangerous control characters, null bytes, backslashes, quotes, angle brackets
const DANGEROUS_CHARS_REGEX = /[\x00-\x1f\x7f"'<>\\]|%(?:00|22|27|3c|3e|5c)/i;

// Block common malicious scanner probes that never exist in this app
const BLOCKED_PROBE_REGEX = /(?:\.env|\.git|\.php|\.asp|\.jsp|\.cgi|wp-|cgi-bin|web-inf|\$\(pwd\)|alvin9999|\.\.)/i;

function create404Response() {
  return new NextResponse('Not Found', {
    status: 404,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

export function middleware(request) {
  const url = request.nextUrl;
  const rawUrl = request.url;
  const pathname = url.pathname;

  // 1. Total length bounds check
  if (pathname.length > 200 || rawUrl.length > 500) {
    return create404Response();
  }

  // 2. Reject encoded or unencoded backslashes (\, %5c, %5C)
  if (rawUrl.includes('\\') || pathname.includes('\\') || /%5c/i.test(rawUrl)) {
    return create404Response();
  }

  // 3. Reject recursive / compounding percent-encoding (%2525, %255c, etc.)
  if (COMPOUND_PERCENT_REGEX.test(rawUrl) || COMPOUND_PERCENT_REGEX.test(pathname)) {
    return create404Response();
  }

  // 4. Reject control characters, null bytes, quotes, angle brackets
  if (DANGEROUS_CHARS_REGEX.test(rawUrl) || DANGEROUS_CHARS_REGEX.test(pathname)) {
    return create404Response();
  }

  // 5. Reject excessive individual path segment lengths (> 120 chars)
  const segments = pathname.split('/').filter(Boolean);
  for (const segment of segments) {
    if (segment.length > 120) {
      return create404Response();
    }
  }

  // 6. Early-drop crawler/scanner probe patterns (.env, .php, wp-, etc.)
  if (BLOCKED_PROBE_REGEX.test(pathname) || BLOCKED_PROBE_REGEX.test(rawUrl)) {
    return create404Response();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap*.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.*\\.xml|robots\\.txt).*)',
  ],
};
