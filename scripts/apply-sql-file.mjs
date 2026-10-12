import fs from 'fs';

const file = process.argv[2];
if (!file) {
  console.error('Uso: node scripts/apply-sql-file.mjs <arquivo.sql>');
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, '')];
    })
);

const sql = fs.readFileSync(file, 'utf8');
const response = await fetch(
  `https://api.supabase.com/v1/projects/${env.SUPABASE_PROJECT_REF}/database/query`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  }
);

console.log('status', response.status);
console.log((await response.text()).slice(0, 1500));
process.exit(response.ok ? 0 : 1);
