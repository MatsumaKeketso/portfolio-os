import type { ObservatoryTopic } from '../types';

// Observatory topics referenced by `timelineSeed.ts` via `topicIds`. Each
// topic mirrors the entries that point at it so the Observatory can render
// "related entries" without re-deriving the join at runtime.
export const observatorySeed: ObservatoryTopic[] = [
  {
    id: 'topic-genos-evolution',
    title: 'GenOS Evolution',
    summary: 'How GenOS grows from a portfolio surface into a living operating environment.',
    description:
      'Tracks the evolving identity, behavior model, and visual language of GenOS — every system update, IA decision, and direction shift that shapes what the OS is becoming.',
    status: 'active',
    tags: ['GenOS', 'System Design', 'Information Architecture'],
    relatedTimelineEntryIds: [
      'timeline-genos-product-mono-transition',
      'timeline-firebase-migration',
      'timeline-visitor-gallery-boundary',
      'timeline-mobile-capture-idea',
      'timeline-observatory-layer',
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    visibility: 'public',
  },
  {
    id: 'topic-product-design-systems',
    title: 'Product Design Systems',
    summary: 'Token discipline, layered primitives, and the cost of off-system decisions.',
    description:
      'How GenOS\'s design system is structured — primitive channels, semantic tokens, theme presets, and the contract every app must follow to stay coherent.',
    status: 'active',
    tags: ['Design System', 'Tokens', 'Product Mono', 'Tailwind'],
    relatedTimelineEntryIds: ['timeline-genos-product-mono-transition'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    visibility: 'public',
  },
  {
    id: 'topic-community-systems',
    title: 'Community as a Service',
    summary: 'Designing safe public participation surfaces inside a personal OS.',
    description:
      'Visitor Gallery, feedback, and other zones where unauthenticated guests can contribute — and the permission boundaries that keep contribution from leaking into protected territory.',
    status: 'watching',
    tags: ['Visitor Gallery', 'Permissions', 'Public Contribution'],
    relatedTimelineEntryIds: ['timeline-visitor-gallery-boundary'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
    visibility: 'public',
  },
  {
    id: 'topic-external-memory',
    title: 'Human Cognition and External Memory',
    summary: 'Tools that catch fleeting thought before it disappears.',
    description:
      'Mobile capture, low-friction note flows, and the Timeline/Observatory split — treating the OS as a second brain for ongoing work and ideas.',
    status: 'active',
    tags: ['External Memory', 'Capture', 'Second Brain', 'Mobile UX'],
    relatedTimelineEntryIds: [
      'timeline-mobile-capture-idea',
      'timeline-observatory-layer',
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    visibility: 'public',
  },
  {
    id: 'topic-ai-design-workflows',
    title: 'AI-Assisted Design Workflows',
    summary: 'Using AI tooling as a co-author for design system and app development.',
    description:
      'How AI assistance shapes GenOS\'s build cadence — what works in tight feedback loops, where it breaks down, and which decisions stay with the human.',
    status: 'active',
    tags: ['AI', 'Tooling', 'Design Workflows', 'Claude'],
    relatedTimelineEntryIds: ['timeline-observatory-layer'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    visibility: 'public',
  },
];
