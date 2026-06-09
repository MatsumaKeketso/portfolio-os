export interface App {
  id: string;
  name: string;
  icon: string;
  customIcon?: string;
  type: 'component' | 'iframe' | 'static' | 'link';
  component?: string;
  url?: string;
  pinnedToTaskbar?: boolean;
  pinnedToDesktop?: boolean;
  desktopPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  description?: string;
  projectStatus?: 'live' | 'featured' | 'wip' | 'archived';
  tags?: string[];
  role?: string;
  year?: string;
  projectLinks?: {
    live?: string;
    github?: string;
    demo?: string;
  };
  media?: Array<{
    id: string;
    url: string;
    type: 'image' | 'video';
    name?: string;
  }>;
  surfaceMode?: 'content' | 'utilityDark' | 'immersive' | 'iframe' | 'glass';
  preferredWindowMode?: 'floating' | 'maximized' | 'fixed';
  mobileBehavior?: 'maximize' | 'fullscreen' | 'hide';
  minSize?: { width: number; height: number };
  // When true, opening this app with new fileData reuses the existing window
  // (updates fileId/file/title in place). Used for player UIs bound to a
  // singleton engine — Music is the current example.
  singleInstance?: boolean;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string;
  customIcon?: string;
  type: 'component' | 'iframe' | 'static';
  component?: string;
  url?: string;
  content?: string;
  fileId?: string;
  file?: FileItem;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  surfaceMode?: 'content' | 'utilityDark' | 'immersive' | 'iframe' | 'glass';
  minSize?: { width: number; height: number };
}

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'image' | 'video' | 'audio' | 'document';
  parentId: string | null;
  path: string;
  size?: number;
  content?: string;
  dataUrl?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  mimeType?: string;
  createdAt: number;
  modifiedAt: number;
  isProtected?: boolean;
  isVisitorOwned?: boolean;
  // Trash bookkeeping — set when the file is moved to Trash so it can be
  // restored to where it came from.
  previousParentId?: string | null;
  deletedAt?: number;
  // Case study — owner-authored portfolio detail for project folders inside
  // the Projects location. Markdown body + uploaded image URLs (Storage, not
  // base64). Rendered in the Projects side panel. See ProjectCaseStudyPanel.
  caseStudy?: ProjectCaseStudy;
}

export interface ProjectCaseStudy {
  /** Rich HTML body (authored in the Tiptap editor; sanitized on render). */
  html?: string;
  /** Legacy/plain markdown body — fallback render when `html` is absent. */
  markdown?: string;
  /** Optional one-line summary shown under the project title. */
  summary?: string;
  /** Optional cover image URL (Firebase Storage). */
  cover?: string;
  /** Uploaded gallery image URLs (Firebase Storage), referenced from markdown. */
  media?: string[];
  /** Optional external links (live site, repo, etc.). */
  links?: { label: string; url: string }[];
  updatedAt?: number;
}

export const VISITOR_GALLERY_ID = 'folder-visitor-gallery';
export const TRASH_FOLDER_ID = 'folder-trash';

export interface FileSystemState {
  files: FileItem[];
  currentPath: string[];
}

export interface ReadArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  imageUrl: string;
  imageAlt?: string;
  source?: string;
  hasSource?: boolean;
  categories: string[];
  content: string;
  html?: string;
  readingTimeMinutes: number;
  isDraft?: boolean;
}

// ---------------------------------------------------------------------------
// Timeline + Observatory
//
// Timeline is the event log ("what shipped, changed, or was captured").
// Observatory is the interpretation layer ("what is currently being thought
// about and connected"). The two share TimelineLink and TimelineMedia.
// ---------------------------------------------------------------------------

export type TimelineEntryType =
  | 'win'
  | 'milestone'
  | 'system-update'
  | 'project-update'
  | 'idea'
  | 'research'
  | 'observation'
  | 'read'
  | 'media'
  | 'note';

export type TimelineEntryStatus = 'draft' | 'published' | 'archived';

export type ContentVisibility = 'public' | 'private' | 'admin';

export type TimelineEntrySource = 'manual' | 'changelog' | 'read' | 'system' | 'import';

export interface TimelineMedia {
  id: string;
  type: 'image' | 'video';
  name: string;
  url: string;
  storagePath?: string;
  thumbnailUrl?: string;
  mimeType: string;
  size?: number;
  createdAt: number;
}

export interface TimelineLink {
  label: string;
  url: string;
  type?: 'external' | 'internal' | 'read' | 'project' | 'file';
}

export interface TimelineMetric {
  label: string;
  value: string;
}

export interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  type: TimelineEntryType;
  status?: TimelineEntryStatus;
  visibility: ContentVisibility;
  createdAt: number;
  updatedAt?: number;
  dateLabel?: string;
  tags: string[];
  topicIds?: string[];
  projectId?: string;
  appId?: string;
  source?: TimelineEntrySource;
  sourceId?: string;
  media?: TimelineMedia[];
  links?: TimelineLink[];
  metrics?: TimelineMetric[];
  // Editorial flag: when true, this entry is promoted as a "chapter" on the
  // horizontal Timeline tape — rendered larger and selected as the default
  // hero. Set explicitly by the author; not derived from type or size.
  featured?: boolean;
}

// ChangelogEntry — system-update records that can be imported into the
// Timeline. Stored at `os-site_content/changelog`. Mapping rules live in
// `src/store/timelineStore.ts::importChangelogEntries`.
export interface ChangelogEntry {
  id: string;
  title: string;
  description?: string;
  date?: number;
  tags?: string[];
  visibility?: ContentVisibility;
  // Free-form fields that don't impact the importer (kept for forward-compat)
  category?: string;
  links?: TimelineLink[];
}

export type ObservatoryTopicStatus = 'active' | 'watching' | 'paused' | 'archived';

export interface ObservatoryTopic {
  id: string;
  title: string;
  summary: string;
  description?: string;
  status: ObservatoryTopicStatus;
  tags: string[];
  relatedTimelineEntryIds?: string[];
  relatedReadSlugs?: string[];
  relatedAppIds?: string[];
  relatedLinks?: TimelineLink[];
  createdAt: number;
  updatedAt?: number;
  visibility: ContentVisibility;
}
