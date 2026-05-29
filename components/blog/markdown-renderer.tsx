import React from 'react';
import Image from 'next/image';
import { InlineProductCard, InlineProductBadge } from '@/components/ui/blog-client';
import { ReshapedProduct } from '@/types/shopify';

interface MarkdownRendererProps {
  content: string;
  productMap: Map<string, ReshapedProduct>;
}

const makeHeadingId = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export function MarkdownRenderer({ content, productMap }: MarkdownRendererProps) {
  // Pre-process raw string to normalize line endings
  const lines = content.replace(/\r/g, '').split('\n');
  const renderedElements: React.ReactNode[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (!line) {
      i++;
      continue;
    }

    // 1. Heading 1
    if (line.startsWith('# ')) {
      const text = line.substring(2);
      renderedElements.push(
        <h1 id={makeHeadingId(text)} key={i} className="font-headings text-3xl md:text-4xl font-black text-[#1B3A2D] leading-tight mt-12 mb-8 scroll-mt-24">
          {parseInline(text, productMap)}
        </h1>
      );
      i++;
      continue;
    }

    // 2. Heading 2
    if (line.startsWith('## ')) {
      const text = line.substring(3);
      renderedElements.push(
        <h2 id={makeHeadingId(text)} key={i} className="font-headings text-3xl md:text-[32px] font-black text-[#1B3A2D] leading-tight mt-12 mb-8 scroll-mt-24">
          {parseInline(text, productMap)}
        </h2>
      );
      i++;
      continue;
    }

    // 3. Heading 3
    if (line.startsWith('### ')) {
      const text = line.substring(4);
      renderedElements.push(
        <h3 id={makeHeadingId(text)} key={i} className="font-headings text-2xl font-black text-[#1B3A2D] mt-10 mb-6 scroll-mt-24">
          {parseInline(text, productMap)}
        </h3>
      );
      i++;
      continue;
    }

    // 4. Custom Product Bento Card shortcode block
    if (line.startsWith('[[product:') && line.endsWith(']]')) {
      const shortcodeMatch = line.match(/^\[\[product:([a-zA-Z0-9-_]+):card\]\]$/);
      if (shortcodeMatch) {
        const handle = shortcodeMatch[1];
        const product = productMap.get(handle);
        if (product) {
          renderedElements.push(<InlineProductCard key={i} product={product} />);
        }
      }
      i++;
      continue;
    }

    // 5. Blockquotes and Alerts
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      const fullText = quoteLines.join('\n');
      const alertMatch = fullText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*([\s\S]*)$/i);
      
      if (alertMatch) {
        const type = alertMatch[1].toUpperCase();
        const contentText = alertMatch[2].trim();
        
        let alertStyle = '';
        let emoji = '';
        let title = '';
        
        switch (type) {
          case 'NOTE':
            alertStyle = 'border-blue-200 bg-blue-50/30 text-blue-800';
            emoji = 'ℹ️';
            title = 'Note';
            break;
          case 'TIP':
            alertStyle = 'border-emerald-200 bg-emerald-50/30 text-emerald-800';
            emoji = '💡';
            title = 'Tip';
            break;
          case 'IMPORTANT':
            alertStyle = 'border-indigo-200 bg-indigo-50/30 text-indigo-800';
            emoji = '📌';
            title = 'Important';
            break;
          case 'WARNING':
            alertStyle = 'border-amber-200 bg-amber-50/30 text-amber-800';
            emoji = '⚠️';
            title = 'Warning';
            break;
          case 'CAUTION':
            alertStyle = 'border-rose-200 bg-rose-50/30 text-rose-800';
            emoji = '🚨';
            title = 'Caution';
            break;
        }
        
        renderedElements.push(
          <div key={i} className={`border-l-4 p-5 my-6 rounded-r-2xl backdrop-blur-sm shadow-sm border-t border-b border-r ${alertStyle}`}>
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-2 font-sans">
              <span>{emoji}</span>
              <span>{title}</span>
            </div>
            <div className="text-sm md:text-base leading-relaxed text-[#1B3A2D]/80 font-sans">
              {parseInline(contentText, productMap)}
            </div>
          </div>
        );
      } else {
        renderedElements.push(
          <blockquote key={i} className="border-l-4 border-[#C9972A] bg-[#FAF6EE]/40 px-6 py-4 my-6 rounded-r-2xl italic text-[#1B3A2D]/70 shadow-sm border-t border-b border-r border-[#C9972A]/10">
            {parseInline(quoteLines.join(' '), productMap)}
          </blockquote>
        );
      }
      continue;
    }

    // 6. Tables
    if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const isSeparator = /^\|?[\s-:\\|]+$/.test(tableLines[1]);
        if (isSeparator) {
          const headers = tableLines[0]
            .split('|')
            .map(h => h.trim())
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          
          const rows = tableLines.slice(2).map(rLine => {
            return rLine
              .split('|')
              .map(cell => cell.trim())
              .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          });

          renderedElements.push(
            <div key={i} className="my-8 overflow-x-auto rounded-sm border border-[#C9972A]/20 shadow-sm">
              <table className="w-full text-left border-collapse text-sm md:text-base">
                <thead>
                  <tr className="bg-[#1B3A2D]/5 border-b border-[#C9972A]/20">
                    {headers.map((header, hIdx) => (
                      <th key={hIdx} className="px-6 py-4 font-black text-[#1B3A2D] font-headings">
                        {parseInline(header, productMap)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C9972A]/10 bg-white/30">
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#FAF6EE]/50 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-6 py-4 text-[#1B3A2D]/80 leading-relaxed font-sans">
                          {parseInline(cell, productMap)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
      }
      continue;
    }

    // 7. Images
    if (line.startsWith('![') && line.endsWith(')')) {
      const match = line.match(/^!\[([\s\S]*?)\]\(([\s\S]+?)\)$/);
      if (match) {
        const alt = match[1] || 'Naaz Book Depot Article Illustration';
        const url = match[2];
        renderedElements.push(
          <figure key={i} className="my-8 flex flex-col items-center gap-3">
            <div className="relative w-full aspect-[16/9] max-h-[500px] rounded-sm overflow-hidden shadow-md border border-[#C9972A]/10">
              <Image 
                src={url}
                alt={alt}
                fill
                className="object-cover hover:scale-102 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
            {alt && (
              <figcaption className="text-xs md:text-sm text-[#1B3A2D]/60 font-sans italic text-center">
                {alt}
              </figcaption>
            )}
          </figure>
        );
      }
      i++;
      continue;
    }

    // 8. Lists (Unordered & Ordered)
    if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
      const isOrdered = /^\d+\.\s/.test(line);
      const listItems: string[] = [];
      
      while (i < lines.length) {
        const currentLine = lines[i].trim();
        if (currentLine.startsWith('- ') || currentLine.startsWith('* ')) {
          listItems.push(currentLine.substring(2));
          i++;
        } else if (/^\d+\.\s/.test(currentLine)) {
          listItems.push(currentLine.replace(/^\d+\.\s/, ''));
          i++;
        } else {
          break;
        }
      }

      if (isOrdered) {
        renderedElements.push(
          <ol key={i} className="list-decimal pl-6 space-y-4 my-8 text-lg leading-[1.85] text-[#1B3A2D]/80 font-sans">
            {listItems.map((item, idx) => (
              <li key={idx} className="pl-2">
                {parseInline(item, productMap)}
              </li>
            ))}
          </ol>
        );
      } else {
        renderedElements.push(
          <ul key={i} className="space-y-4 my-8 pl-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-4 text-lg leading-[1.85] text-[#1B3A2D]/80 font-sans">
                <div className="w-2 h-2 bg-[#C9972A] mt-2.5 shrink-0 rounded-full" />
                <span>{parseInline(item, productMap)}</span>
              </li>
            ))}
          </ul>
        );
      }
      continue;
    }

    // 9. Regular Paragraph (gather consecutive text lines to avoid multi-line split issues)
    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const currentLine = lines[i].trim();
      if (!currentLine) {
        break;
      }
      // If we hit a new element, stop building paragraph
      if (
        currentLine.startsWith('# ') ||
        currentLine.startsWith('## ') ||
        currentLine.startsWith('### ') ||
        currentLine.startsWith('>') ||
        currentLine.startsWith('|') ||
        currentLine.startsWith('- ') ||
        currentLine.startsWith('* ') ||
        /^\d+\.\s/.test(currentLine) ||
        (currentLine.startsWith('[[product:') && currentLine.endsWith(']]')) ||
        (currentLine.startsWith('![') && currentLine.endsWith(')'))
      ) {
        break;
      }
      paragraphLines.push(lines[i]);
      i++;
    }

    if (paragraphLines.length > 0) {
      renderedElements.push(
        <p key={i} className="text-lg leading-[1.85] text-[#1B3A2D]/80 mb-6 font-sans">
          {parseInline(paragraphLines.join(' '), productMap)}
        </p>
      );
    }
  }

  return (
    <div className="space-y-6">
      {renderedElements}
    </div>
  );
}

