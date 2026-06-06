import type { TimelineEntry } from '../types';

export const timelineSeed: TimelineEntry[] = [
  {
    id: 'timeline-genos-product-mono-transition',
    title: 'Shifted GenOS toward Product Mono',
    description:
      'Refined the visual direction from a neon/cyber interface into a calmer product-grade operating system language with dark chrome, light work surfaces, compact rows, semantic tokens, and quieter interaction states.',
    type: 'system-update',
    status: 'published',
    visibility: 'public',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    tags: ['GenOS', 'Design System', 'Product Mono', 'UI Direction'],
    topicIds: ['topic-genos-evolution', 'topic-product-design-systems'],
    source: 'manual',
    metrics: [
      { label: 'Area', value: 'Design System' },
      { label: 'Impact', value: 'Visual consistency' }
    ]
  },
  {
    id: 'timeline-firebase-migration',
    title: 'Migrated GenOS persistence to Firebase',
    description:
      'Moved core backend behavior to Firebase Auth, Firestore, and Storage so apps, profile content, backgrounds, files, feedback, and system records can persist beyond local sessions.',
    type: 'system-update',
    status: 'published',
    visibility: 'public',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    tags: ['Firebase', 'Persistence', 'Storage', 'Firestore'],
    topicIds: ['topic-genos-evolution'],
    source: 'manual',
    featured: true,
    metrics: [
      { label: 'Backend', value: 'Firebase' },
      { label: 'Status', value: 'Migrated' }
    ]
  },
  {
    id: 'timeline-visitor-gallery-boundary',
    title: 'Defined Visitor Gallery as the public contribution zone',
    description:
      'Constrained visitor uploads to a dedicated Visitor Gallery space where guests can upload approved image files without touching protected system folders or owner-controlled assets.',
    type: 'system-update',
    status: 'published',
    visibility: 'public',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    tags: ['Visitor Gallery', 'Permissions', 'Public Uploads', 'Safety'],
    topicIds: ['topic-genos-evolution', 'topic-community-systems'],
    source: 'manual',
    metrics: [
      { label: 'Visitor uploads', value: 'Images only' },
      { label: 'Boundary', value: 'Public zone' }
    ]
  },
  {
    id: 'timeline-mobile-capture-idea',
    title: 'Identified mobile capture as the missing Timeline behavior',
    description:
      'Recognized that the Timeline should not only display progress, but make it easy to capture small wins, ideas, videos, photos, and system updates from a mobile device.',
    type: 'idea',
    status: 'published',
    visibility: 'public',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    tags: ['Timeline', 'Mobile UX', 'Capture Flow', 'Small Wins'],
    topicIds: ['topic-genos-evolution', 'topic-external-memory'],
    source: 'manual',
    metrics: [
      { label: 'Problem', value: 'Capture friction' },
      { label: 'Direction', value: 'Mobile-first form' }
    ]
  },
  {
    id: 'timeline-observatory-layer',
    title: 'Added Observatory concept to GenOS information architecture',
    description:
      'Defined Observatory as the thinking layer of GenOS: a place for active research, technology watchlists, current investigations, and connected ideas that are not yet finished projects.',
    type: 'milestone',
    status: 'published',
    visibility: 'public',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    tags: ['Observatory', 'Information Architecture', 'Research', 'Thinking Layer'],
    topicIds: ['topic-genos-evolution', 'topic-ai-design-workflows', 'topic-external-memory'],
    source: 'manual',
    featured: true,
    metrics: [
      { label: 'Layer', value: 'Thinking' },
      { label: 'Role', value: 'Interpretation' }
    ]
  }
];
