import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { fetchObservatory, saveObservatory, filterObservatoryByVisibility } from '../lib/observatory';
import { observatorySeed } from '../data/observatorySeed';
import type { ObservatoryTopic, ObservatoryTopicStatus } from '../types';

const SUPERUSER_EMAIL = 'admin@os.com';
const canWrite = () => auth.currentUser?.email?.toLowerCase() === SUPERUSER_EMAIL;
const generateId = () => `topic-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface ObservatoryStore {
  topics: ObservatoryTopic[];
  isLoading: boolean;
  error: string | null;

  loadObservatory: () => Promise<void>;
  resetToSeed: () => Promise<void>;

  addTopic: (input: Omit<ObservatoryTopic, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => ObservatoryTopic;
  updateTopic: (id: string, patch: Partial<ObservatoryTopic>) => void;
  removeTopic: (id: string) => void;
  setTopicStatus: (id: string, status: ObservatoryTopicStatus) => void;

  // Mutations for the entry/topic join
  attachTimelineEntry: (topicId: string, entryId: string) => void;
  detachTimelineEntry: (topicId: string, entryId: string) => void;

  // Selectors
  getById: (id: string) => ObservatoryTopic | undefined;
  getActive: () => ObservatoryTopic[];
  getPublic: () => ObservatoryTopic[];
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;
const queueSave = (topics: ObservatoryTopic[], setError: (e: string | null) => void) => {
  if (!canWrite()) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if (!canWrite()) return;
    try {
      await saveObservatory(topics);
      setError(null);
    } catch (e) {
      console.error('Failed to save observatory:', e);
      setError(e instanceof Error ? e.message : 'Failed to save observatory');
    }
  }, 800);
};

export const useObservatoryStore = create<ObservatoryStore>((set, get) => ({
  topics: [],
  isLoading: true,
  error: null,

  loadObservatory: async () => {
    set({ isLoading: true });
    const remote = await fetchObservatory();
    const raw = remote.length > 0 ? remote : [...observatorySeed];
    const topics = filterObservatoryByVisibility(raw, canWrite());
    set({ topics, isLoading: false, error: null });
  },

  resetToSeed: async () => {
    set({ topics: [...observatorySeed] });
    if (canWrite()) {
      try {
        await saveObservatory(observatorySeed);
      } catch (e) {
        console.error('Failed to seed observatory:', e);
      }
    }
  },

  addTopic: (input) => {
    const topic: ObservatoryTopic = {
      id: input.id ?? generateId(),
      createdAt: input.createdAt ?? Date.now(),
      title: input.title,
      summary: input.summary,
      description: input.description,
      status: input.status,
      tags: input.tags,
      relatedTimelineEntryIds: input.relatedTimelineEntryIds,
      relatedReadSlugs: input.relatedReadSlugs,
      relatedAppIds: input.relatedAppIds,
      relatedLinks: input.relatedLinks,
      updatedAt: Date.now(),
      visibility: input.visibility,
    };
    const next = [topic, ...get().topics];
    set({ topics: next });
    queueSave(next, (e) => set({ error: e }));
    return topic;
  },

  updateTopic: (id, patch) => {
    const next = get().topics.map((t) =>
      t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t,
    );
    set({ topics: next });
    queueSave(next, (e) => set({ error: e }));
  },

  removeTopic: (id) => {
    const next = get().topics.filter((t) => t.id !== id);
    set({ topics: next });
    queueSave(next, (e) => set({ error: e }));
  },

  setTopicStatus: (id, status) => {
    get().updateTopic(id, { status });
  },

  attachTimelineEntry: (topicId, entryId) => {
    const topic = get().topics.find((t) => t.id === topicId);
    if (!topic) return;
    const current = topic.relatedTimelineEntryIds ?? [];
    if (current.includes(entryId)) return;
    get().updateTopic(topicId, { relatedTimelineEntryIds: [...current, entryId] });
  },

  detachTimelineEntry: (topicId, entryId) => {
    const topic = get().topics.find((t) => t.id === topicId);
    if (!topic) return;
    const current = topic.relatedTimelineEntryIds ?? [];
    const next = current.filter((id) => id !== entryId);
    if (next.length === current.length) return;
    get().updateTopic(topicId, { relatedTimelineEntryIds: next });
  },

  getById: (id) => get().topics.find((t) => t.id === id),
  getActive: () => get().topics.filter((t) => t.status === 'active'),
  getPublic: () => get().topics.filter((t) => t.visibility === 'public'),
}));
