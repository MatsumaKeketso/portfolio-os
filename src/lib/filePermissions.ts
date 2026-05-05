import { FileItem, VISITOR_GALLERY_ID } from '../types';

// ---------------------------------------------------------------------------
// Location context — which OS "zone" the current path lives in
// ---------------------------------------------------------------------------

export type LocationContext =
  | 'root'          // top-level home view
  | 'visitorGallery' // inside Visitor Gallery (restricted public zone)
  | 'system'        // inside a protected system folder (admin-only writes)
  | 'general';      // regular writable folder

export function getLocationContext(
  currentPath: string[],
  files: FileItem[],
): LocationContext {
  if (currentPath.length === 0) return 'root';

  const topLevelId = currentPath[0];

  if (topLevelId === VISITOR_GALLERY_ID) return 'visitorGallery';

  const topFolder = files.find((f) => f.id === topLevelId);
  if (topFolder?.isProtected) return 'system';

  return 'general';
}

// ---------------------------------------------------------------------------
// Permissions model — what actions are allowed in the current zone
// ---------------------------------------------------------------------------

export interface LocationPermissions {
  canCreateFolder: boolean;
  canCreateFile: boolean;
  canUpload: boolean;
  /** Value for <input type="file" accept="..."> */
  allowedUploadTypes: string;
  canDelete: boolean;
  canRename: boolean;
  canMove: boolean;
}

export function getPermissions(
  context: LocationContext,
  isAdmin: boolean,
): LocationPermissions {
  if (context === 'visitorGallery') {
    return {
      canCreateFolder: true,
      canCreateFile: false,
      canUpload: true,
      allowedUploadTypes: 'image/*',
      canDelete: isAdmin,
      canRename: isAdmin,
      canMove: isAdmin,
    };
  }

  if (context === 'system') {
    return {
      canCreateFolder: isAdmin,
      canCreateFile: isAdmin,
      canUpload: isAdmin,
      allowedUploadTypes: 'image/*,video/*',
      canDelete: isAdmin,
      canRename: isAdmin,
      canMove: isAdmin,
    };
  }

  // root or general — visitors can create and upload freely
  return {
    canCreateFolder: isAdmin,
    canCreateFile: isAdmin,
    canUpload: isAdmin,
    allowedUploadTypes: 'image/*,video/*',
    canDelete: isAdmin,
    canRename: isAdmin,
    canMove: isAdmin,
  };
}

// ---------------------------------------------------------------------------
// Per-file permission — whether a specific file can be acted on
// ---------------------------------------------------------------------------

/** Returns true if the file can be deleted/renamed given its own flags. */
export function fileIsWritable(file: FileItem, isAdmin: boolean): boolean {
  if (!isAdmin) return false;
  if (file.isProtected) return isAdmin;
  return true;
}
