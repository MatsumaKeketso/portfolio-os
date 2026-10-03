import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../src/lib/appNavigation.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { navigateWithinOS } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
test('navigation updates history and notifies route listeners without reloading', () => {
  const priorWindow = globalThis.window;
  const priorEvent = globalThis.PopStateEvent;
  const events = [];
  globalThis.PopStateEvent = class { constructor(type) { this.type = type; } };
  globalThis.window = {
    location: { pathname: '/' },
    history: { pushState(_state, _title, path) { globalThis.window.location.pathname = path; events.push(path); } },
    dispatchEvent(event) { events.push(event.type); },
  };
  try {
    navigateWithinOS('/window-lab');
    navigateWithinOS('/window-lab');
    navigateWithinOS('/');
    assert.deepEqual(events, ['/window-lab', 'popstate', '/', 'popstate']);
  } finally {
    globalThis.window = priorWindow;
    globalThis.PopStateEvent = priorEvent;
  }
});
