import * as Icons from 'lucide-react';

export type FileCategory =
  | 'text'
  | 'code'
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'archive'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'folder'
  | 'unknown';

export interface FileTypeInfo {
  category: FileCategory;
  icon: any; // Lucide icon component
  color: string;
  canPreview: boolean;
  viewerType: 'notepad' | 'image' | 'video' | 'audio' | 'pdf' | 'code' | 'text' | 'none';
  description: string;
}

const extensionMap: Record<string, FileTypeInfo> = {
  // Text files
  txt: { category: 'text', icon: Icons.FileText, color: 'text-blue-400', canPreview: true, viewerType: 'notepad', description: 'Text Document' },
  md: { category: 'text', icon: Icons.FileText, color: 'text-blue-400', canPreview: true, viewerType: 'notepad', description: 'Markdown' },
  rtf: { category: 'text', icon: Icons.FileText, color: 'text-blue-400', canPreview: true, viewerType: 'text', description: 'Rich Text' },

  // Code files
  js: { category: 'code', icon: Icons.FileCode, color: 'text-yellow-400', canPreview: true, viewerType: 'code', description: 'JavaScript' },
  jsx: { category: 'code', icon: Icons.FileCode, color: 'text-yellow-400', canPreview: true, viewerType: 'code', description: 'React JSX' },
  ts: { category: 'code', icon: Icons.FileCode, color: 'text-blue-500', canPreview: true, viewerType: 'code', description: 'TypeScript' },
  tsx: { category: 'code', icon: Icons.FileCode, color: 'text-blue-500', canPreview: true, viewerType: 'code', description: 'React TSX' },
  py: { category: 'code', icon: Icons.FileCode, color: 'text-green-400', canPreview: true, viewerType: 'code', description: 'Python' },
  java: { category: 'code', icon: Icons.FileCode, color: 'text-red-400', canPreview: true, viewerType: 'code', description: 'Java' },
  cpp: { category: 'code', icon: Icons.FileCode, color: 'text-blue-400', canPreview: true, viewerType: 'code', description: 'C++' },
  c: { category: 'code', icon: Icons.FileCode, color: 'text-blue-400', canPreview: true, viewerType: 'code', description: 'C' },
  go: { category: 'code', icon: Icons.FileCode, color: 'text-cyan-400', canPreview: true, viewerType: 'code', description: 'Go' },
  rs: { category: 'code', icon: Icons.FileCode, color: 'text-orange-400', canPreview: true, viewerType: 'code', description: 'Rust' },
  php: { category: 'code', icon: Icons.FileCode, color: 'text-purple-400', canPreview: true, viewerType: 'code', description: 'PHP' },
  rb: { category: 'code', icon: Icons.FileCode, color: 'text-red-500', canPreview: true, viewerType: 'code', description: 'Ruby' },
  swift: { category: 'code', icon: Icons.FileCode, color: 'text-orange-500', canPreview: true, viewerType: 'code', description: 'Swift' },
  kt: { category: 'code', icon: Icons.FileCode, color: 'text-purple-500', canPreview: true, viewerType: 'code', description: 'Kotlin' },

  // Markup & Config
  html: { category: 'code', icon: Icons.FileCode, color: 'text-orange-400', canPreview: true, viewerType: 'code', description: 'HTML' },
  css: { category: 'code', icon: Icons.FileCode, color: 'text-blue-400', canPreview: true, viewerType: 'code', description: 'CSS' },
  scss: { category: 'code', icon: Icons.FileCode, color: 'text-pink-400', canPreview: true, viewerType: 'code', description: 'SCSS' },
  json: { category: 'code', icon: Icons.Braces, color: 'text-yellow-500', canPreview: true, viewerType: 'code', description: 'JSON' },
  xml: { category: 'code', icon: Icons.FileCode, color: 'text-green-500', canPreview: true, viewerType: 'code', description: 'XML' },
  yaml: { category: 'code', icon: Icons.FileCode, color: 'text-red-400', canPreview: true, viewerType: 'code', description: 'YAML' },
  yml: { category: 'code', icon: Icons.FileCode, color: 'text-red-400', canPreview: true, viewerType: 'code', description: 'YAML' },
  toml: { category: 'code', icon: Icons.FileCode, color: 'text-gray-400', canPreview: true, viewerType: 'code', description: 'TOML' },

  // Images
  jpg: { category: 'image', icon: Icons.Image, color: 'text-green-400', canPreview: true, viewerType: 'image', description: 'JPEG Image' },
  jpeg: { category: 'image', icon: Icons.Image, color: 'text-green-400', canPreview: true, viewerType: 'image', description: 'JPEG Image' },
  png: { category: 'image', icon: Icons.Image, color: 'text-green-400', canPreview: true, viewerType: 'image', description: 'PNG Image' },
  gif: { category: 'image', icon: Icons.Image, color: 'text-green-400', canPreview: true, viewerType: 'image', description: 'GIF Image' },
  svg: { category: 'image', icon: Icons.Image, color: 'text-green-400', canPreview: true, viewerType: 'image', description: 'SVG Image' },
  webp: { category: 'image', icon: Icons.Image, color: 'text-green-400', canPreview: true, viewerType: 'image', description: 'WebP Image' },
  bmp: { category: 'image', icon: Icons.Image, color: 'text-green-400', canPreview: true, viewerType: 'image', description: 'BMP Image' },
  ico: { category: 'image', icon: Icons.Image, color: 'text-green-400', canPreview: true, viewerType: 'image', description: 'Icon' },

  // Video
  mp4: { category: 'video', icon: Icons.Video, color: 'text-purple-400', canPreview: true, viewerType: 'video', description: 'MP4 Video' },
  webm: { category: 'video', icon: Icons.Video, color: 'text-purple-400', canPreview: true, viewerType: 'video', description: 'WebM Video' },
  mov: { category: 'video', icon: Icons.Video, color: 'text-purple-400', canPreview: true, viewerType: 'video', description: 'MOV Video' },
  avi: { category: 'video', icon: Icons.Video, color: 'text-purple-400', canPreview: true, viewerType: 'video', description: 'AVI Video' },
  mkv: { category: 'video', icon: Icons.Video, color: 'text-purple-400', canPreview: true, viewerType: 'video', description: 'MKV Video' },

  // Audio
  mp3: { category: 'audio', icon: Icons.Music, color: 'text-pink-400', canPreview: true, viewerType: 'audio', description: 'MP3 Audio' },
  wav: { category: 'audio', icon: Icons.Music, color: 'text-pink-400', canPreview: true, viewerType: 'audio', description: 'WAV Audio' },
  ogg: { category: 'audio', icon: Icons.Music, color: 'text-pink-400', canPreview: true, viewerType: 'audio', description: 'OGG Audio' },
  m4a: { category: 'audio', icon: Icons.Music, color: 'text-pink-400', canPreview: true, viewerType: 'audio', description: 'M4A Audio' },
  flac: { category: 'audio', icon: Icons.Music, color: 'text-pink-400', canPreview: true, viewerType: 'audio', description: 'FLAC Audio' },

  // PDF
  pdf: { category: 'pdf', icon: Icons.FileType, color: 'text-red-500', canPreview: true, viewerType: 'pdf', description: 'PDF Document' },

  // Archives
  zip: { category: 'archive', icon: Icons.FileArchive, color: 'text-yellow-600', canPreview: false, viewerType: 'none', description: 'ZIP Archive' },
  rar: { category: 'archive', icon: Icons.FileArchive, color: 'text-yellow-600', canPreview: false, viewerType: 'none', description: 'RAR Archive' },
  '7z': { category: 'archive', icon: Icons.FileArchive, color: 'text-yellow-600', canPreview: false, viewerType: 'none', description: '7-Zip Archive' },
  tar: { category: 'archive', icon: Icons.FileArchive, color: 'text-yellow-600', canPreview: false, viewerType: 'none', description: 'TAR Archive' },
  gz: { category: 'archive', icon: Icons.FileArchive, color: 'text-yellow-600', canPreview: false, viewerType: 'none', description: 'GZIP Archive' },

  // Documents
  doc: { category: 'document', icon: Icons.FileText, color: 'text-blue-600', canPreview: false, viewerType: 'none', description: 'Word Document' },
  docx: { category: 'document', icon: Icons.FileText, color: 'text-blue-600', canPreview: false, viewerType: 'none', description: 'Word Document' },

  // Spreadsheets
  xls: { category: 'spreadsheet', icon: Icons.Sheet, color: 'text-green-600', canPreview: false, viewerType: 'none', description: 'Excel Spreadsheet' },
  xlsx: { category: 'spreadsheet', icon: Icons.Sheet, color: 'text-green-600', canPreview: false, viewerType: 'none', description: 'Excel Spreadsheet' },
  csv: { category: 'spreadsheet', icon: Icons.Table, color: 'text-green-500', canPreview: true, viewerType: 'text', description: 'CSV File' },

  // Presentations
  ppt: { category: 'presentation', icon: Icons.Presentation, color: 'text-orange-600', canPreview: false, viewerType: 'none', description: 'PowerPoint' },
  pptx: { category: 'presentation', icon: Icons.Presentation, color: 'text-orange-600', canPreview: false, viewerType: 'none', description: 'PowerPoint' },
};

