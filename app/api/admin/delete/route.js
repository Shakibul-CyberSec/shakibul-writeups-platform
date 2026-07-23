import { NextResponse } from 'next/server';
import { verifySessionToken, isValidSlug } from '../../../lib/security';

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
    // 1. Verify HMAC Session Token & User-Agent
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

    const { id } = await request.json();

    if (!id || typeof id !== 'string' || !isValidSlug(id)) {
      return NextResponse.json({ success: false, message: 'Writeup ID is required.' }, { status: 400 });
    }

    // 3. Delete from Upstash Redis or Memory Store
    if (kv) {
      const stored = await kv.get('shakibul:writeups');
      if (stored && Array.isArray(stored)) {
        const filtered = stored.filter(a => a.id !== id && a.slug !== id);
        await kv.set('shakibul:writeups', filtered);
      }
    }

    return NextResponse.json({ success: true, message: `Writeup '${id}' deleted successfully.` });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete writeup.' }, { status: 500 });
  }
}
