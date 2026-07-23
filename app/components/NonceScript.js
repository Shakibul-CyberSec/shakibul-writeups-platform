'use client';
import { useEffect } from 'react';

export default function NonceScript({ nonce }) {
  useEffect(() => {
    if (!nonce || typeof window === 'undefined') return;

    // 1. Automatically attach nonce to all dynamically created style & script elements
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName, options) {
      const el = originalCreateElement.call(document, tagName, options);
      const tag = (tagName || '').toLowerCase();
      if (tag === 'style' || tag === 'script') {
        el.setAttribute('nonce', nonce);
      }
      return el;
    };

    // 2. DOM Mutation Observer to strip unauthorized elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const tag = node.tagName.toLowerCase();
            if ((tag === 'script' || tag === 'style') && !node.getAttribute('nonce')) {
              node.setAttribute('nonce', nonce);
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [nonce]);

  return null;
}
