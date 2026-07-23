'use client';
import { useState } from 'react';
import { FiCopy, FiCheck, FiCode, FiAlertTriangle, FiInfo } from 'react-icons/fi';

export default function MarkdownRenderer({ content = '' }) {
  const parseMarkdown = (rawText) => {
    if (!rawText) return [];

    const lines = rawText.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle Code Block start/end ```
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Close Code Block
          elements.push({
            type: 'codeblock',
            lang: codeLanguage || 'code',
            code: codeLines.join('\n')
          });
          inCodeBlock = false;
          codeLines = [];
          codeLanguage = '';
        } else {
          // Start Code Block
          inCodeBlock = true;
          codeLanguage = line.trim().replace('```', '').trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      // Handle Headings #, ##, ###
      if (line.startsWith('### ')) {
        elements.push({ type: 'h3', text: line.replace('### ', '') });
      } else if (line.startsWith('## ')) {
        elements.push({ type: 'h2', text: line.replace('## ', '') });
      } else if (line.startsWith('# ')) {
        elements.push({ type: 'h1', text: line.replace('# ', '') });
      }
      // Handle Blockquotes / Alerts
      else if (line.startsWith('> [!WARNING]') || line.startsWith('> [!IMPORTANT]') || line.startsWith('> [!ALERT]')) {
        elements.push({ type: 'alert-warning', text: line.replace(/^>\s*\[![A-Z]+\]/, '').trim() });
      } else if (line.startsWith('> ')) {
        elements.push({ type: 'quote', text: line.replace('> ', '') });
      }
      // Handle Lists
      else if (/^\d+\.\s/.test(line.trim())) {
        elements.push({ type: 'ordered-item', text: line.trim().replace(/^\d+\.\s/, '') });
      } else if (/^[-*]\s/.test(line.trim())) {
        elements.push({ type: 'bullet-item', text: line.trim().replace(/^[-*]\s/, '') });
      }
      // Empty line
      else if (line.trim() === '') {
        elements.push({ type: 'spacer' });
      }
      // Regular Paragraph
      else {
        elements.push({ type: 'p', text: line });
      }
    }

    // Flush unclosed code block if any
    if (inCodeBlock && codeLines.length > 0) {
      elements.push({
        type: 'codeblock',
        lang: codeLanguage || 'code',
        code: codeLines.join('\n')
      });
    }

    return elements;
  };

  const renderInline = (text) => {
    if (!text) return '';

    // Convert **bold** -> <strong>
    // Convert `code` -> <code>
    const parts = [];
    let regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index));
      }

      const str = match[0];
      if (str.startsWith('**') && str.endsWith('**')) {
        parts.push(<strong key={match.index} className="text-white font-bold">{str.slice(2, -2)}</strong>);
      } else if (str.startsWith('`') && str.endsWith('`')) {
        parts.push(
          <code key={match.index} className="px-1.5 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-mono text-xs">
            {str.slice(1, -1)}
          </code>
        );
      } else if (str.startsWith('*') && str.endsWith('*')) {
        parts.push(<em key={match.index} className="text-cyber-gray italic">{str.slice(1, -1)}</em>);
      }

      lastIdx = regex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx));
    }

    return parts;
  };

  const parsed = parseMarkdown(content);

  return (
    <div className="space-y-4 text-cyber-gray font-sans text-sm sm:text-base leading-relaxed">
      {parsed.map((item, index) => {
        if (item.type === 'h1') {
          return (
            <h1 key={index} className="text-3xl font-heading font-extrabold text-white pt-6 pb-2 border-b border-cyber-border">
              {renderInline(item.text)}
            </h1>
          );
        }
        if (item.type === 'h2') {
          return (
            <h2 key={index} className="text-2xl font-heading font-bold text-white pt-5 pb-2 border-b border-cyber-border/60">
              {renderInline(item.text)}
            </h2>
          );
        }
        if (item.type === 'h3') {
          return (
            <h3 key={index} className="text-xl font-heading font-bold text-neon-cyan pt-4 pb-1">
              {renderInline(item.text)}
            </h3>
          );
        }
        if (item.type === 'codeblock') {
          return <CodeBlock key={index} code={item.code} lang={item.lang} />;
        }
        if (item.type === 'alert-warning') {
          return (
            <div key={index} className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-mono text-xs flex items-start space-x-3 my-4">
              <FiAlertTriangle className="text-lg shrink-0 mt-0.5 text-amber-400" />
              <div>{renderInline(item.text)}</div>
            </div>
          );
        }
        if (item.type === 'quote') {
          return (
            <blockquote key={index} className="p-4 bg-[#0d111c] border-l-4 border-neon-cyan rounded-r-xl text-cyber-gray font-mono text-xs my-3 italic">
              {renderInline(item.text)}
            </blockquote>
          );
        }
        if (item.type === 'ordered-item') {
          return (
            <div key={index} className="flex items-start space-x-2.5 pl-4 my-1">
              <span className="text-neon-green font-mono font-bold text-xs">▸</span>
              <div>{renderInline(item.text)}</div>
            </div>
          );
        }
        if (item.type === 'bullet-item') {
          return (
            <div key={index} className="flex items-start space-x-2.5 pl-4 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan mt-2 shrink-0" />
              <div>{renderInline(item.text)}</div>
            </div>
          );
        }
        if (item.type === 'spacer') {
          return <div key={index} className="h-2" />;
        }

        return <p key={index} className="leading-relaxed">{renderInline(item.text)}</p>;
      })}
    </div>
  );
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDiff = lang === 'diff';
  const lines = code.split('\n');

  return (
    <div className="my-6 bg-[#0a0d14] border border-[#1a2336] rounded-xl overflow-hidden shadow-2xl font-mono text-xs sm:text-sm">
      {/* Code Header Bar */}
      <div className="bg-[#111622] px-4 py-2.5 border-b border-[#1a2336] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          <span className="ml-2 text-cyber-gray uppercase text-[10px] tracking-wider font-bold flex items-center space-x-1.5">
            <FiCode className="text-neon-cyan" />
            <span>{lang || 'code'}</span>
          </span>
        </div>

        <button
          onClick={copyCode}
          className="flex items-center space-x-1.5 text-cyber-gray hover:text-white px-2.5 py-1 rounded bg-[#0a0d14] border border-[#1a2336] hover:border-neon-cyan/40 transition-colors text-[11px] cursor-pointer"
        >
          {copied ? (
            <>
              <FiCheck className="text-neon-green" />
              <span className="text-neon-green">Copied</span>
            </>
          ) : (
            <>
              <FiCopy />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Lines Container */}
      <div className="p-4 overflow-x-auto custom-scrollbar leading-relaxed">
        {lines.map((line, idx) => {
          let lineStyle = 'text-cyber-gray';
          let linePrefix = null;

          if (isDiff || line.startsWith('+ ') || line.startsWith('- ')) {
            if (line.startsWith('+ ')) {
              lineStyle = 'text-neon-green bg-neon-green/10 -mx-4 px-4 block border-l-2 border-neon-green';
            } else if (line.startsWith('- ')) {
              lineStyle = 'text-red-400 bg-red-500/10 -mx-4 px-4 block border-l-2 border-red-500';
            }
          }

          return (
            <div key={idx} className={lineStyle}>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}
