import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ReadArticle } from '../types';

const READS_DOC_PATH = ['os-site_content', 'reads'] as const;

const stripHtml = (value: string): string => {
  if (typeof document === 'undefined') {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const container = document.createElement('div');
  container.innerHTML = value;
  return (container.textContent || container.innerText || '').replace(/\s+/g, ' ').trim();
};

const estimateReadingTime = (html: string): number => {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

const parseCsv = (csvText: string): Record<string, string>[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);

  const headers = rows.shift()?.map((header) => header.trim()) ?? [];
  return rows.map((values) =>
    headers.reduce<Record<string, string>>((entry, header, index) => {
      entry[header] = values[index]?.trim() ?? '';
      return entry;
    }, {})
  );
};

const normalizeBoolean = (value: string | boolean | undefined): boolean => {
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes'].includes(String(value ?? '').trim().toLowerCase());
};

const normalizeCategories = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) return value;
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const sanitizeReadHtml = (html: string): string => {
  if (typeof document === 'undefined') return html;

  const template = document.createElement('template');
  template.innerHTML = html;

  template.content.querySelectorAll('script, style, noscript').forEach((node) => node.remove());

  template.content.querySelectorAll('*').forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith('on') || value.startsWith('javascript:')) {
        node.removeAttribute(attribute.name);
      }
    });
  });

  template.content.querySelectorAll('a').forEach((anchor) => {
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
  });

  template.content.querySelectorAll('iframe').forEach((iframe) => {
    const src = iframe.getAttribute('src') || '';
    const isAllowedVideo =
      src.startsWith('https://www.youtube.com/embed/') ||
      src.startsWith('https://youtube.com/embed/');

    if (!isAllowedVideo) {
      iframe.remove();
      return;
    }

    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allowfullscreen', 'true');
  });

  return template.innerHTML;
};

const normalizeRead = (value: Partial<ReadArticle>): ReadArticle | null => {
  if (!value.slug || !value.title) return null;

  const content = value.content || '';
  const categories = Array.isArray(value.categories) ? value.categories : [];

  return {
    id: value.id || value.slug,
    slug: value.slug,
    title: value.title,
    description: value.description || stripHtml(content).slice(0, 180),
    author: value.author || 'keketso',
    date: value.date || '',
    imageUrl: value.imageUrl || '',
    imageAlt: value.imageAlt || value.title,
    source: value.source || '',
    hasSource: Boolean(value.hasSource || value.source),
    categories,
    content,
    html: value.html || '',
    readingTimeMinutes: value.readingTimeMinutes || estimateReadingTime(content),
    isDraft: Boolean(value.isDraft),
  };
};

export const parseReadsCsv = (csvText: string): ReadArticle[] => {
  return parseCsv(csvText)
    .map((row) => {
      const content = row.Content || '';
      return normalizeRead({
        id: row.Slug,
        slug: row.Slug,
        title: row.Title,
        description: row.Description,
        author: row.Author,
        date: row.Date,
        imageUrl: row.Image,
        imageAlt: row['Image:alt'] || row.Title,
        source: row.Source,
        hasSource: normalizeBoolean(row['Has Source']) || Boolean(row.Source),
        categories: normalizeCategories(row.Categories),
        content,
        html: row.HTML,
        readingTimeMinutes: estimateReadingTime(content),
        isDraft: normalizeBoolean(row[':draft']),
      });
    })
    .filter((read): read is ReadArticle => read !== null);
};

export const mergeNewReadsBySlug = (existingReads: ReadArticle[], importedReads: ReadArticle[]) => {
  const existingSlugs = new Set(existingReads.map((read) => read.slug));
  const importedBySlug = new Map<string, ReadArticle>();

  for (const read of importedReads) {
    if (!read.slug || existingSlugs.has(read.slug) || importedBySlug.has(read.slug)) continue;
    importedBySlug.set(read.slug, read);
  }

  const newReads = Array.from(importedBySlug.values());
  const mergedReads = [...existingReads, ...newReads].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0;
    const bTime = b.date ? new Date(b.date).getTime() : 0;
    return bTime - aTime;
  });

  return {
    mergedReads,
    newReads,
    duplicateCount: importedReads.length - newReads.length,
  };
};

export const fetchReads = async (): Promise<ReadArticle[]> => {
  try {
    const docSnap = await getDoc(doc(db, ...READS_DOC_PATH));
    const rawReads = docSnap.exists() ? docSnap.data().data : [];
    if (!Array.isArray(rawReads)) return [];

    return rawReads
      .map((read) => normalizeRead(read as Partial<ReadArticle>))
      .filter((read): read is ReadArticle => read !== null)
      .filter((read) => !read.isDraft)
      .sort((a, b) => {
        const aTime = a.date ? new Date(a.date).getTime() : 0;
        const bTime = b.date ? new Date(b.date).getTime() : 0;
        return bTime - aTime;
      });
  } catch (error) {
    console.error('Failed to fetch reads:', error);
    return [];
  }
};
