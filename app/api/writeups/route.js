import { NextResponse } from 'next/server';

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

export async function GET() {
  try {
    if (kv) {
      const storedData = await kv.get('shakibul:writeups');
      if (storedData && Array.isArray(storedData)) {
        return NextResponse.json(storedData);
      }
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json([]);
  }
}
