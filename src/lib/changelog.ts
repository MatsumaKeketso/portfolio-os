import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { ChangelogEntry, ContentVisibility } from '../types';

// Stored at os-site_content/changelog with the same single-doc + `data` array
// shape as reads / timeline / observatory. Read by the Admin Panel's
// changelog importer and (later) by the public changelog viewer.
const CHANGELOG_DOC_PATH = ['os-site_content', 'changelog'] as const;

const VALID_VISIBILITY: ContentVisibility[] = ['public', 'private', 'admin'];

function normalizeEntry(raw: Partial<ChangelogEntry>): ChangelogEntry | null {
  if (!raw?.id || !raw.title) return null;
  const visibility = raw.visibility && VALID_VISIBILITY.includes(raw.visibility)
    ? raw.visibility
    : 'public';
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    date: typeof raw.date === 'number' ? raw.date : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t) => typeof t === 'string') : undefined,
    visibility,
    category: raw.category,
    links: Array.isArray(raw.links) ? raw.links : undefined,
  };
}

export const fetchChangelog = async (): Promise<ChangelogEntry[]> => {
  try {
    const snap = await getDoc(doc(db, ...CHANGELOG_DOC_PATH));
    const raw = snap.exists() ? snap.data().data : [];
    if (!Array.isArray(raw)) return [];
    return raw
      .map((entry) => normalizeEntry(entry as Partial<ChangelogEntry>))
      .filter((entry): entry is ChangelogEntry => entry !== null)
      .sort((a, b) => (b.date ?? 0) - (a.date ?? 0));
  } catch (err) {
    console.error('Failed to fetch changelog:', err);
    return [];
  }
};

export const saveChangelog = async (entries: ChangelogEntry[]): Promise<void> => {
  await setDoc(doc(db, ...CHANGELOG_DOC_PATH), {
    data: entries,
    updated_at: new Date().toISOString(),
  });
};
