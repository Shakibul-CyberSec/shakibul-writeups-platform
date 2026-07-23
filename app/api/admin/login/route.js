import { NextResponse } from 'next/server';
import { checkAdminRateLimit, timingSafeCompare, generateSessionToken } from '../../../lib/security';

export async function POST(request) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

    // 1. Check Rate Limit (Max 5 attempts per 15 mins)
    const rateLimit = await checkAdminRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many failed admin login attempts. Subnet locked out for ${rateLimit.remainingSeconds} seconds.`
        },
        { status: 429 }
      );
    }

    const { password, hp_access_key } = await request.json();

    // 2. Honeypot Check (Bot Trapping)
    if (hp_access_key && hp_access_key.trim() !== '') {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Artificial Timing Delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // 4. Strict Environment Variable Password Enforcement
    const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();

    if (!adminPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'ADMIN_PASSWORD environment variable is not set. Please configure ADMIN_PASSWORD in Vercel settings.'
        },
        { status: 500 }
      );
    }

    // 5. Constant-Time Timing Safe Password Comparison
    const isValid = timingSafeCompare((password || '').trim(), adminPassword);

    if (isValid) {
      const payload = `admin_shakibul_${Date.now()}`;
      const signedToken = generateSessionToken(payload);

      const response = NextResponse.json({ success: true, message: 'Admin authenticated successfully' });

      response.cookies.set('admin_session', signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 12 // 12 Hours
      });

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        message: `Invalid Admin Password. (${rateLimit.remaining} attempts remaining)`
      },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server security error' }, { status: 500 });
  }
}
