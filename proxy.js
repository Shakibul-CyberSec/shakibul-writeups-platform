import { NextResponse } from 'next/server';

export async function proxy(request) {
  /* ---------- Generate Cryptographic Nonce ---------- */
  const nonce = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '')
    : Math.random().toString(36).substring(2) + Date.now().toString(36);

  /* ---------- Secret Admin Portal Route Guard ---------- */
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/portal-shakibul-cyber-cms/editor')) {
    const sessionCookie = request.cookies.get('admin_session');
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.redirect(new URL('/portal-shakibul-cyber-cms/login', request.url));
    }
  }

  const response = NextResponse.next();

  /* ---------- Strict Content Security Policy (CSP) Header ---------- */
  const isDev = process.env.NODE_ENV !== 'production';
  const scriptSrc = `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ''} https://challenges.cloudflare.com/turnstile/v0/api.js https://vercel.live;`;
  const styleSrc = `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com ${isDev ? "'unsafe-inline'" : ''};`;

  const cspHeader = `
    default-src 'self';
    ${scriptSrc}
    ${styleSrc}
    font-src 'self' data: https://fonts.gstatic.com;
    img-src 'self' data: blob: https:;
    connect-src 'self' https://challenges.cloudflare.com https://vercel.live;
    frame-src 'self' https://challenges.cloudflare.com https://vercel.live;
    frame-ancestors 'none';
    base-uri 'none';
    form-action 'self';
    object-src 'none';
  `
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('x-nonce', nonce);

  /* ---------- Defense-in-Depth Security Headers ---------- */
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), serial=(), hid=(), browsing-topics=()'
  );
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

export default proxy;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
