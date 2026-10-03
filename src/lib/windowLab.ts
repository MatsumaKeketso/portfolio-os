export type Edge = 'left' | 'right' | null;
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export type Corner = 'nw' | 'ne' | 'sw' | 'se';
export type Rect = { left: number; top: number; width: number; height: number };
export const LAB_MIN_WIDTH = 320;
export const LAB_MIN_HEIGHT = 240;
export const LAB_VISIBLE_HEADER = 220;

export function releaseDockEdge(pointerX: number, width: number): Edge {
  if (pointerX <= 18) return 'left';
  if (pointerX >= width - 18) return 'right';
  return null;
}

export function contentDockEdge(pointerX: number, width: number): Edge {
  return releaseDockEdge(pointerX, width);
}

export function iconDragCentre(edge: Exclude<Edge, null>, delta: number, width: number) {
  return (edge === 'left' ? 32 : width - 32) + delta;
}

export function resizeRect(rect: Rect, corner: Corner, dx: number, dy: number, bounds: { width: number; height: number }): Rect {
  const minWidth = Math.min(LAB_MIN_WIDTH, bounds.width - 16);
  const minHeight = Math.min(LAB_MIN_HEIGHT, bounds.height - 16);
  let left = rect.left;
  let top = rect.top;
  let right = rect.left + rect.width;
  let bottom = rect.top + rect.height;
  if (corner.includes('w')) left = clamp(left + dx, 8, right - minWidth);
  else right = clamp(right + dx, left + minWidth, bounds.width - 8);
  if (corner.includes('n')) top = clamp(top + dy, 8, bottom - minHeight);
  else bottom = clamp(bottom + dy, top + minHeight, bounds.height - 8);
  return { left, top, width: right - left, height: bottom - top };
}

export function compactVariant(scale: number, current: boolean) {
  return current ? scale < 0.72 : scale < 0.65;
}

export const LAB_SETTINGS_KEY = 'genos.window-lab.settings.v1';
export const defaultLabSettings = { releaseDistance: 100, desktopWidth: 50, leftWidth: 50, rightWidth: 50, showZones: true };
export function parseLabSettings(raw: string | null) {
  try {
    const value = JSON.parse(raw ?? 'null');
    return {
      releaseDistance: typeof value?.releaseDistance === 'number' && Number.isFinite(value.releaseDistance) ? clamp(value.releaseDistance, 70, 180) : 100,
      desktopWidth: typeof value?.desktopWidth === 'number' && Number.isFinite(value.desktopWidth) ? clamp(value.desktopWidth, 20, 80) : 50,
      leftWidth: typeof value?.leftWidth === 'number' && Number.isFinite(value.leftWidth) ? clamp(value.leftWidth, 20, 80) : typeof value?.desktopWidth === 'number' ? clamp(value.desktopWidth,20,80) : 50,
      rightWidth: typeof value?.rightWidth === 'number' && Number.isFinite(value.rightWidth) ? clamp(value.rightWidth, 20, 80) : typeof value?.desktopWidth === 'number' ? clamp(value.desktopWidth,20,80) : 50,
      showZones: typeof value?.showZones === 'boolean' ? value.showZones : true,
    };
  } catch { return { ...defaultLabSettings }; }
}

export function windowScale(x: number, width: number, desktopWidth = 50, rightWidth = desktopWidth) {
  const edgeDistance = Math.min(x, width - x);
  const sideWidth = x <= width / 2 ? desktopWidth : rightWidth;
  const progress = clamp(1 - edgeDistance / (width * (1 - clamp(sideWidth, 20, 80) / 100) / 2), 0, 1);
  const eased = progress * progress * (3 - 2 * progress);
  return 1 - 0.66 * eased;
}

export function dragScalePosition(start: number, delta: number, width: number) {
  return clamp(start + delta / width, 0, 1);
}

export function grabbedPosition(pointer: number, fraction: number, extent: number) {
  return pointer + (0.5 - fraction) * extent;
}

export function retainedDockEdge(x: number, width: number, current: Edge, releaseDistance: number): Edge {
  if (current === 'left' && x < releaseDistance) return 'left';
  if (current === 'right' && x > width - releaseDistance) return 'right';
  return null;
}

// Stable vertical slots prevent edge icons from covering each other.
export function dockSlots(items: { id: string; y: number }[], height: number) {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.id.localeCompare(b.id));
  const gap = 60;
  const top = 36;
  const bottom = Math.max(top, height - 36);
  const positions = sorted.map((item, i) => Math.max(clamp(item.y, top, bottom), i ? top + i * gap : top));
  for (let i = 1; i < positions.length; i++) positions[i] = Math.max(positions[i], positions[i - 1] + gap);
  if (positions.length && positions[positions.length - 1] > bottom) {
    positions[positions.length - 1] = bottom;
    for (let i = positions.length - 2; i >= 0; i--) positions[i] = Math.min(positions[i], positions[i + 1] - gap);
  }
  return Object.fromEntries(sorted.map((item, i) => [item.id, positions[i]]));
}
