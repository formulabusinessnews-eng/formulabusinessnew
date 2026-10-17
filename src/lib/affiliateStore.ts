import { isSupabaseConfigured, supabase } from './supabase';
import { AffiliateSeller, CommissionRecord } from '../types';

const SELLER_COLUMNS =
  'id, source_id, user_id, name, email, phone, code, coupon_code, commission_rate, status, total_referred_clients, total_sales_volume, accumulated_commission, available_commission, paid_commission, pending_commission, created_at';

const COMMISSION_COLUMNS =
  'id, source_id, seller_code, campaign_id, campaign_code, advertiser_name, original_gross_amount, discount_amount, net_paid_amount, commission_rate, commission_amount, status, created_at, paid_at';

type SellerRow = {
  id: string;
  source_id: string | null;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  code: string;
  coupon_code: string;
  commission_rate: number | string | null;
  status: string | null;
  total_referred_clients: number | string | null;
  total_sales_volume: number | string | null;
  accumulated_commission: number | string | null;
  available_commission: number | string | null;
  paid_commission: number | string | null;
  pending_commission: number | string | null;
  created_at: string | null;
};

type CommissionRow = {
  id: string;
  source_id: string | null;
  seller_code: string;
  campaign_id: string | null;
  campaign_code: string;
  advertiser_name: string;
  original_gross_amount: number | string;
  discount_amount: number | string | null;
  net_paid_amount: number | string;
  commission_rate: number | string | null;
  commission_amount: number | string;
  status: string | null;
  created_at: string | null;
  paid_at: string | null;
};

function requireClient() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase não está configurado neste ambiente.');
  }
  return supabase;
}

export function explainAffiliateError(error: { message: string; code?: string }) {
  if (error.code === '23505') {
    if (/coupon/i.test(error.message)) return 'Já existe um consultor com este cupom.';
    return 'Já existe um consultor com este código.';
  }
  if (error.code === '42501' || /row-level security/i.test(error.message)) {
    return 'O Supabase bloqueou a leitura dos afiliados. Execute supabase/migration/007_affiliates_painel.sql no SQL Editor.';
  }
  if (/affiliate_sellers|commissions/i.test(error.message) && /does not exist|schema cache|column|source_id/i.test(error.message)) {
    return 'Falta a estrutura de afiliados. Execute supabase/migration/007_affiliates_painel.sql no SQL Editor.';
  }
  return error.message;
}

function asNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function sellerStatus(value: string | null): AffiliateSeller['status'] {
  if (value === 'PENDING' || value === 'INACTIVE' || value === 'ACTIVE') return value;
  return 'ACTIVE';
}

function commissionStatus(value: string | null): CommissionRecord['status'] {
  if (value === 'PENDING' || value === 'PAID' || value === 'AVAILABLE') return value;
  return 'AVAILABLE';
}

