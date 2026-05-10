import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const csvPathArg = args.find((arg) => !arg.startsWith('--'));
const shouldUploadImages = args.includes('--upload-images');
const shouldDryRun = args.includes('--dry-run');

const getFlagValue = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : '';
};

const loadEnvFile = (fileName) => {
  const filePath = path.join(repoRoot, fileName);
  if (!existsSync(filePath)) return {};

  return readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return env;
      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex === -1) return env;
      const key = trimmed.slice(0, equalsIndex).trim();
      const value = trimmed.slice(equalsIndex + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = value;
      return env;
    }, {});
};

const localEnv = {
  ...loadEnvFile('.env'),
  ...loadEnvFile('.env.local'),
  ...process.env,
};

const firebaseConfig = {
  apiKey: localEnv.VITE_FIREBASE_API_KEY,
  authDomain: localEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: localEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: localEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: localEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: localEnv.VITE_FIREBASE_APP_ID,
};

const parseCsv = (csvText) => {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);

  const headers = rows.shift()?.map((header) => header.trim()) ?? [];
  return rows.map((values) =>
    headers.reduce((entry, header, index) => {
      entry[header] = values[index]?.trim() ?? '';
      return entry;
    }, {})
  );
};

const stripHtml = (value) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const estimateReadingTime = (html) => {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

const normalizeBoolean = (value) => ['true', '1', 'yes'].includes(String(value).trim().toLowerCase());

const normalizeCategories = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const isRemoteUrl = (value) => /^https?:\/\//i.test(value);

const uploadImageIfNeeded = async ({ storage, imageValue, slug }) => {
  if (!shouldUploadImages || !imageValue || isRemoteUrl(imageValue)) return imageValue;

  const resolvedPath = path.isAbsolute(imageValue) ? imageValue : path.resolve(path.dirname(csvPathArg), imageValue);
  if (!existsSync(resolvedPath)) {
    console.warn(`Image not found for ${slug}: ${imageValue}`);
    return imageValue;
  }

  const bytes = await readFile(resolvedPath);
  const extension = path.extname(resolvedPath).toLowerCase();
  const contentType = extension === '.webp'
    ? 'image/webp'
    : extension === '.png'
      ? 'image/png'
      : extension === '.gif'
        ? 'image/gif'
        : 'image/jpeg';

  const storageRef = ref(storage, `reads/${slug}/${path.basename(resolvedPath)}`);
  await uploadBytes(storageRef, bytes, { contentType });
  return getDownloadURL(storageRef);
};

const importReads = async () => {
  if (!csvPathArg) {
    throw new Error('Usage: npm run reads:import -- "C:\\path\\to\\Reads.csv" -- --password "SUPERUSER_PASSWORD"');
  }

  const csvPath = path.resolve(csvPathArg);
  const csvText = await readFile(csvPath, 'utf8');
  const rows = parseCsv(csvText);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const email = getFlagValue('--email') || localEnv.FIREBASE_ADMIN_EMAIL || localEnv.VITE_ADMIN_EMAIL || 'admin@os.com';
  const password = getFlagValue('--password') || localEnv.FIREBASE_ADMIN_PASSWORD || localEnv.VITE_ADMIN_PASSWORD;

  const reads = [];
  for (const row of rows) {
    const slug = row.Slug;
    if (!slug) continue;

    const content = row.Content || '';
    const imageUrl = await uploadImageIfNeeded({ storage, imageValue: row.Image, slug });

    reads.push({
      id: slug,
      slug,
      title: row.Title,
      description: row.Description || stripHtml(content).slice(0, 180),
      author: row.Author || 'keketso',
      date: row.Date,
      imageUrl,
      imageAlt: row['Image:alt'] || row.Title,
      source: row.Source || '',
      hasSource: normalizeBoolean(row['Has Source']) || Boolean(row.Source),
      categories: normalizeCategories(row.Categories),
      content,
      html: row.HTML || '',
      readingTimeMinutes: estimateReadingTime(content),
      isDraft: normalizeBoolean(row[':draft']),
    });
  }

  if (shouldDryRun) {
    console.log(JSON.stringify({ count: reads.length, first: reads[0] }, null, 2));
    return;
  }

  if (!password) {
    throw new Error('Missing superuser password. Pass --password or set FIREBASE_ADMIN_PASSWORD.');
  }

  await signInWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'os-site_content', 'reads'), {
    data: reads,
    updated_at: new Date().toISOString(),
    source_csv: csvPath,
  });

  console.log(`Imported ${reads.length} reads into os-site_content/reads as ${email}.`);
};

importReads().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