function parseInline(text: string, productMap: Map<string, ReshapedProduct>): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining) {
    const imgMatch = remaining.match(/^([\s\S]*?)!\[([\s\S]*?)\]\(([\s\S]+?)\)([\s\S]*)$/);
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([\s\S]+?)\*\*([\s\S]*)$/);
    const italicMatch = remaining.match(/^([\s\S]*?)\*([\s\S]+?)\*([\s\S]*)$/);
    const productMatch = remaining.match(/^([\s\S]*?)\[\[product:([a-zA-Z0-9-_]+):inline\]\]([\s\S]*)$/);
    const linkMatch = remaining.match(/^([\s\S]*?)\[([\s\S]+?)\]\(([\s\S]+?)\)([\s\S]*)$/);

    // Find the match that occurs earliest in the string
    let firstMatch: 'img' | 'bold' | 'italic' | 'link' | 'product' | null = null;
    let firstIdx = remaining.length;

    if (imgMatch && imgMatch[1].length < firstIdx) {
      firstIdx = imgMatch[1].length;
      firstMatch = 'img';
    }
    if (boldMatch && boldMatch[1].length < firstIdx) {
      firstIdx = boldMatch[1].length;
      firstMatch = 'bold';
    }
    if (italicMatch && italicMatch[1].length < firstIdx) {
      firstIdx = italicMatch[1].length;
      firstMatch = 'italic';
    }
    if (linkMatch && linkMatch[1].length < firstIdx) {
      firstIdx = linkMatch[1].length;
      firstMatch = 'link';
    }
    if (productMatch && productMatch[1].length < firstIdx) {
      firstIdx = productMatch[1].length;
      firstMatch = 'product';
    }

    if (firstMatch === 'img' && imgMatch) {
      if (imgMatch[1]) {
        tokens.push(<span key={keyIdx++}>{imgMatch[1]}</span>);
      }
      tokens.push(
        <span key={keyIdx++} className="inline-block relative align-middle max-w-full my-1 rounded-sm overflow-hidden border border-[#C9972A]/10 shadow-sm aspect-video h-32">
          <Image 
            src={imgMatch[3]} 
            alt={imgMatch[2]} 
            fill
            className="object-cover"
          />
        </span>
      );
      remaining = imgMatch[4];
    } else if (firstMatch === 'bold' && boldMatch) {
      if (boldMatch[1]) {
        tokens.push(<span key={keyIdx++}>{boldMatch[1]}</span>);
      }
      tokens.push(
        <strong key={keyIdx++} className="font-semibold text-[#1B3A2D] underline decoration-[#C9972A] decoration-2 underline-offset-4">
          {boldMatch[2]}
        </strong>
      );
      remaining = boldMatch[3];
    } else if (firstMatch === 'italic' && italicMatch) {
      if (italicMatch[1]) {
        tokens.push(<span key={keyIdx++}>{italicMatch[1]}</span>);
      }
      tokens.push(<em key={keyIdx++} className="italic text-[#1B3A2D]">{italicMatch[2]}</em>);
      remaining = italicMatch[3];
    } else if (firstMatch === 'link' && linkMatch) {
      if (linkMatch[1]) {
        tokens.push(<span key={keyIdx++}>{linkMatch[1]}</span>);
      }
      tokens.push(
        <a key={keyIdx++} href={linkMatch[3]} className="text-[#C9972A] hover:underline font-semibold transition-all">
          {linkMatch[2]}
        </a>
      );
      remaining = linkMatch[4];
    } else if (firstMatch === 'product' && productMatch) {
      if (productMatch[1]) {
        tokens.push(<span key={keyIdx++}>{productMatch[1]}</span>);
      }
      const handle = productMatch[2];
      const product = productMap.get(handle);
      if (product) {
        tokens.push(
          <InlineProductBadge key={keyIdx++} product={product} />
        );
      } else {
        tokens.push(<span key={keyIdx++}>{`[[product:${handle}:inline]]`}</span>);
      }
      remaining = productMatch[3];
    } else {
      tokens.push(<span key={keyIdx++}>{remaining}</span>);
      break;
    }
  }

  return tokens;
}
