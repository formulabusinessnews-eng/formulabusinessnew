import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';
import { UserProfile, UserRole } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

type ProfileRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url: string | null;
  phone: string | null;
  company_name: string | null;
  affiliate_code: string | null;
  referred_by: string | null;
  created_at: string | null;
};

const ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'EDITOR',
  'FINANCE',
  'AD_MANAGER',
  'SELLER',
  'ADVERTISER',
  'USER'
];

function requireClient() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase não está configurado neste ambiente.');
  }
  return supabase;
}

export function explainAccountError(error: { message: string; code?: string }) {
  if (error.code === '23505') return 'Este e-mail já está cadastrado.';
  if (error.code === '23503') {
    return 'A conta de acesso foi criada, mas o perfil não pôde ser vinculado. Execute supabase/migration/008_acessos_afiliado_anunciante.sql no SQL Editor.';
  }
  if (error.code === '42501' || /row-level security/i.test(error.message)) {
    return 'O Supabase bloqueou o cadastro do perfil. Execute supabase/migration/008_acessos_afiliado_anunciante.sql no SQL Editor.';
  }
  if (/profiles/i.test(error.message) && /does not exist|schema cache/i.test(error.message)) {
    return 'Falta a tabela profiles. Execute o schema do portal no SQL Editor.';
  }
  return error.message;
}

function asRole(value: string): UserRole {
  return ROLES.includes(value as UserRole) ? (value as UserRole) : 'USER';
}

export function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: asRole(row.role),
    avatarUrl: row.avatar_url || undefined,
    phone: row.phone || undefined,
    companyName: row.company_name || undefined,
    affiliateCode: row.affiliate_code || undefined,
    referredBy: row.referred_by || undefined,
    createdAt: row.created_at || new Date().toISOString()
  };
}

export async function fetchProfileById(id: string) {
  const client = requireClient();
  const { data, error } = await client
    .from('profiles')
    .select('id, email, name, role, avatar_url, phone, company_name, affiliate_code, referred_by, created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(explainAccountError(error));
  return data ? rowToProfile(data as ProfileRow) : null;
}

export async function findProfileIdByEmail(email: string) {
  const client = requireClient();
  const { data, error } = await client
    .from('profiles')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();
  if (error) throw new Error(explainAccountError(error));
  return (data?.id as string | undefined) || '';
}

export async function registerPortalUser(input: {
  email: string;
  password: string;
  name: string;
  role: 'SELLER' | 'ADVERTISER';
  phone?: string;
  companyName?: string;
  affiliateCode?: string;
}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase não está configurado neste ambiente.');
  }

  const email = input.email.trim().toLowerCase();
  const signupClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });

  const { data, error } = await signupClient.auth.signUp({
    email,
    password: input.password,
    options: { data: { name: input.name.trim(), role: input.role } }
  });

  if (error) throw new Error(explainAccountError(error));
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error('Este e-mail já está cadastrado na autenticação.');
  }
  const userId = data.user?.id;
  if (!userId) {
    throw new Error('O Supabase não devolveu a conta. Confira se o cadastro por e-mail está liberado no projeto.');
  }

  const client = requireClient();
  const { error: profileError } = await client.from('profiles').insert({
    id: userId,
    email,
    name: input.name.trim(),
    role: input.role,
    phone: input.phone?.trim() || null,
    company_name: input.companyName?.trim() || null,
    affiliate_code: input.affiliateCode?.trim().toUpperCase() || null
  });
  if (profileError) throw new Error(explainAccountError(profileError));

  return userId;
}
