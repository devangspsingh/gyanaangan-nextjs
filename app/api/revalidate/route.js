import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

function validateSecret(request, bodySecret) {
  const serverSecret = process.env.REVALIDATE_SECRET_TOKEN;
  if (!serverSecret) {
    console.error('REVALIDATE_SECRET_TOKEN is not configured in server environment variables.');
    return false;
  }

  // Check body secret, query param secret, or header
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const headerSecret = request.headers.get('x-revalidate-secret') || 
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  const providedSecret = bodySecret || querySecret || headerSecret;
  return providedSecret === serverSecret;
}

function performRevalidation({ slug, path, tag, type }) {
  const revalidated = [];

  if (slug) {
    const blogPath = `/blog/${slug}`;
    revalidatePath(blogPath, 'page');
    revalidated.push(blogPath);

    // Also revalidate the main blog directory / list
    revalidatePath('/blog', 'page');
    revalidated.push('/blog');
  }

  if (path) {
    if (type) {
      revalidatePath(path, type);
    } else {
      revalidatePath(path);
    }
    if (!revalidated.includes(path)) {
      revalidated.push(path);
    }
  }

  if (tag) {
    revalidateTag(tag);
    revalidated.push(`tag:${tag}`);
  }

  return revalidated;
}

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Empty or non-JSON body, fallback to query params
      body = {};
    }

    if (!validateSecret(request, body.secret)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing secret token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const slug = body.slug || searchParams.get('slug');
    const path = body.path || searchParams.get('path');
    const tag = body.tag || searchParams.get('tag');
    const type = body.type || searchParams.get('type');

    if (!slug && !path && !tag) {
      return NextResponse.json(
        { success: false, message: 'Please provide a slug, path, or tag to revalidate' },
        { status: 400 }
      );
    }

    const revalidated = performRevalidation({ slug, path, tag, type });

    return NextResponse.json({
      success: true,
      revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error during revalidation:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    if (!validateSecret(request)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing secret token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const path = searchParams.get('path');
    const tag = searchParams.get('tag');
    const type = searchParams.get('type');

    if (!slug && !path && !tag) {
      return NextResponse.json(
        { success: false, message: 'Please provide a slug, path, or tag to revalidate' },
        { status: 400 }
      );
    }

    const revalidated = performRevalidation({ slug, path, tag, type });

    return NextResponse.json({
      success: true,
      revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error during revalidation:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
