// ─────────────────────────────────────────────────────────────────────────
// Brand ramp engine
//
// The OS theme is a SINGLE brand color. From one hex code we generate an
// 11-stop tint/shade ramp (50 → 2100) so the design system always has
// correctly-related lighter/darker variants on hand — focus rings, hovers,
// subtle fills, pressed states, borders — without the author ever picking
// more than one color.
//
// Design rules:
//   • The exact hex you provide is preserved verbatim as `DEFAULT`. The
//     numbered stops are generated tints (toward white) and shades (toward
//     black) of it. "The original color is the brand color."
//   • Generation happens in OKLCH (perceptual): we keep the input's hue and
//     chroma and only walk lightness per stop, so the ramp stays the same
//     color family and never goes muddy or hue-shifts the way naive sRGB
//     mixing does.
//   • Output channels are SPACE-SEPARATED "r g b" strings so they plug into
//     Tailwind's `rgb(var(--brand-600) / <alpha-value>)` slash syntax and
//     CSS `rgb(var(--brand) / 0.1)` alpha — matching the --os-ink-* tokens.
// ─────────────────────────────────────────────────────────────────────────

export type BrandStop =
  | '50' | '100' | '200' | '300' | '400'
  | '600' | '800' | '1000' | '1300' | '1700' | '2100';

// Matches the existing primitive ladder in tailwind.config.js so the brand
// ramp drops into the same token shape as primitive.gray / .red / etc.
export const BRAND_STOPS: BrandStop[] = [
  '50', '100', '200', '300', '400', '600', '800', '1000', '1300', '1700', '2100',
];

// Target OKLab lightness per stop. 50 = lightest tint, 2100 = darkest shade.
const STOP_LIGHTNESS: Record<BrandStop, number> = {
  '50': 0.971,
  '100': 0.936,
  '200': 0.862,
  '300': 0.783,
  '400': 0.705,
  '600': 0.602,
  '800': 0.508,
  '1000': 0.432,
  '1300': 0.345,
  '1700': 0.258,
  '2100': 0.168,
};

type RGB = [number, number, number];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function srgbToLinear(c: number): number {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
  return clamp(Math.round(v * 255), 0, 255);
}

export function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

interface OKLCH {
  L: number;
  C: number;
  h: number;
}

function rgbToOklch([r, g, b]: RGB): OKLCH {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  return { L, C: Math.hypot(a, bb), h: Math.atan2(bb, a) };
}

function oklchToRgb({ L, C, h }: OKLCH): RGB {
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return [linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb)];
}

const channels = ([r, g, b]: RGB) => `${r} ${g} ${b}`;

/**
 * Generate the full brand ramp from a single hex code.
 * Returns space-separated "r g b" channel strings keyed by stop, plus
 * `DEFAULT` = the verbatim input color.
 *
 * Falls back to Generative Studio red if the hex is unparseable.
 */
export function generateBrandRamp(hex: string): Record<BrandStop | 'DEFAULT', string> {
  const rgb = hexToRgb(hex) ?? [239, 68, 68];
  const base = rgbToOklch(rgb);

  // Slightly relax chroma toward the extreme tints/shades so very light stops
  // don't read as neon pastels and very dark stops don't clip the gamut. The
  // mid range keeps full chroma so the brand family stays vivid.
  const chromaAt = (L: number) => base.C * (0.55 + 0.45 * Math.sin(Math.PI * clamp(L, 0, 1)));

  const ramp = {} as Record<BrandStop | 'DEFAULT', string>;
  for (const stop of BRAND_STOPS) {
    const L = STOP_LIGHTNESS[stop];
    ramp[stop] = channels(oklchToRgb({ L, C: chromaAt(L), h: base.h }));
  }
  ramp.DEFAULT = channels(rgb);
  return ramp;
}

/** Comma-separated "r, g, b" — for legacy `--color-primary` consumers. */
export function brandLegacyChannels(hex: string): string {
  const [r, g, b] = hexToRgb(hex) ?? [239, 68, 68];
  return `${r}, ${g}, ${b}`;
}

// WCAG relative luminance of an sRGB triplet (0 = black, 1 = white).
function relativeLuminance([r, g, b]: RGB): number {
  const lin = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const NEAR_BLACK: RGB = [17, 17, 17]; // matches OS chrome ink
const NEAR_BLACK_HEX = '#111111';
const WHITE_HEX = '#ffffff';

/**
 * Smart on-color: given a background (the color a foreground sits ON), return
 * the hex of whichever of near-black / white has the higher WCAG contrast.
 * This is what makes brand foregrounds + currentColor icons legible on any
 * brand hue — the author never has to pick black vs white by hand.
 *
 * Accepts either "r g b" / "r, g, b" channels or a #hex. Returns a full hex
 * color (the consuming token `--color-fg-on-primary` is used directly, not
 * wrapped in rgb()).
 */
export function idealOnColor(color: string): string {
  const fromHex = color.trim().startsWith('#') ? hexToRgb(color) : null;
  const parts = color.trim().split(/[\s,]+/).map(Number);
  const bg: RGB = fromHex
    ?? (parts.length === 3 && parts.every((n) => !Number.isNaN(n))
      ? [parts[0], parts[1], parts[2]]
      : [239, 68, 68]);
  const L = relativeLuminance(bg);
  const contrastWhite = (1.0 + 0.05) / (L + 0.05);
  const contrastBlack = (L + 0.05) / (relativeLuminance(NEAR_BLACK) + 0.05);
  return contrastWhite >= contrastBlack ? WHITE_HEX : NEAR_BLACK_HEX;
}
