'use client';
import Link from 'next/link';
import { FiShield, FiExternalLink } from 'react-icons/fi';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#07090e]/90 backdrop-blur-md border-b border-[#1a2336] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-neon-green/10 border border-neon-green/40 flex items-center justify-center text-neon-green group-hover:scale-105 transition-transform duration-300 shadow-md shadow-neon-green/10">
              <FiShield className="text-lg" />
            </div>
            <div>
              <div className="text-white font-heading font-bold text-base tracking-wide group-hover:text-neon-green transition-colors">
                SHAKIBUL <span className="text-neon-green">WRITEUPS</span>
              </div>
              <div className="text-[11px] font-sans text-cyber-gray">Security Research & Intelligence</div>
            </div>
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center space-x-3">
            <a
              href="https://shakibul.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border border-cyber-border text-cyber-gray hover:text-white hover:border-neon-green/40 font-sans text-xs font-semibold transition-all duration-300"
            >
              <span>Portfolio</span>
              <FiExternalLink className="text-xs" />
            </a>
          </div>

        </div>
      </div>
    </nav>
  );
}
