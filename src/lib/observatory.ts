import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type {
  ObservatoryTopic,
  ObservatoryTopicStatus,
  ContentVisibility,
} from '../types';

const OBSERVATORY_DOC_PATH = ['os-site_content', 'observatory'] as const;

const VALID_STATUS: ObservatoryTopicStatus[] = ['active', 'watching', 'paused', 'archived'];
const VALID_VISIBILITY: ContentVisibility[] = ['public', 'private', 'admin'];

function normalizeTopic(raw: Partial<ObservatoryTopic>): ObservatoryTopic | null {
  if (!raw?.id || !raw.title) return null;

  const status = VALID_STATUS.includes(raw.status as ObservatoryTopicStatus)
    ? (raw.status as ObservatoryTopicStatus)
    : 'active';
  const visibility = VALID_VISIBILITY.includes(raw.visibility as ContentVisibility)
    ? (raw.visibility as ContentVisibility)
    : 'private';

  return {
    id: raw.id,
    title: raw.title,
    summary: raw.summary ?? '',
    description: raw.description ?? undefined,
    status,
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t) => typeof t === 'string') : [],
    relatedTimelineEntryIds: Array.isArray(raw.relatedTimelineEntryIds) ? raw.relatedTimelineEntryIds : undefined,
    relatedReadSlugs: Array.isArray(raw.relatedReadSlugs) ? raw.relatedReadSlugs : undefined,
    relatedAppIds: Array.isArray(raw.relatedAppIds) ? raw.relatedAppIds : undefined,
    relatedLinks: Array.isArray(raw.relatedLinks) ? raw.relatedLinks : undefined,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : undefined,
    visibility,
  };
}

export const fetchObservatory = async (): Promise<ObservatoryTopic[]> => {
  try {
    const snap = await getDoc(doc(db, ...OBSERVATORY_DOC_PATH));
    const raw = snap.exists() ? snap.data().data : [];
    if (!Array.isArray(raw)) return [];
    return raw
      .map((topic) => normalizeTopic(topic as Partial<ObservatoryTopic>))
      .filter((topic): topic is ObservatoryTopic => topic !== null);
  } catch (err) {
    console.error('Failed to fetch observatory:', err);
    return [];
  }
};

export const saveObservatory = async (topics: ObservatoryTopic[]): Promise<void> => {
  await setDoc(doc(db, ...OBSERVATORY_DOC_PATH), {
    data: topics,
    updated_at: new Date().toISOString(),
  });
};

/**
 * Client-side visibility filter. Mirrors `filterTimelineByVisibility`.
 * Superuser sees archived/private; everyone else sees public-only.
 */
export const filterObservatoryByVisibility = (
  topics: ObservatoryTopic[],
  isSuperuser: boolean,
): ObservatoryTopic[] => {
  if (isSuperuser) return topics;
  return topics.filter((t) => t.visibility === 'public' && t.status !== 'archived');
};
