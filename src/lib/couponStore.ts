import { initialCoupons } from './mockData';
import { isSupabaseConfigured, supabase } from './supabase';
import { Coupon } from '../types';

const COUPON_COLUMNS =
  'id, source_id, code, discount_percent, discount_fixed, min_purchase_value, first_purchase_only, seller_owner_code, active, uses_count, max_uses, expires_at';

type CouponRow = {
  id: string;
  source_id: string | null;
  code: string;
  discount_percent: number | string | null;
  discount_fixed: number | string | null;
  min_purchase_value: number | string | null;
  first_purchase_only: boolean | null;
  seller_owner_code: string | null;
  active: boolean | null;
  uses_count: number | string | null;
  max_uses: number | string | null;
  expires_at: string | null;
};

function requireClient() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase não está configurado neste ambiente.');
  }
  return supabase;
}

export function explainCouponError(error: { message: string; code?: string }) {
  if (error.code === '23505') {
    return 'Já existe um cupom com este código.';
  }
  if (error.code === '42501' || /row-level security/i.test(error.message)) {
    return 'O Supabase bloqueou a gravação dos cupons. Execute supabase/migration/006_coupons_painel.sql no SQL Editor.';
  }
  if (/coupons/i.test(error.message) && /does not exist|schema cache|column|source_id/i.test(error.message)) {
    return 'Falta a estrutura dos cupons. Execute supabase/migration/006_coupons_painel.sql no SQL Editor.';
  }
  return error.message;
}

export function sortCoupons(coupons: Coupon[]) {
  return [...coupons].sort((a, b) => a.code.localeCompare(b.code, 'pt-BR'));
}

function optionalNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function rowToCoupon(row: CouponRow): Coupon {
  return {
    id: row.source_id || row.id,
    code: row.code,
    discountPercent: Number(row.discount_percent || 0),
    discountFixed: optionalNumber(row.discount_fixed),
    minPurchaseValue: optionalNumber(row.min_purchase_value),
    firstPurchaseOnly: Boolean(row.first_purchase_only),
    sellerOwnerCode: row.seller_owner_code || undefined,
    active: row.active !== false,
    expiresAt: row.expires_at || '',
    usesCount: Number(row.uses_count || 0),
    maxUses: optionalNumber(row.max_uses)
  };
}

function payloadFor(coupon: Coupon) {
  return {
    source_id: coupon.id,
    code: coupon.code.trim().toUpperCase(),
    discount_percent: coupon.discountPercent,
    discount_fixed: coupon.discountFixed || 0,
    min_purchase_value: coupon.minPurchaseValue || 0,
    first_purchase_only: coupon.firstPurchaseOnly,
    seller_owner_code: coupon.sellerOwnerCode || null,
    active: coupon.active,
    uses_count: coupon.usesCount,
    max_uses: coupon.maxUses ?? null,
    expires_at: coupon.expiresAt || null
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function fetchRows() {
  const client = requireClient();
  const { data, error } = await client
    .from('coupons')
    .select(COUPON_COLUMNS)
    .order('code', { ascending: true });
  if (error) throw new Error(explainCouponError(error));
  return (data || []) as CouponRow[];
}

export async function insertCoupon(coupon: Coupon) {
  const client = requireClient();
  const { error } = await client.from('coupons').insert(payloadFor(coupon));
  if (error) throw new Error(explainCouponError(error));
}

export async function updateCouponRow(coupon: Coupon) {
  const client = requireClient();
  const query = client.from('coupons').update(payloadFor(coupon));
  const { error } = await (isUuid(coupon.id) ? query.eq('id', coupon.id) : query.eq('source_id', coupon.id));
  if (error) throw new Error(explainCouponError(error));
}

export async function deleteCouponRow(id: string) {
  const client = requireClient();
  const query = client.from('coupons').delete();
  const { error } = await (isUuid(id) ? query.eq('id', id) : query.eq('source_id', id));
  if (error) throw new Error(explainCouponError(error));
}

export async function incrementCouponUseRow(id: string, usesCount: number) {
  const client = requireClient();
  const query = client.from('coupons').update({ uses_count: usesCount });
  const { error } = await (isUuid(id) ? query.eq('id', id) : query.eq('source_id', id));
  if (error) throw new Error(explainCouponError(error));
}

/**
 * O banco passa a ser a lista oficial. Se ainda estiver vazio, grava os cupons
 * que o portal já exibe (incluindo ajustes feitos só neste navegador).
 */
export async function syncCoupons(localCoupons: Coupon[]) {
  const remote = await fetchRows();
  if (remote.length === 0) {
    const seed = sortCoupons(localCoupons.length ? localCoupons : initialCoupons);
    const client = requireClient();
    const { error } = await client.from('coupons').insert(seed.map(payloadFor));
    if (error && error.code !== '23505') throw new Error(explainCouponError(error));
    return sortCoupons((await fetchRows()).map(rowToCoupon));
  }
  return sortCoupons(remote.map(rowToCoupon));
}
