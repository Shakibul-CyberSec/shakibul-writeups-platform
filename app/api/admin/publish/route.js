import { NextResponse } from 'next/server';
import { verifySessionToken, sanitizeMarkdown, isValidSlug } from '../../../lib/security';

let kv = null;
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  try {
    const { Redis } = await import('@upstash/redis');
    kv = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  } catch (err) {
    kv = null;
  }
}

export async function POST(request) {
  try {
    // 1. Verify HMAC Session Token
    const session = request.cookies.get('admin_session');
    if (!session || !session.value) {
      return NextResponse.json({ success: false, message: 'Unauthorized session.' }, { status: 401 });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const isValidSession = verifySessionToken(session.value, userAgent);
    if (!isValidSession) {
      return NextResponse.json({ success: false, message: 'Invalid or forged HMAC session signature.' }, { status: 403 });
    }

    // 2. CSRF Origin & Referer Validation
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    if (!origin || !origin.includes(host)) {
      return NextResponse.json({ success: false, message: 'CSRF Origin validation failed.' }, { status: 403 });
    }

    // 3. Read Data - Skip & Omit Skipped Fields Completely
    const rawData = await request.json();

    const todayStr = new Date().toISOString().split('T')[0];
    const rawTitle = (rawData.title && rawData.title.trim()) || `Security Research Writeup - ${todayStr}`;
    const rawContent = (rawData.content && rawData.content.trim()) || '';

    const title = sanitizeMarkdown(rawTitle);
    const content = sanitizeMarkdown(rawContent);

    // Omit fields completely if admin left them empty
    const category = rawData.category ? sanitizeMarkdown(rawData.category.trim()) : '';
    const difficulty = rawData.difficulty ? sanitizeMarkdown(rawData.difficulty.trim()) : '';
    const cvss = rawData.cvss ? sanitizeMarkdown(rawData.cvss.trim()) : '';
    const summary = rawData.summary ? sanitizeMarkdown(rawData.summary.trim()) : (content ? content.substring(0, 140) + '...' : '');

    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `writeup-${Date.now()}`;

    // Ensure generated ID is safe before storing
    if (!id || !isValidSlug(id)) {
      return NextResponse.json({ success: false, message: 'Could not generate a valid writeup ID from title.' }, { status: 400 });
    }

    const articleObject = {
      id,
      slug: id,
      title,
      category,
      difficulty,
      cvss,
      date: todayStr,
      readTime: content ? `${Math.max(1, Math.ceil(content.length / 500))} min read` : '1 min read',
      summary,
      content
    };

    // 4. Save to Upstash Redis
    let existingArticles = [];
    if (kv) {
      const stored = await kv.get('shakibul:writeups');
      if (stored && Array.isArray(stored)) {
        existingArticles = stored;
      }
    }

    const index = existingArticles.findIndex(a => a.id === id);
    if (index > -1) {
      existingArticles[index] = articleObject;
    } else {
      existingArticles.unshift(articleObject);
    }

    if (kv) {
      await kv.set('shakibul:writeups', existingArticles);
    }

    return NextResponse.json({ success: true, message: 'Writeup published live!', article: articleObject });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Publishing failure' }, { status: 500 });
  }
}
