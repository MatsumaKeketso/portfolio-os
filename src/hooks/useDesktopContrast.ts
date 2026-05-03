import { useState, useEffect } from 'react';
import { useDesktopStore } from '../store/desktopStore';

export type ContrastMode = 'dark' | 'light';

// WCAG relative luminance
function luminance(r: number, g: number, b: number): number {
  return [r, g, b].reduce((acc, c, i) => {
    const s = c / 255;
    const lin = s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    return acc + lin * [0.2126, 0.7152, 0.0722][i];
  }, 0);
}

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  if (full.length !== 6) return null;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

function gradientBrightness(css: string): number {
  const samples: number[] = [];
  for (const hex of (css.match(/#[0-9a-fA-F]{3,6}/g) ?? [])) {
    const rgb = hexToRgb(hex);
    if (rgb) samples.push(luminance(...rgb));
  }
  for (const m of css.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g))
    samples.push(luminance(+m[1], +m[2], +m[3]));
  return samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : 0.05;
}

async function imageBrightness(url: string): Promise<number> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const ctx = c.getContext('2d');
        if (!ctx) { resolve(0.05); return; }
        ctx.drawImage(img, 0, 0, 64, 64);
        const { data } = ctx.getImageData(0, 0, 64, 64);
        let total = 0;
        for (let i = 0; i < data.length; i += 4)
          total += luminance(data[i], data[i + 1], data[i + 2]);
        resolve(total / (data.length / 4));
      } catch { resolve(0.05); }
    };
    img.onerror = () => resolve(0.05);
    img.src = url;
  });
}

const LIGHT_THRESHOLD = 0.35;

export function useDesktopContrast(): ContrastMode {
  const { backgrounds, selectedBackgroundId } = useDesktopStore();
  const [mode, setMode] = useState<ContrastMode>('dark');

  useEffect(() => {
    const bg = backgrounds.find(b => b.id === selectedBackgroundId);
    // Procedural types (aurora, beams, grid) are always dark
    if (!bg?.url || !bg.type || ['aurora', 'beams', 'grid'].includes(bg.type)) {
      setMode('dark');
      return;
    }

    const isGradient = bg.url.includes('gradient') || bg.url.startsWith('linear') || bg.url.startsWith('radial');
    if (isGradient) {
      setMode(gradientBrightness(bg.url) > LIGHT_THRESHOLD ? 'light' : 'dark');
    } else {
      imageBrightness(bg.url).then(b => setMode(b > LIGHT_THRESHOLD ? 'light' : 'dark'));
    }
  }, [selectedBackgroundId, backgrounds]);

  return mode;
}
