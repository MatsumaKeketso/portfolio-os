import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { fetchTimeline, saveTimeline, filterTimelineByVisibility } from '../lib/timeline';
import { fetchChangelog } from '../lib/changelog';
import { timelineSeed } from '../data/timelineSeed';
import type {
  ChangelogEntry,
  TimelineEntry,
  TimelineEntryType,
  TimelineEntrySource,
} from '../types';

const SUPERUSER_EMAIL = 'admin@os.com';
const canWrite = () => auth.currentUser?.email?.toLowerCase() === SUPERUSER_EMAIL;
const generateId = () => `timeline-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface TimelineStore {
  entries: TimelineEntry[];
  isLoading: boolean;
  error: string | null;

  loadTimeline: () => Promise<void>;
  resetToSeed: () => Promise<void>;

  addEntry: (input: Omit<TimelineEntry, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => TimelineEntry;
  updateEntry: (id: string, patch: Partial<TimelineEntry>) => void;
  removeEntry: (id: string) => void;
  archiveEntry: (id: string) => void;

  // Changelog import — used by the Admin Panel "Changelog → Timeline" action.
  // Idempotent: skips entries whose (source === 'changelog' && sourceId) is
  // already present in the timeline. Accepts ChangelogEntry shape from
  // `src/lib/changelog.ts`.
  importChangelogEntries: (changelog: ChangelogEntry[]) => { imported: number; skipped: number };

  // Convenience: fetch the changelog doc, then import it. Returns the same
  // counts as `importChangelogEntries`. Safe to call repeatedly — duplicate
  // protection lives in the inner method.
  importChangelogFromFirestore: () => Promise<{ imported: number; skipped: number }>;

  // Selectors
  getByType: (type: TimelineEntryType) => TimelineEntry[];
  getByTopic: (topicId: string) => TimelineEntry[];
  getPublic: () => TimelineEntry[];
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;
const queueSave = (entries: TimelineEntry[], setError: (e: string | null) => void) => {
  if (!canWrite()) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if (!canWrite()) return;
    try {
      await saveTimeline(entries);
      setError(null);
    } catch (e) {
      console.error('Failed to save timeline:', e);
      setError(e instanceof Error ? e.message : 'Failed to save timeline');
    }
  }, 800);
};

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  entries: [],
  isLoading: true,
  error: null,

  loadTimeline: async () => {
    set({ isLoading: true });
    const remote = await fetchTimeline();
    // Fall back to seed when the remote doc is empty so the app never shows a
    // blank state on first load (admins can publish/overwrite from there).
    const raw = remote.length > 0 ? remote : [...timelineSeed].sort((a, b) => b.createdAt - a.createdAt);
    // Apply role-aware visibility filter. Superuser sees drafts/private;
    // everyone else sees public+published only.
    const entries = filterTimelineByVisibility(raw, canWrite());
    set({ entries, isLoading: false, error: null });
  },

  resetToSeed: async () => {
    const entries = [...timelineSeed].sort((a, b) => b.createdAt - a.createdAt);
    set({ entries });
    if (canWrite()) {
      try {
        await saveTimeline(entries);
      } catch (e) {
        console.error('Failed to seed timeline:', e);
      }
    }
  },

  addEntry: (input) => {
    const entry: TimelineEntry = {
      id: input.id ?? generateId(),
      createdAt: input.createdAt ?? Date.now(),
      title: input.title,
      description: input.description,
      type: input.type,
      status: input.status ?? 'published',
      visibility: input.visibility,
      updatedAt: Date.now(),
      dateLabel: input.dateLabel,
      tags: input.tags ?? [],
      topicIds: input.topicIds,
      projectId: input.projectId,
      appId: input.appId,
      source: input.source ?? 'manual',
      sourceId: input.sourceId,
      media: input.media,
      links: input.links,
      metrics: input.metrics,
      featured: input.featured === true,
    };
    const next = [entry, ...get().entries].sort((a, b) => b.createdAt - a.createdAt);
    set({ entries: next });
    queueSave(next, (e) => set({ error: e }));
    return entry;
  },

  updateEntry: (id, patch) => {
    const next = get().entries.map((entry) =>
      entry.id === id ? { ...entry, ...patch, updatedAt: Date.now() } : entry,
    );
    set({ entries: next });
    queueSave(next, (e) => set({ error: e }));
  },

  removeEntry: (id) => {
    const next = get().entries.filter((entry) => entry.id !== id);
    set({ entries: next });
    queueSave(next, (e) => set({ error: e }));
  },

  archiveEntry: (id) => {
    get().updateEntry(id, { status: 'archived' });
  },

  importChangelogEntries: (changelog) => {
    const existing = get().entries;
    const seenSourceIds = new Set(
      existing
        .filter((e) => e.source === 'changelog' && e.sourceId)
        .map((e) => e.sourceId as string),
    );

    let imported = 0;
    let skipped = 0;
    const newOnes: TimelineEntry[] = [];
    const importSource: TimelineEntrySource = 'changelog';

    for (const item of changelog) {
      if (!item.id) {
        skipped += 1;
        continue;
      }
      if (seenSourceIds.has(item.id)) {
        skipped += 1;
        continue;
      }
      newOnes.push({
        id: generateId(),
        title: item.title,
        description: item.description,
        type: 'system-update',
        status: 'published',
        visibility: item.visibility ?? 'public',
        createdAt: item.date ?? Date.now(),
        updatedAt: Date.now(),
        tags: item.tags ?? [],
        source: importSource,
        sourceId: item.id,
      });
      imported += 1;
    }

    if (newOnes.length > 0) {
      const next = [...newOnes, ...existing].sort((a, b) => b.createdAt - a.createdAt);
      set({ entries: next });
      queueSave(next, (e) => set({ error: e }));
    }

    return { imported, skipped };
  },

  importChangelogFromFirestore: async () => {
    try {
      const entries = await fetchChangelog();
      if (entries.length === 0) return { imported: 0, skipped: 0 };
      return get().importChangelogEntries(entries);
    } catch (e) {
      console.error('Changelog import failed:', e);
      set({ error: e instanceof Error ? e.message : 'Changelog import failed' });
      return { imported: 0, skipped: 0 };
    }
  },

  getByType: (type) => get().entries.filter((entry) => entry.type === type),
  getByTopic: (topicId) =>
    get().entries.filter((entry) => entry.topicIds?.includes(topicId)),
  getPublic: () =>
    get().entries.filter(
      (entry) => entry.visibility === 'public' && (entry.status ?? 'published') === 'published',
    ),
}));
