import { isSupabaseConfigured, supabase } from './supabase';

const BUCKET = 'imagens';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function uploadPortalImage(file: File, folder: string): Promise<string> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase não está configurado neste ambiente.');
  }
  if (!ALLOWED.has(file.type)) {
    throw new Error('Envie uma imagem JPG, PNG ou WebP.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('A imagem precisa ter no máximo 5 MB.');
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, '').replace(/^\/+|\/+$/g, '') || 'geral';
  const path = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
