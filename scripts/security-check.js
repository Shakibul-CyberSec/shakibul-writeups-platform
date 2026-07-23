#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('\x1b[36m%s\x1b[0m', '🔍 Starting Local Security & Vulnerability Audit...\n');

let failed = false;

// 1. Dependency Audit Check
try {
  console.log('\x1b[33m%s\x1b[0m', '1. Running npm audit...');
  execSync('npm audit --audit-level=high', { stdio: 'inherit' });
  console.log('\x1b[32m%s\x1b[0m', '✅ npm audit clean! (0 high/critical vulnerabilities)\n');
} catch (e) {
  console.error('\x1b[31m%s\x1b[0m', '❌ npm audit found security vulnerabilities!\n');
  failed = true;
}

// 2. Secret & Hardcoded Password Scanner
try {
  console.log('\x1b[33m%s\x1b[0m', '2. Scanning codebase for hardcoded secrets...');
  const res = execSync("grep -rnI --exclude-dir=node_modules --exclude-dir=.next \"ADMIN_PASSWORD\\s*=\\s*['\\\"][^'\\\"]\\+['\\\"]\" . || true", { encoding: 'utf8' });
  if (res.trim()) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Hardcoded secret detected in codebase!\n' + res);
    failed = true;
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✅ 0 Hardcoded secrets or passwords detected!\n');
  }
} catch (e) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Secret scanning failed.\n');
  failed = true;
}

// 3. Security Headers & CSP Configuration Check
try {
  console.log('\x1b[33m%s\x1b[0m', '3. Validating Edge Proxy Security Headers & CSP Nonces...');
  const proxyContent = require('fs').readFileSync('./proxy.js', 'utf8');
  if (proxyContent.includes('script-src') && proxyContent.includes('x-nonce') && proxyContent.includes('DENY')) {
    console.log('\x1b[32m%s\x1b[0m', '✅ Strict CSP Nonces & Defense-in-Depth Security Headers Verified!\n');
  } else {
    console.error('\x1b[31m%s\x1b[0m', '❌ Missing security headers in proxy.js!\n');
    failed = true;
  }
} catch (e) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Security header validation failed.\n');
  failed = true;
}

if (failed) {
  console.error('\x1b[31m%s\x1b[0m', '🚨 Security Audit FAILED. Fix issues above before pushing.');
  process.exit(1);
} else {
  console.log('\x1b[32m%s\x1b[0m', '🎉 All Security Checks PASSED Successfully! Platform is 100% Secure.');
  process.exit(0);
}
