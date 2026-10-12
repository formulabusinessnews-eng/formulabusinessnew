import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Diagnostic status for the Supabase cloud connection
 */
export function getSupabaseStatus() {
  return {
    configured: isSupabaseConfigured,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 16)}...` : 'Não configurado (Usando LocalStorage Reactive Store)',
    mode: isSupabaseConfigured ? 'Supabase Cloud (PostgreSQL)' : 'Local Reactive Mock Engine'
  };
}
