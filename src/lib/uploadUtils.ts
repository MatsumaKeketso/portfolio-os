import { supabase } from './supabase';

export interface UploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export interface UploadOptions {
  bucket?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  generateUniqueName?: boolean;
  onProgress?: (progress: UploadProgress) => void;
}

const DEFAULT_BUCKET = 'portfolio-files';
const DEFAULT_MAX_SIZE_MB = 10;
const DEFAULT_ALLOWED_TYPES = ['image/*', 'video/*'];

/**
 * Validates a file before upload
 */
export const validateFile = (
  file: File,
  options: UploadOptions = {}
): { valid: boolean; error?: string } => {
  const maxSize = (options.maxSizeMB || DEFAULT_MAX_SIZE_MB) * 1024 * 1024;
  const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_TYPES;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${options.maxSizeMB || DEFAULT_MAX_SIZE_MB}MB`,
    };
  }

  // Check file type
  const fileType = file.type;
  const isAllowed = allowedTypes.some((allowedType) => {
    if (allowedType.endsWith('/*')) {
      const prefix = allowedType.slice(0, -2);
      return fileType.startsWith(prefix);
    }
    return fileType === allowedType;
  });

  if (!isAllowed) {
    return {
      valid: false,
      error: `File type ${fileType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Uploads a file to Supabase storage with progress tracking
 */
export const uploadFile = async (
  file: File,
  options: UploadOptions = {}
): Promise<{ url: string; error?: string }> => {
  const bucket = options.bucket || DEFAULT_BUCKET;
  const generateUniqueName = options.generateUniqueName !== false; // default true

  // Validate file
  const validation = validateFile(file, options);
  if (!validation.valid) {
    options.onProgress?.({
      fileName: file.name,
      progress: 0,
      status: 'error',
      error: validation.error,
    });
    return { url: '', error: validation.error };
  }

  // Generate file name
  const fileName = generateUniqueName
    ? `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.name}`
    : file.name;

  try {
    // Notify start
    options.onProgress?.({
      fileName: file.name,
      progress: 0,
      status: 'uploading',
    });

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      options.onProgress?.({
        fileName: file.name,
        progress: 0,
        status: 'error',
        error: error.message,
      });
      return { url: '', error: error.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    const url = publicUrlData.publicUrl;

    // Notify success
    options.onProgress?.({
      fileName: file.name,
      progress: 100,
      status: 'success',
      url,
    });

    return { url, error: undefined };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Upload failed';
    options.onProgress?.({
      fileName: file.name,
      progress: 0,
      status: 'error',
      error: errorMessage,
    });
    return { url: '', error: errorMessage };
  }
};

/**
 * Uploads multiple files to Supabase storage with progress tracking
 */
export const uploadFiles = async (
  files: File[],
  options: UploadOptions = {}
): Promise<Array<{ url: string; fileName: string; error?: string }>> => {
  const results = await Promise.all(
    files.map(async (file) => {
      const result = await uploadFile(file, options);
      return {
        url: result.url,
        fileName: file.name,
        error: result.error,
      };
    })
  );

  return results;
};

/**
 * Deletes a file from Supabase storage
 */
export const deleteFile = async (
  filePath: string,
  bucket: string = DEFAULT_BUCKET
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Delete failed';
    return { success: false, error: errorMessage };
  }
};

/**
 * Extracts the file path from a Supabase public URL
 */
export const getFilePathFromUrl = (url: string, bucket: string = DEFAULT_BUCKET): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${bucket}/`);
    return pathParts.length > 1 ? pathParts[1] : null;
  } catch {
    return null;
  }
};