const mimeTypeMap: Record<string, FileTypeInfo> = {
  // Text
  'text/plain': extensionMap.txt,
  'text/markdown': extensionMap.md,

  // Code
  'application/javascript': extensionMap.js,
  'application/json': extensionMap.json,
  'application/xml': extensionMap.xml,
  'text/html': extensionMap.html,
  'text/css': extensionMap.css,

  // Images
  'image/jpeg': extensionMap.jpg,
  'image/png': extensionMap.png,
  'image/gif': extensionMap.gif,
  'image/svg+xml': extensionMap.svg,
  'image/webp': extensionMap.webp,

  // Video
  'video/mp4': extensionMap.mp4,
  'video/webm': extensionMap.webm,
  'video/quicktime': extensionMap.mov,

  // Audio
  'audio/mpeg': extensionMap.mp3,
  'audio/wav': extensionMap.wav,
  'audio/ogg': extensionMap.ogg,

  // PDF
  'application/pdf': extensionMap.pdf,

  // Archives
  'application/zip': extensionMap.zip,
  'application/x-rar-compressed': extensionMap.rar,
  'application/x-7z-compressed': extensionMap['7z'],

  // Documents
  'application/msword': extensionMap.doc,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': extensionMap.docx,

  // Spreadsheets
  'application/vnd.ms-excel': extensionMap.xls,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': extensionMap.xlsx,
  'text/csv': extensionMap.csv,

  // Presentations
  'application/vnd.ms-powerpoint': extensionMap.ppt,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': extensionMap.pptx,
};

