'use client';
import { useState, useEffect } from 'react';
import { FiMessageSquare, FiSend, FiUser, FiShield, FiClock } from 'react-icons/fi';

export default function CommentSection({ writeupId }) {
  const [comments, setComments] = useState([]);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [hpField, setHpField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (!writeupId) return;
    fetch(`/api/comments?writeupId=${encodeURIComponent(writeupId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.comments)) {
          setComments(data.comments);
        }
      })
      .catch(() => {});
  }, [writeupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!author.trim() || !text.trim()) {
      setStatusMsg('Please provide your name and a comment.');
      return;
    }

    setIsSubmitting(true);
    setStatusMsg('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writeupId,
          author,
          text,
          hp_field: hpField
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg('✅ Comment posted securely!');
        setText('');
        if (data.comment) {
          setComments(prev => [data.comment, ...prev]);
        }
      } else {
        setStatusMsg(`❌ ${data.message || 'Failed to post comment.'}`);
      }
    } catch (err) {
      setStatusMsg('❌ Security network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to decode HTML entities for clean plain text node display in React
  const decodeEntities = (encodedString) => {
    if (!encodedString) return '';
    return encodedString
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#x5C;/g, '\\')
      .replace(/&#x60;/g, '`');
  };

  return (
    <div className="mt-12 glass-card p-6 sm:p-8 border border-cyber-border space-y-8">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-cyber-border/60 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
            <FiMessageSquare />
          </div>
          <h3 className="text-xl font-heading font-bold text-white">
            Security Discussion ({comments.length})
          </h3>
        </div>
        <div className="flex items-center space-x-1 text-xs font-mono text-neon-green">
          <FiShield />
          <span>Sanitized & Encoded</span>
        </div>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Hidden Honeypot Input Field */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="hp_field"
            tabIndex="-1"
            value={hpField}
            onChange={(e) => setHpField(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-sans text-cyber-gray">Your Name / Handle</label>
            <div className="relative flex items-center">
              <FiUser className="absolute left-3 text-cyber-gray text-xs" />
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={40}
                placeholder="e.g. Security Researcher"
                className="w-full pl-9 pr-4 py-2.5 bg-[#0a0d14] border border-[#1a2336] rounded-xl text-white font-sans text-xs focus:outline-none focus:border-neon-cyan transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-sans text-cyber-gray">Comment / Peer Analysis</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Share technical feedback, attack vectors, or remediation suggestions..."
            className="w-full p-3.5 bg-[#0a0d14] border border-[#1a2336] rounded-xl text-white font-sans text-xs focus:outline-none focus:border-neon-cyan transition-all resize-none custom-scrollbar"
            required
          />
          <div className="flex justify-end text-[10px] font-mono text-cyber-gray">
            {text.length} / 500 characters
          </div>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-sans text-xs">
            {statusMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-5 py-2.5 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-sans text-xs font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-neon-cyan/20 cursor-pointer disabled:opacity-50"
        >
          <FiSend />
          <span>{isSubmitting ? 'Posting Comment...' : 'Submit Peer Comment'}</span>
        </button>
      </form>

      {/* Comments List Feed */}
      <div className="space-y-4 pt-4 border-t border-cyber-border/40">
        {comments.map((c) => (
          <div key={c.id} className="p-4 bg-[#0a0d14] border border-[#1a2336] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-sans font-bold text-white flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-neon-green" />
                <span>{decodeEntities(c.author)}</span>
              </span>
              <span className="font-mono text-cyber-gray text-[11px] flex items-center space-x-1">
                <FiClock />
                <span>{c.date}</span>
              </span>
            </div>
            {/* Plain React Text String Node Output (Zero XSS) */}
            <p className="text-xs sm:text-sm font-sans text-cyber-gray leading-relaxed break-words">
              {decodeEntities(c.text)}
            </p>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-6 text-xs font-sans text-cyber-gray">
            No discussion comments yet. Be the first security researcher to analyze this writeup!
          </div>
        )}
      </div>

    </div>
  );
}
