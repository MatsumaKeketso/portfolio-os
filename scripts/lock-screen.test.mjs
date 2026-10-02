import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/store/authStore.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;

async function sessionHarness(user, reauthenticate = async () => {}) {
  const context = vm.createContext({ console });
  const auth = { currentUser: user };
  let state;
  let signIns = 0;
  let accountCreates = 0;
  const calls = [];
  const modules = {
    zustand: {
      create: initializer => {
        state = initializer(update => { state = { ...state, ...update }; }, () => state);
        return { getState: () => state };
      },
    },
    '../lib/firebase': { auth, db: {} },
    'firebase/auth': {
      createUserWithEmailAndPassword: () => { accountCreates += 1; },
      signInWithEmailAndPassword: () => { signIns += 1; },
      signOut: async () => {},
      onAuthStateChanged: () => {},
      EmailAuthProvider: { credential: (email, password) => ({ email, password }) },
      reauthenticateWithCredential: async (currentUser, credential) => {
        calls.push({ currentUser, credential });
        await reauthenticate(auth);
      },
    },
    'firebase/firestore': { doc: () => ({}), serverTimestamp: () => ({}), setDoc: async () => {} },
  };
  const module = new vm.SourceTextModule(compiled, {
    context,
    initializeImportMeta: meta => { meta.env = {}; },
  });
  await module.link(specifier => {
    const exports = modules[specifier];
    assert.ok(exports, `Unexpected import: ${specifier}`);
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
    }, { context });
  });
  await module.evaluate();
  return { store: module.namespace.useAuthStore, calls, accountCreates: () => accountCreates, signIns: () => signIns };
}

test('unlock without an authenticated email fails without creating an account', async () => {
  const harness = await sessionHarness(null);
  const result = await harness.store.getState().unlockSession('example-password');
  assert.equal(result.success, false);
  assert.equal(harness.calls.length, 0);
  assert.equal(harness.accountCreates(), 0);
});

test('unlock reauthenticates the existing user rather than signing in or creating an account', async () => {
  const user = { uid: 'existing-user', email: 'guest@example.com' };
  const harness = await sessionHarness(user);
  const result = await harness.store.getState().unlockSession('example-password');
  assert.equal(result.success, true);
  assert.equal(harness.calls[0].currentUser, user);
  assert.equal(harness.calls[0].credential.email, user.email);
  assert.equal(harness.calls[0].credential.password, 'example-password');
  assert.equal(harness.signIns(), 0);
  assert.equal(harness.accountCreates(), 0);
});

test('a password rejection cannot unlock or change the role', async () => {
  const harness = await sessionHarness({ uid: 'owner', email: 'admin@os.com' }, async () => {
    throw { code: 'auth/invalid-credential' };
  });
  const before = harness.store.getState();
  const result = await before.unlockSession('incorrect-password');
  assert.equal(result.success, false);
  assert.equal(harness.store.getState(), before);
  assert.equal(harness.accountCreates(), 0);
});

test('changing account during reauthentication does not unlock the new account', async () => {
  const harness = await sessionHarness({ uid: 'owner', email: 'admin@os.com' }, async auth => {
    auth.currentUser = { uid: 'different-user', email: 'guest@example.com' };
  });
  const result = await harness.store.getState().unlockSession('example-password');
  assert.equal(result.success, false);
  assert.match(result.error, /session changed/i);
});
