import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkCommentRateLimit, encodeHTMLEntities, isValidSlug } from '../../lib/security';

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

// Memory fallback store for comments
const memoryComments = new Map();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const writeupId = searchParams.get('writeupId');

    if (!writeupId || !isValidSlug(writeupId)) {
      return NextResponse.json({ success: false, comments: [] });
    }

    const key = `shakibul:comments:${writeupId}`;
    if (kv) {
      const stored = await kv.get(key);
      if (stored && Array.isArray(stored)) {
        return NextResponse.json({ success: true, comments: stored });
      }
    }

    const memoryList = memoryComments.get(writeupId) || [];
    return NextResponse.json({ success: true, comments: memoryList });
  } catch (error) {
    return NextResponse.json({ success: false, comments: [] });
  }
}

export async function POST(request) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

    // 1. Rate Limit (Max 3 comments per 5 mins)
    const rateLimit = await checkCommentRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many comments. Please wait ${rateLimit.remainingSeconds} seconds.`
        },
        { status: 429 }
      );
    }

    const { writeupId, author, text, hp_field } = await request.json();

    // 2. Honeypot Bot Trap Check
    if (hp_field && hp_field.trim() !== '') {
      // Silent shadow-ban for bots
      return NextResponse.json({ success: true, message: 'Comment submitted' });
    }

    // 3. Input Validation & IDOR Protection
    if (!writeupId || !isValidSlug(writeupId)) {
      return NextResponse.json({ success: false, message: 'Invalid writeup ID' }, { status: 400 });
    }

    if (!author || typeof author !== 'string' || author.trim().length === 0 || author.length > 40) {
      return NextResponse.json({ success: false, message: 'Author name must be between 1 and 40 characters' }, { status: 400 });
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0 || text.length > 500) {
      return NextResponse.json({ success: false, message: 'Comment text must be between 1 and 500 characters' }, { status: 400 });
    }

    // 4. Strict HTML Entity Encoding (Zero XSS)
    const cleanAuthor = encodeHTMLEntities(author.trim());
    const cleanText = encodeHTMLEntities(text.trim());

    const newComment = {
      id: `comment-${Date.now()}-${crypto.randomUUID().replace(/-/g, '').substring(0, 8)}`,
      writeupId,
      author: cleanAuthor,
      text: cleanText,
      date: new Date().toISOString().split('T')[0]
    };

    const key = `shakibul:comments:${writeupId}`;
    let comments = [];

    if (kv) {
      const stored = await kv.get(key);
      if (stored && Array.isArray(stored)) {
        comments = stored;
      }
    } else {
      comments = memoryComments.get(writeupId) || [];
    }

    comments.unshift(newComment);

    // Cap comment storage to prevent unbounded growth (M-4)
    if (comments.length > 100) {
      comments = comments.slice(0, 100);
    }

    if (kv) {
      await kv.set(key, comments);
    } else {
      memoryComments.set(writeupId, comments);
    }

    return NextResponse.json({ success: true, message: 'Comment posted securely', comment: newComment });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Comment processing error' }, { status: 500 });
  }
}
