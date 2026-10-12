import { initialCategories } from './mockData';
import { isSupabaseConfigured, supabase } from './supabase';
import { NewsItem } from '../types';

const LIFT_KEY = 'editorial_news_lifted_v1';
const NEWS_COLUMNS =
  'id, title, slug, excerpt, content, category_id, category_name, image_url, author, status, featured, breaking_news, views_count, read_time, tags, published_at, source_id';

type NewsRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: string | null;
  category_name: string;
  image_url: string;
  author: string;
  status: string | null;
  featured: boolean | null;
  breaking_news: boolean | null;
  views_count: number | string | null;
  read_time: string | null;
  tags: string[] | null;
  published_at: string;
  source_id: string | null;
};

function requireClient() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase não está configurado neste ambiente.');
  }
  return supabase;
}

export function explainNewsError(error: { message: string; code?: string }) {
  if (error.code === '42501' || /row-level security/i.test(error.message)) {
    return 'O Supabase bloqueou a gravação. Execute supabase/migration/004_news_painel.sql no SQL Editor.';
  }
  if (/portal_meta/i.test(error.message) && /does not exist|schema cache/i.test(error.message)) {
    return 'Falta a tabela de controle do acervo. Execute supabase/migration/004_news_painel.sql no SQL Editor.';
  }
  return error.message;
}

export function isNewsUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function slugifyNewsTitle(title: string) {
  const base = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `noticia-${Date.now()}`;
}

export function sortNewsByDate(items: NewsItem[]) {
  return [...items].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function publishedNews(items: NewsItem[]) {
  return sortNewsByDate(items.filter(item => item.status === 'PUBLISHED'));
}

function rowToNews(row: NewsRow): NewsItem {
  const status = row.status === 'DRAFT' || row.status === 'SCHEDULED' ? row.status : 'PUBLISHED';
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category_name,
    imageUrl: row.image_url,
    author: row.author,
    publishedAt: row.published_at,
    featured: Boolean(row.featured),
    breakingNews: Boolean(row.breaking_news),
    views: Number(row.views_count || 0),
    readTime: row.read_time || '4 min',
    status,
    tags: row.tags || []
  };
}

async function categoryIdByName() {
  const client = requireClient();
  const { data, error } = await client.from('categories').select('id, name');
  if (error) return new Map(initialCategories.map(item => [item.name, '']));
  return new Map((data || []).map(item => [item.name as string, item.id as string]));
}

function categoryIdFor(name: string, categories: Map<string, string>) {
  const id = categories.get(name);
  return id && isNewsUuid(id) ? id : null;
}

function findRemote(rows: NewsRow[], item: NewsItem) {
  return rows.find(row =>
    row.slug === item.slug ||
    row.id === item.id ||
    (row.source_id && row.source_id === item.id)
  );
}

async function fetchRows() {
  const client = requireClient();
  const { data, error } = await client
    .from('news')
    .select(NEWS_COLUMNS)
    .order('published_at', { ascending: false });
  if (error) throw new Error(explainNewsError(error));
  return (data || []) as NewsRow[];
}

async function readLiftedFlag() {
  const client = requireClient();
  const { data, error } = await client
    .from('portal_meta')
    .select('value')
    .eq('key', LIFT_KEY)
    .maybeSingle();
  if (error) throw new Error(explainNewsError(error));
  return data?.value === '1';
}

async function markLifted() {
  const client = requireClient();
  const { error } = await client.from('portal_meta').upsert({
    key: LIFT_KEY,
    value: '1',
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(explainNewsError(error));
}

function payloadFor(item: NewsItem, categories: Map<string, string>, sourceId: string | null) {
  return {
    id: isNewsUuid(item.id) ? item.id : crypto.randomUUID(),
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    category_id: categoryIdFor(item.category, categories),
    category_name: item.category,
    image_url: item.imageUrl,
    author: item.author,
    status: item.status,
    featured: Boolean(item.featured),
    breaking_news: Boolean(item.breakingNews),
    views_count: item.views || 0,
    read_time: item.readTime || '4 min',
    tags: item.tags || [],
    published_at: item.publishedAt,
    source_id: sourceId
  };
}

export async function insertNews(item: NewsItem) {
  const client = requireClient();
  const categories = await categoryIdByName();
  const sourceId = isNewsUuid(item.id) ? null : item.id;
  const { error } = await client.from('news').insert(payloadFor(item, categories, sourceId));
  if (error) throw new Error(explainNewsError(error));
}

export async function updateNewsRow(item: NewsItem) {
  const client = requireClient();
  const categories = await categoryIdByName();
  const payload = payloadFor(item, categories, null);
  const changes = {
    title: payload.title,
    slug: payload.slug,
    excerpt: payload.excerpt,
    content: payload.content,
    category_id: payload.category_id,
    category_name: payload.category_name,
    image_url: payload.image_url,
    author: payload.author,
    status: payload.status,
    featured: payload.featured,
    breaking_news: payload.breaking_news,
    views_count: payload.views_count,
    read_time: payload.read_time,
    tags: payload.tags,
    published_at: payload.published_at
  };
  const query = client.from('news').update(changes);
  const { error } = isNewsUuid(item.id)
    ? await query.eq('id', item.id)
    : await query.eq('slug', item.slug);
  if (error) throw new Error(explainNewsError(error));
}

export async function deleteNewsRow(id: string) {
  const client = requireClient();
  const column = isNewsUuid(id) ? 'id' : 'source_id';
  const { error } = await client.from('news').delete().eq(column, id);
  if (error) throw new Error(explainNewsError(error));
}

async function writeMissing(items: NewsItem[], remote: NewsRow[], publishedAtFor?: (index: number) => string) {
  const categories = await categoryIdByName();
  const client = requireClient();
  const missing = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !findRemote(remote, item));
  if (!missing.length) return;

  const rows = missing.map(({ item, index }) => {
    const publishedAt = publishedAtFor ? publishedAtFor(index) : item.publishedAt;
    const sourceId = isNewsUuid(item.id) ? null : item.id;
    return payloadFor({ ...item, publishedAt }, categories, sourceId);
  });

  const { error } = await client.from('news').insert(rows);
  if (error && error.code !== '23505') throw new Error(explainNewsError(error));
}

/** Coloca a lista recebida acima do que já está no banco e grava o que ainda não existia. */
export async function republishNewsOnTop(items: NewsItem[]) {
  const client = requireClient();
  const remote = await fetchRows();
  const now = Date.now();

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const publishedAt = new Date(now - index * 1000).toISOString();
    const found = findRemote(remote, item);
    if (!found) continue;
    const { error } = await client
      .from('news')
      .update({ published_at: publishedAt })
      .eq('id', found.id);
    if (error) throw new Error(explainNewsError(error));
  }

  await writeMissing(items, remote, index => new Date(now - index * 1000).toISOString());
  await markLifted();
}

/**
 * Na primeira sincronização, republica as matérias que o site já exibe
 * com data mais nova que o restante do banco, para a home não abrir vazia.
 */
export async function syncNewsWithSupabase(localItems: NewsItem[]) {
  const lifted = await readLiftedFlag();
  if (!lifted) {
    await republishNewsOnTop(localItems);
  } else {
    const remote = await fetchRows();
    await writeMissing(localItems, remote, index => new Date(Date.now() - index * 1000).toISOString());
  }
  return sortNewsByDate((await fetchRows()).map(rowToNews));
}
