import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export interface UploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export interface UploadOptions {
  bucket?: string; // kept for API compat, ignored — bucket comes from Firebase config
  maxSizeMB?: number;
  allowedTypes?: string[];
  generateUniqueName?: boolean;
  onProgress?: (progress: UploadProgress) => void;
}

const DEFAULT_MAX_SIZE_MB = 10;
const DEFAULT_ALLOWED_TYPES = ['image/*', 'video/*'];

export const validateFile = (
  file: File,
  options: UploadOptions = {}
): { valid: boolean; error?: string } => {
  const maxSize = (options.maxSizeMB || DEFAULT_MAX_SIZE_MB) * 1024 * 1024;
  const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_TYPES;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${options.maxSizeMB || DEFAULT_MAX_SIZE_MB}MB`,
    };
  }

  const fileType = file.type;
  const isAllowed = allowedTypes.some((allowedType) => {
    if (allowedType.endsWith('/*')) {
      return fileType.startsWith(allowedType.slice(0, -2));
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

export const uploadFile = async (
  file: File,
  options: UploadOptions = {}
): Promise<{ url: string; error?: string }> => {
  const generateUnique = options.generateUniqueName !== false;

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

  const fileName = generateUnique
    ? `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.name}`
    : file.name;

  options.onProgress?.({ fileName: file.name, progress: 0, status: 'uploading' });

  try {
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const url = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          options.onProgress?.({ fileName: file.name, progress, status: 'uploading' });
        },
        (error) => reject(error),
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });

    options.onProgress?.({ fileName: file.name, progress: 100, status: 'success', url });
    return { url };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Upload failed';
    options.onProgress?.({ fileName: file.name, progress: 0, status: 'error', error: errorMessage });
    return { url: '', error: errorMessage };
  }
};

export const uploadFiles = async (
  files: File[],
  options: UploadOptions = {}
): Promise<Array<{ url: string; fileName: string; error?: string }>> => {
  return Promise.all(
    files.map(async (file) => {
      const result = await uploadFile(file, options);
      return { url: result.url, fileName: file.name, error: result.error };
    })
  );
};

export const deleteFile = async (
  filePath: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteObject(ref(storage, filePath));
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Delete failed';
    return { success: false, error: errorMessage };
  }
};

/**
 * Extracts the storage path from a Firebase Storage download URL.
 * Firebase URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encoded-path}?alt=media&token=...
 */
export const getFilePathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/o/');
    return parts.length > 1 ? decodeURIComponent(parts[1]) : null;
  } catch {
    return null;
  }
};
