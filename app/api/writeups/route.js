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

const defaultWriteups = [
  {
    id: 'edge-subnet-shadow-ban',
    slug: 'edge-subnet-shadow-ban',
    title: 'Edge-Level Subnet Shadow-Banning & Lazy Storage Mechanics',
    category: 'Defensive Security',
    difficulty: 'Advanced',
    cvss: '8.8 HIGH',
    date: '2026-07-15',
    readTime: '6 min read',
    summary: 'How lazy subnet tracking and persistent Upstash Redis stores allow silent bot mitigation without leaking memory in serverless runtimes.',
    content: `### Abstract & Architecture
Generic rate limiters rely on individual IP addresses. Modern automated scrapers bypass basic IP limits by rotating through residential IP subnets. 

This research paper details our custom Edge Proxy (\`proxy.js\`) implementation:
1. **Subnet Mask Aggregation**: IP addresses are aggregated into \`/24\` subnets.
2. **Adaptive Escalation**: Request windows automatically contract when abuse patterns trigger.
3. **Silent Shadow Banning**: Suspicious clients receive a mock \`200 OK\` HTTP status while their actual payload processing is safely aborted at the edge.

\`\`\`javascript
// Lazy-evaluated subnet memory cleanup (Serverless Safe)
if (now - lastCleanup > CLEANUP_INTERVAL) {
  subnetStore.clearStaleEntries(now);
}
\`\`\``
  },
  {
    id: 'dynamic-csp-nonce-verification',
    slug: 'dynamic-csp-nonce-verification',
    title: 'Dynamic CSP Nonce Injection & Runtime Script Verification in Next.js 16',
    category: 'Web Security',
    difficulty: 'Intermediate',
    cvss: '7.5 HIGH',
    date: '2026-06-28',
    readTime: '8 min read',
    summary: 'Preventing Cross-Site Scripting (XSS) using dynamic cryptographic nonces and runtime DOM script observers.',
    content: `### Content Security Policy (CSP) Design
Inline script execution remains one of the top attack vectors for Stored and Reflected XSS.

Our implementation:
1. Generates a unique, cryptographically random base64 **nonce** per HTTP request.
2. Injects the nonce header into the server response layout.
3. Enforces strict \`script-src 'nonce-...' 'strict-dynamic'\` policies, invalidating unauthorized inline injections.
4. Uses a lightweight Mutation Observer (\`NonceScript.js\`) to strip unauthorized dynamic \`<script>\` elements immediately upon DOM insertion.`
  },
  {
    id: 'multi-signal-bot-risk-scoring',
    slug: 'multi-signal-bot-risk-scoring',
    title: 'Multi-Signal Risk Scoring Algorithms for Form Abuse Mitigation',
    category: 'Application Security',
    difficulty: 'Intermediate',
    cvss: '6.5 MEDIUM',
    date: '2026-05-12',
    readTime: '5 min read',
    summary: 'Building a multi-vector bot mitigation pipeline combining Cloudflare Turnstile, FingerprintJS, honeypots, and payload signature caching.',
    content: `### Multi-Vector Risk Score Algorithm
Rather than blocking legitimate users with repetitive CAPTCHA challenges, our backend (\`app/api/SendEmail/route.js\`) calculates a dynamic **Risk Score** ($0 - 100$):

* **Time-on-Page Check**: Submissions under 3.0 seconds add $+40$ risk points (bot autofill).
* **Obfuscated Honeypot**: Hidden \`.hp-trap\` field triggers immediate shadow-ban.
* **Payload Hash Caching**: Message contents are hashed with SHA-256 and stored in Upstash Redis to prevent repeat spam.`
  }
];

export async function GET() {
  try {
    if (kv) {
      const storedData = await kv.get('shakibul:writeups');
      if (storedData && Array.isArray(storedData) && storedData.length > 0) {
        return NextResponse.json(storedData);
      }
    }
    return NextResponse.json(defaultWriteups);
  } catch (error) {
    return NextResponse.json(defaultWriteups);
  }
}