const defaultFileInfo: FileTypeInfo = {
  category: 'unknown',
  icon: Icons.File,
  color: 'text-gray-400',
  canPreview: false,
  viewerType: 'none',
  description: 'File',
};

export function getFileTypeInfo(fileName: string, mimeType?: string): FileTypeInfo {
  // Try MIME type first
  if (mimeType && mimeTypeMap[mimeType]) {
    return mimeTypeMap[mimeType];
  }

  // Try extension
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension && extensionMap[extension]) {
    return extensionMap[extension];
  }

  return defaultFileInfo;
}

export function getFileIcon(fileName: string, fileType: string, mimeType?: string) {
  if (fileType === 'folder') {
    return Icons.Folder;
  }

  const typeInfo = getFileTypeInfo(fileName, mimeType);
  return typeInfo.icon;
}

export function getFileColor(fileName: string, fileType: string, mimeType?: string): string {
  if (fileType === 'folder') {
    return 'text-yellow-500';
  }

  const typeInfo = getFileTypeInfo(fileName, mimeType);
  return typeInfo.color;
}

export function canPreviewFile(fileName: string, mimeType?: string): boolean {
  const typeInfo = getFileTypeInfo(fileName, mimeType);
  return typeInfo.canPreview;
}

export function getViewerType(fileName: string, mimeType?: string): FileTypeInfo['viewerType'] {
  const typeInfo = getFileTypeInfo(fileName, mimeType);
  return typeInfo.viewerType;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function getLanguageFromExtension(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    go: 'go',
    rs: 'rust',
    php: 'php',
    rb: 'ruby',
    swift: 'swift',
    kt: 'kotlin',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql',
    sh: 'bash',
  };

  return extension ? (languageMap[extension] || extension) : 'text';
}
