import { uploadFile, deleteFile, getFilePathFromUrl, type UploadProgress } from './uploadUtils';
import type { TimelineMedia } from '../types';

// Storage folder conventions from the Timeline spec. Keep these literal —
// the Firebase Storage rules reference them by exact prefix.
export const TIMELINE_MEDIA_FOLDER = 'timeline-media';
export const OBSERVATORY_MEDIA_FOLDER = 'observatory-media';

// Per-spec size limits. Keep image small (mobile capture flows produce ~5MB
// max from compressed JPEGs); video is intentionally capped at 25MB so we
// don't have to deal with chunked/HLS uploads in v1.
export const TIMELINE_IMAGE_MAX_MB = 5;
export const TIMELINE_VIDEO_MAX_MB = 25;
export const TIMELINE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const TIMELINE_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export interface MediaUploadResult {
  media?: TimelineMedia;
  error?: string;
}

interface MediaUploadOptions {
  /** Override the default folder (timeline-media). Use OBSERVATORY_MEDIA_FOLDER for topics. */
  folder?: string;
  onProgress?: (progress: UploadProgress) => void;
}

const inferMediaType = (file: File): 'image' | 'video' | null => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return null;
};

/**
 * Upload a single image/video for Timeline (or Observatory).
 *
 * Returns a normalized `TimelineMedia` ready to push into the entry's
 * `media[]` array. Inserts no DB writes itself — the caller decides how to
 * persist the metadata.
 *
 * On failure the result has only `error` set; nothing is uploaded.
 */
export const uploadTimelineMedia = async (
  file: File,
  options: MediaUploadOptions = {},
): Promise<MediaUploadResult> => {
  const kind = inferMediaType(file);
  if (!kind) {
    return { error: `Unsupported file type: ${file.type}. Allowed: image/* or video/*` };
  }

  const isImage = kind === 'image';
  const maxSizeMB = isImage ? TIMELINE_IMAGE_MAX_MB : TIMELINE_VIDEO_MAX_MB;
  const allowedTypes = isImage ? TIMELINE_IMAGE_TYPES : TIMELINE_VIDEO_TYPES;
  const folder = options.folder ?? TIMELINE_MEDIA_FOLDER;

  const result = await uploadFile(file, {
    folder,
    maxSizeMB,
    allowedTypes,
    generateUniqueName: true,
    onProgress: options.onProgress,
  });

  if (!result.url || result.error) {
    return { error: result.error || 'Upload failed' };
  }

  const storagePath = getFilePathFromUrl(result.url) ?? undefined;
  const media: TimelineMedia = {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: kind,
    name: file.name,
    url: result.url,
    storagePath,
    mimeType: file.type,
    size: file.size,
    createdAt: Date.now(),
  };
  return { media };
};

/**
 * Upload several Timeline media files in parallel and collect results.
 * Failures don't abort the batch — each result carries its own `error`.
 */
export const uploadTimelineMediaBatch = async (
  files: File[],
  options: MediaUploadOptions = {},
): Promise<MediaUploadResult[]> => {
  return Promise.all(files.map((file) => uploadTimelineMedia(file, options)));
};

/**
 * Delete a Timeline media asset from Storage. Caller is responsible for
 * also removing the metadata reference from the entry's `media[]` array.
 */
export const deleteTimelineMedia = async (
  media: TimelineMedia,
): Promise<{ success: boolean; error?: string }> => {
  const path = media.storagePath || (media.url ? getFilePathFromUrl(media.url) : null);
  if (!path) return { success: false, error: 'No storage path on media record' };
  return deleteFile(path);
};
