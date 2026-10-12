import fs from 'fs';

const env = Object.fromEntries(
  fs
    .readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const index = line.indexOf('=');
      const value = line.slice(index + 1).replace(/^"|"$/g, '');
      return [line.slice(0, index), value];
    })
);

const sql = fs.readFileSync(new URL('../supabase_schema.sql', import.meta.url), 'utf8');

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

const text = await response.text();
console.log('status', response.status);
console.log(text.slice(0, 3000));
process.exit(response.ok ? 0 : 1);