export function sortAffiliates(sellers: AffiliateSeller[]) {
  return [...sellers].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function sortCommissions(records: CommissionRecord[]) {
  return [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function rowToSeller(row: SellerRow): AffiliateSeller {
  return {
    id: row.source_id || row.id,
    userId: row.user_id || '',
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    code: row.code,
    couponCode: row.coupon_code,
    commissionRate: asNumber(row.commission_rate) || 0.1,
    status: sellerStatus(row.status),
    totalReferredClients: asNumber(row.total_referred_clients),
    totalSalesVolume: asNumber(row.total_sales_volume),
    accumulatedCommission: asNumber(row.accumulated_commission),
    availableCommission: asNumber(row.available_commission),
    paidCommission: asNumber(row.paid_commission),
    pendingCommission: asNumber(row.pending_commission),
    createdAt: row.created_at || new Date().toISOString()
  };
}

function rowToCommission(row: CommissionRow): CommissionRecord {
  return {
    id: row.source_id || row.id,
    sellerCode: row.seller_code,
    campaignId: row.campaign_id || '',
    campaignCode: row.campaign_code,
    advertiserName: row.advertiser_name,
    originalGrossAmount: asNumber(row.original_gross_amount),
    discountAmount: asNumber(row.discount_amount),
    netPaidAmount: asNumber(row.net_paid_amount),
    commissionRate: asNumber(row.commission_rate) || 0.1,
    commissionAmount: asNumber(row.commission_amount),
    status: commissionStatus(row.status),
    createdAt: row.created_at || new Date().toISOString(),
    paidAt: row.paid_at || undefined
  };
}

function sellerPayload(seller: AffiliateSeller) {
  return {
    source_id: seller.id,
    user_id: seller.userId && isUuid(seller.userId) ? seller.userId : null,
    name: seller.name.trim(),
    email: seller.email.trim(),
    phone: seller.phone.trim() || null,
    code: seller.code.trim().toUpperCase(),
    coupon_code: seller.couponCode.trim().toUpperCase(),
    commission_rate: seller.commissionRate,
    status: seller.status,
    total_referred_clients: seller.totalReferredClients,
    total_sales_volume: seller.totalSalesVolume,
    accumulated_commission: seller.accumulatedCommission,
    available_commission: seller.availableCommission,
    paid_commission: seller.paidCommission,
    pending_commission: seller.pendingCommission,
    created_at: seller.createdAt
  };
}

function commissionPayload(record: CommissionRecord) {
  return {
    source_id: record.id,
    seller_code: record.sellerCode.trim().toUpperCase(),
    campaign_id: record.campaignId && isUuid(record.campaignId) ? record.campaignId : null,
    campaign_code: record.campaignCode,
    advertiser_name: record.advertiserName,
    original_gross_amount: record.originalGrossAmount,
    discount_amount: record.discountAmount,
    net_paid_amount: record.netPaidAmount,
    commission_rate: record.commissionRate,
    commission_amount: record.commissionAmount,
    status: record.status,
    created_at: record.createdAt,
    paid_at: record.paidAt || null
  };
}

function matchId<T extends { eq: (column: string, value: string) => T }>(query: T, id: string) {
  return isUuid(id) ? query.eq('id', id) : query.eq('source_id', id);
}

async function fetchSellerRows() {
  const client = requireClient();
  const { data, error } = await client.from('affiliate_sellers').select(SELLER_COLUMNS).order('name', { ascending: true });
  if (error) throw new Error(explainAffiliateError(error));
  return (data || []) as SellerRow[];
}

async function fetchCommissionRows() {
  const client = requireClient();
  const { data, error } = await client
    .from('commissions')
    .select(COMMISSION_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw new Error(explainAffiliateError(error));
  return (data || []) as CommissionRow[];
}

export async function insertAffiliate(seller: AffiliateSeller) {
  const client = requireClient();
  const { error } = await client.from('affiliate_sellers').insert(sellerPayload(seller));
  if (error) throw new Error(explainAffiliateError(error));
}

export async function updateAffiliateRow(seller: AffiliateSeller) {
  const client = requireClient();
  const { error } = await matchId(client.from('affiliate_sellers').update(sellerPayload(seller)), seller.id);
  if (error) throw new Error(explainAffiliateError(error));
}

export async function deleteAffiliateRow(id: string) {
  const client = requireClient();
  const { error } = await matchId(client.from('affiliate_sellers').delete(), id);
  if (error) throw new Error(explainAffiliateError(error));
}

export async function insertCommission(record: CommissionRecord) {
  const client = requireClient();
  const { error } = await client.from('commissions').insert(commissionPayload(record));
  if (error) throw new Error(explainAffiliateError(error));
}

export async function updateCommissionRow(record: CommissionRecord) {
  const client = requireClient();
  const { error } = await matchId(client.from('commissions').update(commissionPayload(record)), record.id);
  if (error) throw new Error(explainAffiliateError(error));
}

/** O banco é a lista oficial. Tabelas vazias permanecem vazias: o painel não inventa consultores. */
export async function syncAffiliatesAndCommissions() {
  const [sellers, commissions] = await Promise.all([fetchSellerRows(), fetchCommissionRows()]);
  return {
    affiliates: sortAffiliates(sellers.map(rowToSeller)),
    commissions: sortCommissions(commissions.map(rowToCommission))
  };
}
