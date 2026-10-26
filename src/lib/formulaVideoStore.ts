import { isSupabaseConfigured, supabase } from './supabase';
import { FormulaDaBelezaProgram, FormulaDaBelezaVideoColumn } from '../types';
import { canonicalYoutubeUrl } from './youtube';

const COLUMNS =
  'id, source_id, column_number, title, video_url, thumbnail_url, duration, active, featured_on_banner';

type VideoRow = {
  id: string;
  source_id: string | null;
  column_number: number;
  title: string;
  video_url: string;
  thumbnail_url: string;
  duration: string | null;
  active: boolean | null;
  featured_on_banner: boolean | null;
};

function requireClient() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase não está configurado neste ambiente.');
  }
  return supabase;
}

export function explainFormulaVideoError(error: { message: string; code?: string }) {
  if (error.code === '42501' || /row-level security/i.test(error.message)) {
    return 'O Supabase bloqueou a gravação dos vídeos. Execute supabase/migration/008_formula_videos_painel.sql no SQL Editor.';
  }
  if (/formula_da_beleza_videos/i.test(error.message) && /does not exist|schema cache|column|source_id/i.test(error.message)) {
    return 'Falta a estrutura dos vídeos do programa. Execute supabase/migration/008_formula_videos_painel.sql no SQL Editor.';
  }
  if (/formula_da_beleza/i.test(error.message) && /row-level security|does not exist|schema cache/i.test(error.message)) {
    return 'O Supabase bloqueou a gravação dos textos do programa. Execute supabase/migration/009_formula_programa_painel.sql no SQL Editor.';
  }
  return error.message;
}

function rowToColumn(row: VideoRow): FormulaDaBelezaVideoColumn {
  return {
    id: row.source_id || row.id,
    columnNumber: Number(row.column_number),
    title: row.title,
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url,
    duration: row.duration || '00:00',
    active: row.active !== false,
    featuredOnBanner: Boolean(row.featured_on_banner)
  };
}

function payloadFor(column: FormulaDaBelezaVideoColumn) {
  return {
    source_id: column.id,
    column_number: column.columnNumber,
    title: column.title.trim() || 'Sem título',
    video_url: canonicalYoutubeUrl(column.videoUrl),
    thumbnail_url: column.thumbnailUrl.trim(),
    duration: column.duration.trim() || '00:00',
    active: column.active,
    featured_on_banner: column.featuredOnBanner
  };
}

async function fetchRows() {
  const client = requireClient();
  const { data, error } = await client
    .from('formula_da_beleza_videos')
    .select(COLUMNS)
    .order('column_number', { ascending: true });
  if (error) throw new Error(explainFormulaVideoError(error));
  return (data || []) as VideoRow[];
}

export async function saveFormulaProgram(program: FormulaDaBelezaProgram) {
  const client = requireClient();
  const { error } = await client.from('formula_da_beleza').upsert({
    id: 'current',
    headline: program.headline,
    topics: program.topics,
    about_title: program.aboutTitle,
    about_description: program.aboutDescription,
    about_highlights: program.aboutHighlights,
    host_image_url: program.hostImageUrl,
    logo_url: program.logoUrl,
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(explainFormulaVideoError(error));
}

export async function saveFormulaVideos(columns: FormulaDaBelezaVideoColumn[]) {
  if (columns.length === 0) return;
  const client = requireClient();
  const { error } = await client
    .from('formula_da_beleza_videos')
    .upsert(columns.map(payloadFor), { onConflict: 'column_number' });
  if (error) throw new Error(explainFormulaVideoError(error));
}

/** Lê a tabela. Se estiver vazia, o painel continua com o que está no navegador até a próxima gravação. */
export async function syncFormulaVideos() {
  const remote = await fetchRows();
  return remote.map(rowToColumn);
}
