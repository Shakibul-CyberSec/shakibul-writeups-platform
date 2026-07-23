# 🛡️ Shakibul Security Writeups & Research Platform (`writeups.shakibul.com`)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.11-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.7-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Upstash Redis](https://img.shields.io/badge/Upstash_Redis-Enabled-00E599?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

A high-performance, security-hardened **Technical Research & CTF Writeups Platform** with an authenticated **Graphical Live Split-Screen Markdown CMS**, persistent **Upstash Redis storage**, and an offensive-grade defense-in-depth security suite.

---

## 🌟 Key Features

* **📖 Public Security Research Feed & Reader**:
  * Live search bar, vulnerability category filters (*Web Security, Defensive Security, Application Security, CTF Walkthroughs*), and difficulty badges (*Beginner, Intermediate, Advanced, Hardcore*).
  * **HackerOne / GitHub Style Markdown Parser**: Converts headers, bold text, inline code badges, callout alerts, and code diff windows (`- vulnerable` / `+ remediated`).
  * **Multi-Spectrum Theme Switcher**: 4 persisted color themes (*Cyber Cyan, Matrix Emerald, Red Team Crimson, Deep Space Violet*).

* **🕵️ Secret Obfuscated Admin CMS Portal**:
  * Hidden from public GUI navigation.
  * **HMAC-SHA256 Signed Sessions**: Cryptographic cookie authentication (`admin_session`) with `HttpOnly`, `SameSite=Strict`, and `Secure` flags.
  * **Graphical Split-Screen Live Editor**: Real-time side-by-side preview with single-click snippet insert buttons (*Code Block*, *Vulnerability Diff*, *Warning Alert*).
  * **Zero-Blocking Publishing**: All metadata fields are optional. Leave fields empty and the platform will gracefully omit badges on the UI.

* **💬 Security-Hardened Peer Discussion Engine**:
  * **Zero Stored / Reflected / DOM XSS**: All author handles and comment texts undergo strict HTML entity encoding (`encodeHTMLEntities`) before storage and render exclusively as plain text React string nodes.
  * **Anti-Spam & Honeypot Bot Trap**: IP/Subnet rate limiting (Max 3 comments / 5 mins) + obfuscated honeypot field trapping.

---

## 🛡️ Defensive Security Architecture

| Security Layer | Implementation Details |
| :--- | :--- |
| **Content Security Policy (CSP)** | Dynamic cryptographic nonces (`x-nonce`) generated via `crypto.randomUUID()` per HTTP request. Enforces `script-src 'self' 'nonce-...' 'strict-dynamic'` and `style-src 'self' 'nonce-...'`. |
| **HTTP Security Headers** | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`. |
| **Anti-Brute Force Protection** | IP & Subnet rate limiting on admin login (Max 5 attempts per 15 mins) with timing-safe password comparison (`timingSafeCompare`). |
| **CSRF & Injection Protection** | Origin/Referer header validation + complete HTML entity encoding (`&lt;`, `&gt;`, `&amp;`, `&quot;`, `&#x27;`, `&#x2F;`, `&#x5C;`, `&#x60;`). |

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory (or configure in Vercel Project Settings):

```bash
# Admin Portal Authentication (REQUIRED)
ADMIN_PASSWORD=your_secure_admin_password_here
ADMIN_SESSION_SECRET=your_random_hmac_secret_key_here

# Upstash Redis Persistence (OPTIONAL - Memory fallback enabled if omitted)
KV_REST_API_URL=https://your-upstash-redis-url.upstash.io
KV_REST_API_TOKEN=your_upstash_rest_api_token
```

> ⚠️ **Note**: No secrets or passwords are hardcoded in the codebase. All authentication requires `process.env.ADMIN_PASSWORD`.

---

## 🚀 Getting Started Locally

### Prerequisites
* Node.js v18.0.0+ 
* npm v9.0.0+

### Installation & Execution

```bash
# 1. Clone the repository
git clone https://github.com/Shakibul-CyberSec/shakibul-writeups-platform.git
cd shakibul-writeups-platform

# 2. Install dependencies
npm install

# 3. Set environment variable & start local development server
ADMIN_PASSWORD=your_secret_password npm run dev -- -p 3005
```

Open [http://localhost:3005](http://localhost:3005) in your browser to view the application.

---

## 🛠️ Project Structure

```text
shakibul-writeups-platform/
├── app/
│   ├── api/
│   │   ├── admin/login/route.js     # Authenticated login & rate limiting
│   │   ├── admin/publish/route.js   # HMAC-verified writeup publisher
│   │   ├── comments/route.js        # Sanitized peer comment API
│   │   └── writeups/route.js        # Public research fetch API
│   ├── components/
│   │   ├── CommentSection.jsx       # Zero-XSS peer discussion component
│   │   ├── MarkdownRenderer.jsx     # HackerOne-style markdown parser
│   │   ├── Navbar.jsx               # Header navigation bar
│   │   ├── NonceScript.js           # CSP DOM observer
│   │   └── ThemeSwitcher.jsx        # Multi-spectrum color palette widget
│   ├── lib/
│   │   └── security.js              # Rate limiting, HMAC signing & HTML entity encoding
│   ├── portal-shakibul-cyber-cms/
│   │   ├── login/page.js            # Obfuscated admin login portal
│   │   └── editor/page.js           # Graphical split-screen CMS editor
│   ├── writeup/[id]/page.js         # Technical research reader view
│   ├── globals.css                  # Tailwind CSS v4 design tokens & spectrum themes
│   ├── layout.js                    # Root layout with CSP nonce support
│   └── page.js                      # Public writeups feed with live search
├── proxy.js                         # Edge Middleware for nonces & strict CSP
├── next.config.mjs                  # Security header fallback & Turbopack config
└── package.json
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

Developed with 💚 by **Shakibul Bokthiar**
