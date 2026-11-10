import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(__dirname, '../dist/manifest.json');

const clients = {
  development: '1098644967878-neug0kkfrs9rin9emkef08d8vko9pdni.apps.googleusercontent.com',
  production: '1098644967878-if5q079e74isp6bq1ak5ug43dv8n3meh.apps.googleusercontent.com',
};

const target = process.argv[2];
if (!Object.hasOwn(clients, target)) {
  throw new Error('Usage: node scripts/set-oauth-client.mjs <development|production>');
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (!manifest.oauth2 || !manifest.oauth2.client_id) {
  throw new Error('Built manifest is missing its OAuth client configuration.');
}

manifest.oauth2.client_id = clients[target];
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Configured ${target} OAuth client in dist/manifest.json`);
