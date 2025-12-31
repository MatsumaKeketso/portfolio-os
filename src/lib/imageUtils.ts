/**
 * Image compression and optimization utilities
 * Helps keep localStorage usage reasonable by compressing uploaded images
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1, default 0.8
  targetSizeKB?: number; // Optional target file size in KB
}

const DEFAULT_OPTIONS: ImageCompressionOptions = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.8,
};

/**
 * Compress an image from a File or data URL
 * Returns a compressed data URL suitable for localStorage
 */
export const compressImage = (
  source: File | string,
  options: ImageCompressionOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Handle File input
    if (source instanceof File) {
      if (!source.type.startsWith('image/')) {
        reject(new Error('File must be an image'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        compressDataUrl(dataUrl, opts)
          .then(resolve)
          .catch(reject);
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(source);
      return;
    }

    // Handle data URL input
    compressDataUrl(source, opts)
      .then(resolve)
      .catch(reject);
  });
};

/**
 * Internal: Compress an image data URL
 */
const compressDataUrl = (
  dataUrl: string,
  options: ImageCompressionOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const compressed = compressLoadedImage(img, options);
        resolve(compressed);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
};

/**
 * Internal: Compress a loaded Image element
 */
const compressLoadedImage = (
  img: HTMLImageElement,
  options: ImageCompressionOptions
): string => {
  const { maxWidth = 800, maxHeight = 800, quality = 0.8 } = options;

  // Calculate new dimensions maintaining aspect ratio
  let width = img.width;
  let height = img.height;

  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height;

    if (width > height) {
      width = maxWidth;
      height = Math.round(width / aspectRatio);
    } else {
      height = maxHeight;
      width = Math.round(height * aspectRatio);
    }
  }

  // Create canvas and draw resized image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Use better image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(img, 0, 0, width, height);

  // Convert to JPEG for better compression (unless it's a PNG with transparency)
  const hasTransparency = checkTransparency(canvas, ctx);
  const mimeType = hasTransparency ? 'image/png' : 'image/jpeg';

  return canvas.toDataURL(mimeType, quality);
};

/**
 * Check if canvas has transparency
 */
const checkTransparency = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): boolean => {
  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Sample every 10th pixel for performance
    for (let i = 3; i < data.length; i += 40) {
      if (data[i] < 255) {
        return true; // Found transparency
      }
    }
    return false;
  } catch (e) {
    // If we can't check (CORS issues), assume no transparency
    return false;
  }
};

/**
 * Get the size of a data URL in kilobytes
 */
export const getDataUrlSizeKB = (dataUrl: string): number => {
  // Base64 encoding increases size by ~33%, remove data URL prefix
  const base64 = dataUrl.split(',')[1] || '';
  const sizeBytes = (base64.length * 3) / 4;
  return sizeBytes / 1024;
};

/**
 * Validate image file before upload
 */
export const validateImageFile = (
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } => {
  const { maxSizeMB = 10, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'] } = options;

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Image type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return { valid: false, error: `Image size (${sizeMB.toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)` };
  }

  return { valid: true };
};

/**
 * Compress image to target file size by iteratively adjusting quality
 * Note: This may take multiple iterations
 */
export const compressToTargetSize = async (
  source: File | string,
  targetSizeKB: number,
  maxIterations: number = 5
): Promise<string> => {
  let quality = 0.9;
  let compressed = await compressImage(source, { quality });
  let currentSize = getDataUrlSizeKB(compressed);
  let iterations = 0;

  while (currentSize > targetSizeKB && iterations < maxIterations && quality > 0.1) {
    quality -= 0.15;
    compressed = await compressImage(source, { quality });
    currentSize = getDataUrlSizeKB(compressed);
    iterations++;
  }

  return compressed;
};

/**
 * Create a thumbnail from an image
 */
export const createThumbnail = (
  source: File | string,
  size: number = 150
): Promise<string> => {
  return compressImage(source, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
  });
};
