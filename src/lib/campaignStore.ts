import { isSupabaseConfigured, supabase } from './supabase';
import { AdCampaign, AdPosition, CampaignStatus } from '../types';

const CAMPAIGN_COLUMNS =
  'id, campaign_code, advertiser_id, advertiser_name, advertiser_email, company_name, campaign_name, destination_url, creative_desktop_url, creative_mobile_url, position, plan_id, plan_code, plan_name, start_date, end_date, original_price, coupon_code_used, discount_amount, net_amount_paid, status, referred_by_seller_code, seller_commission_amount, seller_commission_paid, impressions_count, clicks_count, created_at';

type CampaignRow = {
  id: string;
  campaign_code: string;
  advertiser_id: string | null;
  advertiser_name: string;
  advertiser_email: string;
  company_name: string;
  campaign_name: string;
  destination_url: string;
  creative_desktop_url: string;
  creative_mobile_url: string;
  position: AdPosition;
  plan_id: string | null;
  plan_code: string | null;
  plan_name: string;
  start_date: string;
  end_date: string;
  original_price: number | string;
  coupon_code_used: string | null;
  discount_amount: number | string | null;
  net_amount_paid: number | string;
  status: string | null;
  referred_by_seller_code: string | null;
  seller_commission_amount: number | string | null;
  seller_commission_paid: boolean | null;
  impressions_count: number | string | null;
  clicks_count: number | string | null;
  created_at: string | null;
};

const STATUSES: CampaignStatus[] = [
  'DRAFT',
  'WAITING_APPROVAL',
  'SCHEDULED',
  'ACTIVE',
  'PAUSED',
  'EXPIRED',
  'CANCELLED'
];

function requireClient() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase não está configurado neste ambiente.');
  }
  return supabase;
}

export function explainCampaignError(error: { message: string; code?: string }) {
  if (error.code === '23505') return 'Já existe uma campanha com este código.';
  if (error.code === '42501' || /row-level security/i.test(error.message)) {
    return 'O Supabase bloqueou a campanha. Execute supabase/migration/008_acessos_afiliado_anunciante.sql no SQL Editor.';
  }
  if (/ad_campaigns/i.test(error.message) && /does not exist|schema cache|plan_code/i.test(error.message)) {
    return 'Falta a estrutura das campanhas. Execute supabase/migration/008_acessos_afiliado_anunciante.sql no SQL Editor.';
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

function asStatus(value: string | null): CampaignStatus {
  return STATUSES.includes(value as CampaignStatus) ? (value as CampaignStatus) : 'ACTIVE';
}

export function sortCampaigns(campaigns: AdCampaign[]) {
  return [...campaigns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function rowToCampaign(row: CampaignRow): AdCampaign {
  return {
    id: row.id,
    campaignCode: row.campaign_code,
    advertiserId: row.advertiser_id || '',
    advertiserName: row.advertiser_name,
    advertiserEmail: row.advertiser_email,
    companyName: row.company_name,
    campaignName: row.campaign_name,
    destinationUrl: row.destination_url,
    creativeDesktopUrl: row.creative_desktop_url,
    creativeMobileUrl: row.creative_mobile_url,
    position: row.position,
    planId: row.plan_code || row.plan_id || '',
    planName: row.plan_name,
    startDate: row.start_date,
    endDate: row.end_date,
    originalPrice: asNumber(row.original_price),
    couponCodeUsed: row.coupon_code_used || undefined,
    discountAmount: asNumber(row.discount_amount),
    netAmountPaid: asNumber(row.net_amount_paid),
    status: asStatus(row.status),
    referredBySellerCode: row.referred_by_seller_code || undefined,
    sellerCommissionAmount: asNumber(row.seller_commission_amount),
    sellerCommissionPaid: Boolean(row.seller_commission_paid),
    createdAt: row.created_at || new Date().toISOString(),
    impressions: asNumber(row.impressions_count),
    clicks: asNumber(row.clicks_count)
  };
}

async function resolvePlanUuid(planCode: string) {
  if (!planCode) return null;
  if (isUuid(planCode)) return planCode;
  const client = requireClient();
  const { data, error } = await client.from('ad_plans').select('id').eq('code', planCode).maybeSingle();
  if (error) throw new Error(explainCampaignError(error));
  return (data?.id as string | undefined) || null;
}

async function payloadFor(campaign: AdCampaign) {
  const planId = await resolvePlanUuid(campaign.planId);
  return {
    campaign_code: campaign.campaignCode,
    advertiser_id: campaign.advertiserId && isUuid(campaign.advertiserId) ? campaign.advertiserId : null,
    advertiser_name: campaign.advertiserName,
    advertiser_email: campaign.advertiserEmail.trim().toLowerCase(),
    company_name: campaign.companyName,
    campaign_name: campaign.campaignName,
    destination_url: campaign.destinationUrl,
    creative_desktop_url: campaign.creativeDesktopUrl,
    creative_mobile_url: campaign.creativeMobileUrl,
    position: campaign.position,
    plan_id: planId,
    plan_code: campaign.planId || null,
    plan_name: campaign.planName,
    start_date: campaign.startDate,
    end_date: campaign.endDate,
    original_price: campaign.originalPrice,
    coupon_code_used: campaign.couponCodeUsed || null,
    discount_amount: campaign.discountAmount,
    net_amount_paid: campaign.netAmountPaid,
    status: campaign.status,
    referred_by_seller_code: campaign.referredBySellerCode || null,
    seller_commission_amount: campaign.sellerCommissionAmount || 0,
    seller_commission_paid: Boolean(campaign.sellerCommissionPaid),
    impressions_count: campaign.impressions,
    clicks_count: campaign.clicks,
    created_at: campaign.createdAt
  };
}

export async function fetchCampaigns() {
  const client = requireClient();
  const { data, error } = await client
    .from('ad_campaigns')
    .select(CAMPAIGN_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw new Error(explainCampaignError(error));
  return sortCampaigns(((data || []) as CampaignRow[]).map(rowToCampaign));
}

export async function insertCampaignRow(campaign: AdCampaign) {
  const client = requireClient();
  const { data, error } = await client
    .from('ad_campaigns')
    .insert(await payloadFor(campaign))
    .select(CAMPAIGN_COLUMNS)
    .single();
  if (error) throw new Error(explainCampaignError(error));
  return rowToCampaign(data as CampaignRow);
}

export async function updateCampaignRow(campaign: AdCampaign) {
  const client = requireClient();
  const { data, error } = await client
    .from('ad_campaigns')
    .update(await payloadFor(campaign))
    .eq('id', campaign.id)
    .select(CAMPAIGN_COLUMNS)
    .single();
  if (error) throw new Error(explainCampaignError(error));
  return rowToCampaign(data as CampaignRow);
}

export async function bumpCampaignStat(id: string, kind: 'click' | 'impression') {
  if (!isUuid(id) || !supabase) return;
  await supabase.rpc('bump_campaign_stat', { campaign: id, kind });
}
