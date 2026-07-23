'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import CommentSection from '../../components/CommentSection';
import { FiArrowLeft, FiTag, FiClock, FiShield, FiAlertOctagon } from 'react-icons/fi';

export default function WriteupPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/writeups')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find(item => item.slug === params.id || item.id === params.id);
          setArticle(found || data[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center font-mono text-neon-cyan">
        Loading Technical Research Paper...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center space-y-4 font-mono text-white">
        <p>Article not found.</p>
        <Link href="/" className="text-neon-green hover:underline">Back to Writeups Feed</Link>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ThemeSwitcher />

      <main className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-mono text-cyber-gray hover:text-neon-cyan transition-colors mb-8"
        >
          <FiArrowLeft />
          <span>Back to All Writeups</span>
        </Link>

        {/* Article Header Card */}
        <div className="glass-card p-6 sm:p-8 space-y-6 mb-8 border border-cyber-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {article.category ? (
              <span className="px-3 py-1 rounded-md bg-neon-cyan/10 text-neon-cyan text-xs font-mono font-semibold border border-neon-cyan/30 flex items-center space-x-1">
                <FiTag className="text-xs" />
                <span>{article.category}</span>
              </span>
            ) : <div />}

            <div className="flex items-center space-x-3 text-xs font-mono text-cyber-gray">
              <span className="flex items-center space-x-1">
                <FiClock />
                <span>{article.readTime}</span>
              </span>
              <span>•</span>
              <span>{article.date}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-white leading-tight">
            {article.title}
          </h1>

          {/* Badges Bar (Only rendered if present) */}
          {(article.difficulty || article.cvss) && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {article.difficulty && (
                <span className="px-3 py-1 bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-mono rounded-lg flex items-center space-x-1.5 font-semibold">
                  <FiShield />
                  <span>Difficulty: {article.difficulty}</span>
                </span>
              )}
              {article.cvss && (
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono rounded-lg flex items-center space-x-1.5 font-semibold">
                  <FiAlertOctagon />
                  <span>{article.cvss}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Article Body Content */}
        <div className="glass-card p-6 sm:p-10 border border-cyber-border leading-relaxed">
          <MarkdownRenderer content={article.content} />
        </div>

        {/* Security Discussion & Peer Comments */}
        <CommentSection writeupId={article.id || params.id} />

      </main>
    </>
  );
}
