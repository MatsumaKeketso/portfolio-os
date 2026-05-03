import type { LucideIcon } from 'lucide-react';

// ---------------------------------------------------------------------------
// Context IDs — every surface that can be right-clicked has one
// ---------------------------------------------------------------------------

export type ContextId =
  | 'desktop.empty'
  | 'desktop.icon'
  | 'taskbar.empty'
  | 'taskbar.appButton'
  | 'startMenu.app'
  | 'window.titlebar'
  | 'window.body'
  | 'fileExplorer.empty'
  | 'fileExplorer.sidebarItem'
  | 'fileExplorer.folder'
  | 'fileExplorer.file'
  | 'fileExplorer.image'
  | 'fileExplorer.project'
  | 'fileExplorer.visitorFolder'
  | 'fileExplorer.visitorImage'
  | 'notification.item'
  | 'settings.sidebarRow'
  | 'admin.record'
  | 'media.preview'
  | 'textSelection';

// ---------------------------------------------------------------------------
// Menu item model
// ---------------------------------------------------------------------------

export type MenuGroup =
  | 'primary'
  | 'clipboard'
  | 'organize'
  | 'share'
  | 'system'
  | 'danger';

export interface ContextMenuItemDef {
  id: string;
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  group?: MenuGroup;
  disabled?: boolean;
  hidden?: boolean;
  danger?: boolean;
  divider?: boolean;
  action: () => void;
}

// ---------------------------------------------------------------------------
// Request model — callers pass context + optional target info + permissions
// ---------------------------------------------------------------------------

export interface ContextMenuRequest {
  context: ContextId;
  x: number;
  y: number;
  targetId?: string;
  targetType?: string;
  selectionIds?: string[];
  /** Permission flags active for the current user/session */
  permissions?: ContextPermission[];
}

export type ContextPermission =
  | 'admin'
  | 'owner'
  | 'visitor';

// ---------------------------------------------------------------------------
// Helper: build item list from a request + action map
// ---------------------------------------------------------------------------

/**
 * Resolve which menu items to show for a given context request.
 * Each surface calls this with its context ID and available actions,
 * and gets back a flat ordered list ready for <ContextMenu />.
 */
export function resolveMenuItems(
  items: ContextMenuItemDef[],
  permissions: ContextPermission[] = ['visitor'],
): ContextMenuItemDef[] {
  const isAdmin = permissions.includes('admin');
  const isOwner = permissions.includes('owner');

  return items.filter((item) => {
    if (item.hidden) return false;
    // Danger-group items (delete, remove, uninstall) are admin/owner only
    if (item.danger && !isAdmin && !isOwner) return false;
    return true;
  }).map((item) => ({
    ...item,
    disabled: item.disabled ?? false,
  }));
}

// ---------------------------------------------------------------------------
// Group ordering — ensures consistent menu structure across all surfaces
// ---------------------------------------------------------------------------

const GROUP_ORDER: MenuGroup[] = [
  'primary',
  'clipboard',
  'organize',
  'share',
  'system',
  'danger',
];

/**
 * Sort items by canonical group order and insert dividers between groups.
 * Items without a group are treated as 'primary'.
 */
export function sortAndSeparate(
  items: ContextMenuItemDef[],
): ContextMenuItemDef[] {
  const grouped = new Map<MenuGroup, ContextMenuItemDef[]>();

  for (const item of items) {
    const g = item.group ?? 'primary';
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g)!.push(item);
  }

  const result: ContextMenuItemDef[] = [];

  for (const group of GROUP_ORDER) {
    const groupItems = grouped.get(group);
    if (!groupItems || groupItems.length === 0) continue;

    if (result.length > 0) {
      result.push({ id: `divider-${group}`, label: '', divider: true, action: () => {} });
    }
    result.push(...groupItems);
  }

  return result;
}
