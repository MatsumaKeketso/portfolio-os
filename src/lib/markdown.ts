// ─────────────────────────────────────────────────────────────────────────
// Minimal, safe Markdown → HTML for owner-authored project case studies.
//
// Scope: headings (#..###), bold, italic, inline code, fenced code blocks,
// links, images, unordered/ordered lists, blockquotes, horizontal rules, and
// paragraphs. It is intentionally small (no dependency) and defensive:
//   • The whole input is HTML-escaped FIRST, so any literal markup a user types
//     (e.g. <script>) is neutralised. Markdown syntax characters survive and
//     are then turned into a known, fixed set of safe tags.
//   • URLs in links/images are allow-listed (http(s), root-relative, data:image).
//
// Case-study content is admin-authored, but escaping keeps this safe regardless.
// ─────────────────────────────────────────────────────────────────────────

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const isSafeUrl = (url: string): boolean =>
  /^(https?:\/\/|\/|data:image\/)/i.test(url.trim());

/** Inline spans. Operates on already-HTML-escaped text. */
function renderInline(text: string): string {
  return text
    // images: ![alt](url) — before links
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt: string, url: string) =>
      isSafeUrl(url) ? `<img src="${url}" alt="${alt}" loading="lazy" />` : escapeHtml(alt))
    // links: [label](url)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) =>
      isSafeUrl(url) ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>` : label)
    // bold then italic then inline code
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/**
 * Render markdown to a safe HTML string (for dangerouslySetInnerHTML inside a
 * `.case-study-prose` container which styles the tags).
 */
export function renderMarkdown(src: string): string {
  if (!src || !src.trim()) return '';
  const escaped = escapeHtml(src.replace(/\r\n/g, '\n'));
  const lines = escaped.split('\n');
  const out: string[] = [];

  let i = 0;
  let listType: 'ul' | 'ol' | null = null;
  let paragraph: string[] = [];

  const closeList = () => {
    if (listType) { out.push(`</${listType}>`); listType = null; }
  };
  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Fenced code block ```
    if (trimmed.startsWith('```')) {
      flushParagraph(); closeList();
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1; // skip closing fence
      out.push(`<pre><code>${code.join('\n')}</code></pre>`);
      continue;
    }

    // Blank line — paragraph / list break
    if (!trimmed) { flushParagraph(); closeList(); i += 1; continue; }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph(); closeList(); out.push('<hr />'); i += 1; continue;
    }

    // Headings
    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushParagraph(); closeList();
      const level = Math.min(heading[1].length, 6);
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      i += 1; continue;
    }

    // Blockquote
    if (trimmed.startsWith('&gt;')) {
      flushParagraph(); closeList();
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('&gt;')) {
        quote.push(lines[i].trim().replace(/^&gt;\s?/, ''));
        i += 1;
      }
      out.push(`<blockquote>${renderInline(quote.join(' '))}</blockquote>`);
      continue;
    }

    // Lists (unordered - / * / +, ordered 1.)
    const ul = /^[-*+]\s+(.*)$/.exec(trimmed);
    const ol = /^\d+\.\s+(.*)$/.exec(trimmed);
    if (ul || ol) {
      flushParagraph();
      const wanted: 'ul' | 'ol' = ul ? 'ul' : 'ol';
      if (listType && listType !== wanted) closeList();
      if (!listType) { out.push(`<${wanted}>`); listType = wanted; }
      out.push(`<li>${renderInline((ul ? ul[1] : ol![1]))}</li>`);
      i += 1; continue;
    }

    // Standalone image line → block image
    if (/^!\[[^\]]*\]\([^)\s]+\)$/.test(trimmed)) {
      flushParagraph(); closeList();
      out.push(`<p>${renderInline(trimmed)}</p>`);
      i += 1; continue;
    }

    // Paragraph text
    closeList();
    paragraph.push(trimmed);
    i += 1;
  }

  flushParagraph();
  closeList();
  return out.join('\n');
}
