'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import ThemeSwitcher from './components/ThemeSwitcher';
import { FiSearch, FiBookOpen, FiArrowRight, FiShield, FiTag, FiClock } from 'react-icons/fi';

export default function Home() {
  const [writeups, setWriteups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetch('/api/writeups')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWriteups(data);
      })
      .catch(() => {});
  }, []);

  const categories = ['All', 'Web Security', 'Defensive Security', 'Application Security', 'CTF Walkthroughs'];

  const filteredWriteups = writeups.filter(w => {
    const matchesCategory = selectedCategory === 'All' || w.category === selectedCategory;
    const matchesSearch = w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Navbar />
      <ThemeSwitcher />

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 my-12">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green font-mono text-xs uppercase tracking-wider font-semibold">
            <FiShield className="animate-pulse" />
            <span>Cybersecurity Intelligence Hub</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold tracking-tight text-white leading-tight">
            Security Technical <span className="text-neon-cyan">Writeups & Research</span>
          </h1>

          <p className="text-cyber-gray max-w-2xl mx-auto font-sans text-base sm:text-lg leading-relaxed">
            In-depth security analysis, penetration testing walkthroughs, vulnerability proofs, and edge defensive architecture by Shakibul Bokthiar.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto pt-4 relative">
            <div className="relative flex items-center">
              <FiSearch className="absolute left-4 text-cyber-gray text-lg" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search writeups, CVEs, OWASP vulnerabilities..."
                className="w-full pl-12 pr-4 py-3.5 bg-[#0d111c] border border-[#1a2336] rounded-xl text-white font-sans text-sm focus:outline-none focus:border-neon-cyan transition-all duration-300 shadow-xl placeholder:text-cyber-gray"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl font-sans text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-neon-green/20 border border-neon-green text-neon-green shadow-md shadow-neon-green/10'
                  : 'bg-[#0d111c] border border-[#1a2336] text-cyber-gray hover:text-white hover:border-cyber-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Writeups Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWriteups.map((w) => (
            <Link
              key={w.id}
              href={`/writeup/${w.slug || w.id}`}
              className="glass-card p-6 flex flex-col justify-between group cursor-pointer border border-cyber-border hover:border-neon-cyan/50"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {w.category ? (
                    <span className="px-2.5 py-1 rounded-md bg-neon-cyan/10 text-neon-cyan text-xs font-mono font-semibold border border-neon-cyan/30 flex items-center space-x-1">
                      <FiTag className="text-[10px]" />
                      <span>{w.category}</span>
                    </span>
                  ) : <div />}
                  <span className="text-xs font-mono text-cyber-gray">{w.date}</span>
                </div>

                <h2 className="text-lg font-heading text-white font-bold group-hover:text-neon-cyan transition-colors duration-300 leading-snug">
                  {w.title}
                </h2>

                <p className="text-xs sm:text-sm font-sans text-cyber-gray leading-relaxed line-clamp-3">
                  {w.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-cyber-border/40 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-3">
                  {w.difficulty && (
                    <span className="text-neon-green font-semibold">{w.difficulty}</span>
                  )}
                  <span className="text-cyber-gray flex items-center space-x-1">
                    <FiClock />
                    <span>{w.readTime || '5 min'}</span>
                  </span>
                </div>
                <span className="text-neon-cyan flex items-center space-x-1 group-hover:translate-x-1 transition-transform font-bold">
                  <span>Read</span>
                  <FiArrowRight />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredWriteups.length === 0 && (
          <div className="text-center py-16 space-y-3 font-sans">
            <FiBookOpen className="mx-auto text-4xl text-cyber-gray" />
            <p className="text-white text-base font-semibold">No writeups matched your search query.</p>
            <p className="text-cyber-gray text-xs">Try searching for broader terms like "XSS", "CSP", or "Rate Limit".</p>
          </div>
        )}

      </main>
    </>
  );
}
