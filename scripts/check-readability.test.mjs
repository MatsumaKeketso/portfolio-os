import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import postcss from 'postcss';

const root = new URL('../', import.meta.url);
const css = postcss.parse(readFileSync(new URL('src/index.css', root), 'utf8'));
const tokens = new Map();
css.walkRules(':root', rule => {
  rule.walkDecls(decl => tokens.set(decl.prop, decl.value));
});

function channels(name) {
  const value = tokens.get(name);
  assert.ok(value, `Missing token: ${name}`);
  const reference = /^var\((--[\w-]+)\)$/.exec(value);
  if (reference) return channels(reference[1]);
  if (/^#[\da-f]{6}$/i.test(value)) {
    return value.slice(1).match(/../g).map(channel => parseInt(channel, 16));
  }
  assert.match(value, /^\d+ \d+ \d+$/, `Unsupported token format: ${name}`);
  return value.split(' ').map(Number);
}

function luminance(rgb) {
  const linear = rgb.map(channel => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

// Token-pair checks only: compositing, focus, reflow and rendered states need browser QA.
for (const foreground of ['primary', 'secondary', 'tertiary']) {
  for (const background of ['--os-ink-950', '--os-ink-800', '--os-ink-700']) {
    test(`${foreground} text has 4.5:1 contrast on ${background}`, () => {
      const fg = luminance(channels(`--color-fg-${foreground}`));
      const bg = luminance(channels(background));
      const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
      assert.ok(ratio >= 4.5, `Contrast is ${ratio.toFixed(2)}:1`);
    });
  }
}

for (const path of ['src/components/apps/Settings.tsx', 'src/components/AdminPanel.tsx']) {
  test(`${path} keeps neutral text on semantic tones and the caption scale`, () => {
    const source = readFileSync(new URL(path, root), 'utf8');
    assert.doesNotMatch(source, /text-(?:white|os-text-inverse)\/(?:\d+|\[[^\]]+\])/);
    assert.doesNotMatch(source, /text-\[(?:[0-9]|1[01])px\]/);
    assert.doesNotMatch(source, /tracking-\[0\.08em\]/);
  });
}
