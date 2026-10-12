import fs from 'fs';

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

const response = await fetch(
  `https://api.supabase.com/v1/projects/${env.SUPABASE_PROJECT_REF}/database/query`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query:
        "select table_name from information_schema.tables where table_schema = 'public' order by table_name;",
    }),
  }
);

const text = await response.text();
console.log('tables_status', response.status);
console.log(text);

const rest = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/site_settings?select=id`, {
  headers: {
    apikey: env.VITE_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
  },
});
console.log('rest_status', rest.status);
console.log(await rest.text());
