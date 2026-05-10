export type IconSizeToken =
  | 'micro'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'desktop-sm'
  | 'desktop-md'
  | 'desktop-lg'
  | 'preview'
  | 'hero';

export type IconSourceType = 'lucide' | 'mui' | 'image';

export const iconSizeClass: Record<IconSizeToken, string> = {
  micro: 'h-3 w-3',
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  'desktop-sm': 'h-8 w-8',
  'desktop-md': 'h-10 w-10',
  'desktop-lg': 'h-12 w-12',
  preview: 'h-14 w-14',
  hero: 'h-24 w-24',
};

export const iconVisualScale: Record<IconSourceType, number> = {
  lucide: 0.9,
  mui: 0.94,
  image: 0.82,
};

