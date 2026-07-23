'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { FiEdit3, FiEye, FiSend, FiCode, FiAlertTriangle, FiFileText } from 'react-icons/fi';

export default function CMSPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Security');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [cvss, setCvss] = useState('7.5 HIGH');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState(`### Research Breakdown

Write security analysis here...

\`\`\`javascript
// Code block
\`\`\``);

  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const router = useRouter();

  const handleSnippetInsert = (snippetType) => {
    let snippet = '';
    if (snippetType === 'code') {
      snippet = `\n\`\`\`javascript\n// Code Snippet\nconsole.log("Hardened");\n\`\`\`\n`;
    } else if (snippetType === 'diff') {
      snippet = `\n\`\`\`diff\n- // Vulnerable\n+ // Remediated\n\`\`\`\n`;
    } else if (snippetType === 'alert') {
      snippet = `\n> [!WARNING]\n> Critical Vulnerability Notice\n\n`;
    }
    setContent(prev => prev + snippet);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setIsPublishing(true);
    setStatusMsg('');

    try {
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          difficulty,
          cvss,
          summary,
          content
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg('✅ Writeup Published Live!');
        setTimeout(() => {
          router.push(`/writeup/${data.article.id}`);
        }, 1200);
      } else {
        setStatusMsg(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      setStatusMsg('❌ Server network error.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <Navbar />
      <ThemeSwitcher />

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 text-neon-green font-mono text-xs uppercase tracking-widest">
              <FiEdit3 />
              <span>Graphical CMS Editor</span>
            </div>
            <h1 className="text-3xl font-heading font-bold text-white mt-1">Publish Research Writeup</h1>
          </div>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center space-x-2 px-6 py-3 bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green text-neon-green font-sans text-xs font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-neon-green/20 cursor-pointer disabled:opacity-50"
          >
            <FiSend />
            <span>{isPublishing ? 'Publishing...' : 'Publish Live Writeup'}</span>
          </button>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green font-sans text-xs text-center mb-6">
            {statusMsg}
          </div>
        )}

        {/* Metadata Controls Panel (All Optional) */}
        <div className="glass-card p-6 border border-cyber-border space-y-4 mb-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-sans text-cyber-gray">Article Title <span className="text-[10px] text-cyber-gray">(Optional)</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (Optional - Auto-generates if empty)"
                className="w-full px-4 py-2.5 bg-[#0a0d14] border border-[#1a2336] rounded-xl text-white font-sans text-xs focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-sans text-cyber-gray">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0a0d14] border border-[#1a2336] rounded-xl text-white font-sans text-xs outline-none"
                >
                  <option value="Web Security">Web Security</option>
                  <option value="Defensive Security">Defensive Security</option>
                  <option value="Application Security">Application Security</option>
                  <option value="CTF Walkthroughs">CTF Walkthroughs</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans text-cyber-gray">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0a0d14] border border-[#1a2336] rounded-xl text-white font-sans text-xs outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Hardcore">Hardcore</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans text-cyber-gray">CVSS Score</label>
                <input
                  type="text"
                  value={cvss}
                  onChange={(e) => setCvss(e.target.value)}
                  placeholder="7.5 HIGH"
                  className="w-full px-3 py-2.5 bg-[#0a0d14] border border-[#1a2336] rounded-xl text-white font-sans text-xs focus:outline-none focus:border-neon-cyan"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-sans text-cyber-gray">Short Summary <span className="text-[10px] text-cyber-gray">(Optional)</span></label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Summary (Optional - Auto-generates from content)"
              className="w-full px-4 py-2 bg-[#0a0d14] border border-[#1a2336] rounded-xl text-white font-sans text-xs focus:outline-none focus:border-neon-cyan"
            />
          </div>

        </div>

        {/* Markdown Toolbar */}
        <div className="flex items-center space-x-2 mb-3 bg-[#0d111c] p-2 rounded-xl border border-[#1a2336] overflow-x-auto">
          <span className="text-xs font-sans text-cyber-gray px-2">Quick Snippets:</span>
          <button
            onClick={() => handleSnippetInsert('code')}
            className="px-3 py-1 bg-cyber-border hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 text-xs font-mono rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <FiCode /> <span>Code Block</span>
          </button>
          <button
            onClick={() => handleSnippetInsert('diff')}
            className="px-3 py-1 bg-cyber-border hover:bg-neon-green/20 text-neon-green border border-neon-green/30 text-xs font-mono rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <FiFileText /> <span>Vulnerability Diff</span>
          </button>
          <button
            onClick={() => handleSnippetInsert('alert')}
            className="px-3 py-1 bg-cyber-border hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <FiAlertTriangle /> <span>Warning Alert</span>
          </button>
        </div>

        {/* Split-Screen Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Editor */}
          <div className="glass-card p-4 border border-cyber-border flex flex-col h-[550px]">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border text-xs font-sans text-cyber-gray">
              <span className="flex items-center space-x-1.5 text-neon-green font-bold">
                <FiEdit3 /> <span>Markdown Editor Source</span>
              </span>
              <span>Input</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full mt-3 bg-transparent text-white font-mono text-xs leading-relaxed focus:outline-none resize-none custom-scrollbar"
              placeholder="Write markdown content here..."
            />
          </div>

          {/* Right Live Preview */}
          <div className="glass-card p-4 border border-cyber-border flex flex-col h-[550px]">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border text-xs font-sans text-cyber-gray">
              <span className="flex items-center space-x-1.5 text-neon-cyan font-bold">
                <FiEye /> <span>Real-Time Graphical Preview</span>
              </span>
              <span>Rendered</span>
            </div>
            <div className="flex-1 overflow-y-auto mt-3 custom-scrollbar space-y-4">
              <h2 className="text-xl font-heading font-bold text-white">{title || 'Untitled Security Research Writeup'}</h2>
              <div className="flex space-x-2 font-mono text-[10px]">
                <span className="px-2 py-0.5 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 rounded">{category}</span>
                <span className="px-2 py-0.5 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded">{difficulty}</span>
              </div>
              <div className="bg-[#0a0d14] p-4 rounded-xl border border-[#1a2336]">
                <MarkdownRenderer content={content} />
              </div>
            </div>
          </div>

        </div>

      </main>
    </>
  );
}
