#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// Design-token guardrail
//
// Keeps the UI on the semantic token system so a single brand/token change
// cascades everywhere (see docs/DESIGN_SYSTEM.md). Run via `npm run lint:tokens`
// (and ideally in CI). It FAILS the build when a component introduces:
//
//   1. Raw hex in a utility class      — bg-[#141414], text-[#fff], border-[#e8e8e5]
//   2. Inline-style hex                — style={{ color: '#fff' }}
//   3. Tailwind palette colors for     — bg-red-500, text-emerald-300, bg-blue-100
//      semantic/brand/status intent       (use brand-* / fg-error / fg-warning / … instead)
//
// It does NOT flag white/black alpha utilities (bg-white/[0.06], border-white/10):
// those are the intentional, theme-neutral OS-chrome language and are allowed
// by the design system.
//
// ALLOWLIST: files that are deliberately outside the themeable surface system
// (documented in docs/DESIGN_SYSTEM.md § "Intentional palette exceptions").
// ─────────────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const SCAN_DIR = join(ROOT, 'src', 'components');

// Relative paths (POSIX-style) that may legitimately use raw palette colors.
const ALLOWLIST = new Set([
  'src/components/apps/Resume.tsx',     // printable white-paper CV (not a theme surface)
  'src/components/DesktopIcons.tsx',    // dynamic contrast vs. the user's wallpaper
]);

const PALETTES = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
  'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink',
  'rose', 'slate', 'gray', 'zinc', 'neutral', 'stone',
].join('|');

const RULES = [
  {
    id: 'raw-hex-utility',
    re: new RegExp(String.raw`\b(?:bg|text|border(?:-[xytrbles])?|ring|from|via|to|fill|stroke|shadow|divide|outline|decoration)-\[#[0-9a-fA-F]{3,8}\]`, 'g'),
    msg: 'raw hex in a utility class — use a semantic/brand token',
  },
  {
    id: 'inline-style-hex',
    re: /style=\{\{[^}]*#[0-9a-fA-F]{3,6}/g,
    msg: 'hex in an inline style — use a token-backed className',
  },
  {
    id: 'palette-color',
    re: new RegExp(String.raw`\b(?:bg|text|border(?:-[xytrbles])?|ring(?:-offset)?|from|via|to|fill|stroke|caret|placeholder|decoration|outline|divide|accent)-(?:${PALETTES})-(?:50|100|200|300|400|500|600|700|800|900|950)(?:/[0-9]+)?\b`, 'g'),
    msg: 'Tailwind palette color — use brand-* (brand) or fg-error/fg-warning/fg-success/fg-info (status)',
  },
];

/** @type {string[]} */
const tsxFiles = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) tsxFiles.push(full);
  }
})(SCAN_DIR);

let violations = 0;
for (const file of tsxFiles) {
  const rel = relative(ROOT, file).split(sep).join('/');
  if (ALLOWLIST.has(rel)) continue;

  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      const m = rule.re.exec(line);
      if (m) {
        violations += 1;
        console.error(`  ${rel}:${i + 1}  [${rule.id}] ${m[0]}  — ${rule.msg}`);
      }
    }
  });
}

if (violations > 0) {
  console.error(`\n✗ design-token check failed: ${violations} violation(s).`);
  console.error('  See docs/DESIGN_SYSTEM.md. Allowlisted exceptions: Resume.tsx, DesktopIcons.tsx.');
  process.exit(1);
}
console.log('✓ design-token check passed — all components use semantic/brand/feedback tokens.');
