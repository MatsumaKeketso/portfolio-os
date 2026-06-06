import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type {
  TimelineEntry,
  TimelineEntryStatus,
  TimelineEntryType,
  TimelineEntrySource,
  ContentVisibility,
} from '../types';

// Single-document storage at os-site_content/timeline with an array under
// `data`, mirroring the Reads pattern. One read, one write — no per-entry
// docs (yet) since the working set is small.
const TIMELINE_DOC_PATH = ['os-site_content', 'timeline'] as const;

const VALID_TYPES: TimelineEntryType[] = [
  'win',
  'milestone',
  'system-update',
  'project-update',
  'idea',
  'research',
  'observation',
  'read',
  'media',
  'note',
];

const VALID_VISIBILITY: ContentVisibility[] = ['public', 'private', 'admin'];
const VALID_STATUS: TimelineEntryStatus[] = ['draft', 'published', 'archived'];
const VALID_SOURCE: TimelineEntrySource[] = ['manual', 'changelog', 'read', 'system', 'import'];

function normalizeEntry(raw: Partial<TimelineEntry> & { id?: string; title?: string }): TimelineEntry | null {
  if (!raw?.id || !raw.title) return null;

  const type = VALID_TYPES.includes(raw.type as TimelineEntryType)
    ? (raw.type as TimelineEntryType)
    : 'note';
  const visibility = VALID_VISIBILITY.includes(raw.visibility as ContentVisibility)
    ? (raw.visibility as ContentVisibility)
    : 'private';
  const status = VALID_STATUS.includes(raw.status as TimelineEntryStatus)
    ? (raw.status as TimelineEntryStatus)
    : 'published';
  const source = raw.source && VALID_SOURCE.includes(raw.source) ? raw.source : 'manual';

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? undefined,
    type,
    status,
    visibility,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : undefined,
    dateLabel: raw.dateLabel,
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t) => typeof t === 'string') : [],
    topicIds: Array.isArray(raw.topicIds) ? raw.topicIds : undefined,
    projectId: raw.projectId,
    appId: raw.appId,
    source,
    sourceId: raw.sourceId,
    media: Array.isArray(raw.media) ? raw.media : undefined,
    links: Array.isArray(raw.links) ? raw.links : undefined,
    metrics: Array.isArray(raw.metrics) ? raw.metrics : undefined,
    featured: raw.featured === true,
  };
}

export const fetchTimeline = async (): Promise<TimelineEntry[]> => {
  try {
    const snap = await getDoc(doc(db, ...TIMELINE_DOC_PATH));
    const raw = snap.exists() ? snap.data().data : [];
    if (!Array.isArray(raw)) return [];
    return raw
      .map((entry) => normalizeEntry(entry as Partial<TimelineEntry>))
      .filter((entry): entry is TimelineEntry => entry !== null)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('Failed to fetch timeline:', err);
    return [];
  }
};

export const saveTimeline = async (entries: TimelineEntry[]): Promise<void> => {
  await setDoc(doc(db, ...TIMELINE_DOC_PATH), {
    data: entries,
    updated_at: new Date().toISOString(),
  });
};

/**
 * Client-side visibility filter. The Firestore rules are still the source
 * of truth for what a given user CAN read; this just enforces what they
 * SHOULD see for the current role.
 *
 * - Superuser: everything (drafts, archived, private, admin).
 * - Everyone else: published + public only.
 */
export const filterTimelineByVisibility = (
  entries: TimelineEntry[],
  isSuperuser: boolean,
): TimelineEntry[] => {
  if (isSuperuser) return entries;
  return entries.filter(
    (e) => e.visibility === 'public' && (e.status ?? 'published') === 'published',
  );
};
