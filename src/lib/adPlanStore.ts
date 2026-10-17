import { initialAdPlans } from './mockData';
import { isSupabaseConfigured, supabase } from './supabase';
import { AdPlan } from '../types';

const PLAN_COLUMNS =
  'id, code, name, duration_days, price, discount_percentage, description, active, highlighted, sort_order';

type PlanRow = {
  id: string;
  code: string | null;
  name: string;
  duration_days: number;
  price: number | string;
  discount_percentage: number | null;
  description: string | null;
  active: boolean | null;
  highlighted: boolean | null;
  sort_order: number | null;
};

function requireClient() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase não está configurado neste ambiente.');
  }
  return supabase;
}

export function explainAdPlanError(error: { message: string; code?: string }) {
  if (error.code === '42501' || /row-level security/i.test(error.message)) {
    return 'O Supabase bloqueou a gravação dos pacotes. Execute supabase/migration/005_ad_plans_painel.sql no SQL Editor.';
  }
  if (/ad_plans/i.test(error.message) && /does not exist|schema cache|column|code/i.test(error.message)) {
    return 'Falta a estrutura dos pacotes de anúncio. Execute supabase/migration/005_ad_plans_painel.sql no SQL Editor.';
  }
  return error.message;
}

export function sortAdPlans(plans: AdPlan[]) {
  return [...plans].sort(
    (a, b) => a.durationDays - b.durationDays || a.price - b.price || a.name.localeCompare(b.name, 'pt-BR')
  );
}

function rowToPlan(row: PlanRow): AdPlan {
  return {
    id: row.code || row.id,
    name: row.name,
    durationDays: Number(row.duration_days),
    price: Number(row.price),
    discountPercentage: Number(row.discount_percentage || 0),
    active: row.active !== false,
    description: row.description || '',
    highlighted: Boolean(row.highlighted)
  };
}

function payloadFor(plan: AdPlan) {
  return {
    code: plan.id,
    name: plan.name.trim(),
    duration_days: plan.durationDays,
    price: plan.price,
    discount_percentage: plan.discountPercentage,
    description: plan.description.trim(),
    active: plan.active,
    highlighted: Boolean(plan.highlighted),
    sort_order: plan.durationDays
  };
}

async function fetchRows() {
  const client = requireClient();
  const { data, error } = await client
    .from('ad_plans')
    .select(PLAN_COLUMNS)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(explainAdPlanError(error));
  return (data || []) as PlanRow[];
}

async function clearOtherHighlights(keepCode: string) {
  const client = requireClient();
  const { error } = await client
    .from('ad_plans')
    .update({ highlighted: false })
    .neq('code', keepCode)
    .eq('highlighted', true);
  if (error) throw new Error(explainAdPlanError(error));
}

export async function insertAdPlan(plan: AdPlan) {
  const client = requireClient();
  const { error } = await client.from('ad_plans').insert(payloadFor(plan));
  if (error) throw new Error(explainAdPlanError(error));
  if (plan.highlighted) await clearOtherHighlights(plan.id);
}

export async function updateAdPlanRow(plan: AdPlan) {
  const client = requireClient();
  const { error } = await client.from('ad_plans').update(payloadFor(plan)).eq('code', plan.id);
  if (error) throw new Error(explainAdPlanError(error));
  if (plan.highlighted) await clearOtherHighlights(plan.id);
}

export async function deleteAdPlanRow(id: string) {
  const client = requireClient();
  const { error } = await client.from('ad_plans').delete().eq('code', id);
  if (error) throw new Error(explainAdPlanError(error));
}

/**
 * O banco passa a ser a lista oficial. Se ainda estiver vazio, grava os pacotes
 * que o portal já exibe (incluindo ajustes feitos só neste navegador).
 */
export async function syncAdPlans(localPlans: AdPlan[]) {
  const remote = await fetchRows();
  if (remote.length === 0) {
    const seed = sortAdPlans(localPlans.length ? localPlans : initialAdPlans);
    const client = requireClient();
    const { error } = await client.from('ad_plans').insert(seed.map(payloadFor));
    if (error && error.code !== '23505') throw new Error(explainAdPlanError(error));
    return sortAdPlans((await fetchRows()).map(rowToPlan));
  }
  return sortAdPlans(remote.map(rowToPlan));
}
