import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import {
  initialAdCampaigns,
  initialAdPlans,
  initialCategories,
  initialCommissions,
  initialCoupons,
  initialEvents,
  initialFormulaDaBelezaProgram,
  initialMagazineIssues,
  initialNews,
  initialSellers,
  initialSiteSettings,
  initialTickerItems,
  initialVideos
} from '../src/lib/mockData';

const outDir = path.resolve('supabase/migration/planilhas');

function uuidFrom(key: string) {
  const hash = createHash('md5').update(`fbn:${key}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function pgArray(values: string[]) {
  if (!values.length) return '{}';
  return `{${values.map((value) => `"${value.replace(/"/g, '\\"')}"`).join(',')}}`;
}

function csvEscape(value: unknown) {
  if (value === null || value === undefined || value === '') return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(fileName: string, headers: string[], rows: Record<string, unknown>[]) {
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))
  ];
  fs.writeFileSync(path.join(outDir, fileName), `\uFEFF${lines.join('\r\n')}\r\n`, 'utf8');
}

fs.mkdirSync(outDir, { recursive: true });

const categoryId = new Map(initialCategories.map((item) => [item.name, uuidFrom(item.id)]));
const planId = new Map(initialAdPlans.map((item) => [item.id, uuidFrom(item.id)]));
const campaignId = new Map(initialAdCampaigns.map((item) => [item.id, uuidFrom(item.id)]));
const issueId = new Map(initialMagazineIssues.map((item) => [item.id, uuidFrom(item.id)]));

writeCsv(
  '01_categories.csv',
  ['id', 'source_id', 'name', 'slug', 'color', 'sort_order'],
  initialCategories.map((item, index) => ({
    id: uuidFrom(item.id),
    source_id: item.id,
    name: item.name,
    slug: item.slug,
    color: item.color,
    sort_order: index + 1
  }))
);

writeCsv(
  '02_site_settings.csv',
  [
    'id', 'portal_name', 'tagline', 'logo_url', 'favicon_url', 'contact_email', 'contact_phone',
    'contact_whatsapp', 'primary_color', 'gold_color', 'is_live', 'live_title', 'live_stream_url',
    'facebook_url', 'instagram_url', 'youtube_url', 'linkedin_url', 'ga_id', 'pixel_id'
  ],
  [{
    id: 'current',
    portal_name: initialSiteSettings.portalName,
    tagline: initialSiteSettings.tagline,
    logo_url: initialSiteSettings.logoUrl,
    favicon_url: '/assets/logo/favicon.png',
    contact_email: initialSiteSettings.contactEmail,
    contact_phone: initialSiteSettings.contactPhone,
    contact_whatsapp: initialSiteSettings.contactWhatsapp,
    primary_color: initialSiteSettings.primaryColor,
    gold_color: initialSiteSettings.goldColor,
    is_live: initialSiteSettings.isLive,
    live_title: initialSiteSettings.liveTitle,
    live_stream_url: initialSiteSettings.liveStreamUrl,
    facebook_url: initialSiteSettings.facebookUrl,
    instagram_url: initialSiteSettings.instagramUrl,
    youtube_url: initialSiteSettings.youtubeUrl,
    linkedin_url: initialSiteSettings.linkedinUrl,
    ga_id: initialSiteSettings.googleAnalyticsId,
    pixel_id: initialSiteSettings.metaPixelId
  }]
);

writeCsv(
  '03_breaking_news_ticker.csv',
  ['id', 'source_id', 'text', 'link', 'priority', 'active', 'language'],
  initialTickerItems.map((item) => ({
    id: uuidFrom(item.id),
    source_id: item.id,
    text: item.text,
    link: item.link || '',
    priority: item.priority,
    active: item.active,
    language: item.language || 'pt-BR'
  }))
);

writeCsv(
  '04_news.csv',
  [
    'id', 'source_id', 'title', 'slug', 'excerpt', 'content', 'category_id', 'category_name',
    'image_url', 'author', 'status', 'featured', 'breaking_news', 'views_count', 'read_time',
    'tags', 'published_at'
  ],
  initialNews.map((item) => ({
    id: uuidFrom(item.id),
    source_id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    category_id: categoryId.get(item.category) || '',
    category_name: item.category,
    image_url: item.imageUrl,
    author: item.author,
    status: item.status,
    featured: item.featured,
    breaking_news: item.breakingNews,
    views_count: item.views,
    read_time: item.readTime,
    tags: pgArray(item.tags),
    published_at: item.publishedAt
  }))
);

writeCsv(
  '05_videos.csv',
  [
    'id', 'source_id', 'column_number', 'title', 'description', 'video_url', 'thumbnail_url',
    'duration', 'category', 'is_hero_featured', 'is_short', 'views_count', 'published_at'
  ],
  initialVideos.map((item) => ({
    id: uuidFrom(item.id),
    source_id: item.id,
    column_number: item.columnNumber,
    title: item.title,
    description: item.description,
    video_url: item.videoUrl,
    thumbnail_url: item.thumbnailUrl,
    duration: item.duration,
    category: item.category,
    is_hero_featured: item.isHeroFeatured,
    is_short: item.isShort,
    views_count: item.views,
    published_at: item.publishedAt
  }))
);

writeCsv(
  '06_magazine_issues.csv',
  [
    'id', 'source_id', 'issue_number', 'title', 'subtitle', 'description', 'cover_image_url',
    'pdf_url', 'publish_date', 'pages_count', 'status', 'featured', 'download_allowed',
    'theme_color', 'client_access_link', 'client_advertisers_featured'
  ],
  initialMagazineIssues.map((item) => ({
    id: issueId.get(item.id),
    source_id: item.id,
    issue_number: item.issueNumber,
    title: item.title,
    subtitle: item.subtitle,
    description: item.description,
    cover_image_url: item.coverImageUrl,
    pdf_url: item.pdfUrl || '',
    publish_date: item.publishDate,
    pages_count: item.pagesCount,
    status: item.status,
    featured: item.featured,
    download_allowed: item.downloadAllowed,
    theme_color: item.themeColor || '',
    client_access_link: item.clientAccessLink || '',
    client_advertisers_featured: pgArray(item.clientAdvertisersFeatured)
  }))
);

writeCsv(
  '07_magazine_pages.csv',
  ['id', 'issue_id', 'page_number', 'image_url', 'title', 'description', 'featured_advertiser'],
  initialMagazineIssues.flatMap((issue) =>
    issue.pages.map((page) => ({
      id: uuidFrom(`${issue.id}-p${page.pageNumber}`),
      issue_id: issueId.get(issue.id),
      page_number: page.pageNumber,
      image_url: page.imageUrl,
      title: page.title || '',
      description: page.description || '',
      featured_advertiser: page.featuredAdvertiser || ''
    }))
  )
);

writeCsv(
  '08_magazine_readership_analytics.csv',
  [
    'id', 'issue_id', 'total_readers', 'total_pageviews', 'avg_read_time_seconds', 'completion_rate',
    'downloads_count', 'shares_count', 'page_dropoffs', 'device_breakdown', 'region_breakdown', 'last_updated'
  ],
  initialMagazineIssues.map((issue) => ({
    id: uuidFrom(`${issue.id}-analytics`),
    issue_id: issueId.get(issue.id),
    total_readers: issue.analytics.totalReaders,
    total_pageviews: issue.analytics.totalPageviews,
    avg_read_time_seconds: Math.round(issue.analytics.avgReadTimeMinutes * 60),
    completion_rate: issue.analytics.completionRate,
    downloads_count: issue.analytics.downloadsCount,
    shares_count: issue.analytics.sharesCount,
    page_dropoffs: JSON.stringify(issue.analytics.pageDropoffs),
    device_breakdown: JSON.stringify(issue.analytics.devices),
    region_breakdown: JSON.stringify(issue.analytics.regions),
    last_updated: issue.analytics.lastUpdated
  }))
);

writeCsv(
  '09_ad_plans.csv',
  ['id', 'source_id', 'name', 'duration_days', 'price', 'discount_percentage', 'description', 'active', 'highlighted', 'sort_order'],
  initialAdPlans.map((item, index) => ({
    id: planId.get(item.id),
    source_id: item.id,
    name: item.name,
    duration_days: item.durationDays,
    price: item.price,
    discount_percentage: item.discountPercentage,
    description: item.description,
    active: item.active,
    highlighted: Boolean(item.highlighted),
    sort_order: index + 1
  }))
);

writeCsv(
  '10_coupons.csv',
  [
    'id', 'source_id', 'code', 'discount_percent', 'discount_fixed', 'min_purchase_value',
    'first_purchase_only', 'seller_owner_code', 'active', 'uses_count', 'max_uses', 'expires_at'
  ],
  initialCoupons.map((item) => ({
    id: uuidFrom(item.id),
    source_id: item.id,
    code: item.code,
    discount_percent: item.discountPercent,
    discount_fixed: item.discountFixed || 0,
    min_purchase_value: item.minPurchaseValue || 0,
    first_purchase_only: item.firstPurchaseOnly,
    seller_owner_code: item.sellerOwnerCode || '',
    active: item.active,
    uses_count: item.usesCount,
    max_uses: item.maxUses || '',
    expires_at: item.expiresAt
  }))
);

writeCsv(
  '11_ad_campaigns.csv',
  [
    'id', 'source_id', 'campaign_code', 'advertiser_name', 'advertiser_email', 'company_name',
    'campaign_name', 'destination_url', 'creative_desktop_url', 'creative_mobile_url', 'position',
    'plan_id', 'plan_name', 'start_date', 'end_date', 'original_price', 'coupon_code_used',
    'discount_amount', 'net_amount_paid', 'status', 'referred_by_seller_code',
    'seller_commission_amount', 'seller_commission_paid', 'impressions_count', 'clicks_count', 'created_at'
  ],
  initialAdCampaigns.map((item) => ({
    id: campaignId.get(item.id),
    source_id: item.id,
    campaign_code: item.campaignCode,
    advertiser_name: item.advertiserName,
    advertiser_email: item.advertiserEmail,
    company_name: item.companyName,
    campaign_name: item.campaignName,
    destination_url: item.destinationUrl,
    creative_desktop_url: item.creativeDesktopUrl,
    creative_mobile_url: item.creativeMobileUrl,
    position: item.position,
    plan_id: planId.get(item.planId) || '',
    plan_name: item.planName,
    start_date: item.startDate,
    end_date: item.endDate,
    original_price: item.originalPrice,
    coupon_code_used: item.couponCodeUsed || '',
    discount_amount: item.discountAmount,
    net_amount_paid: item.netAmountPaid,
    status: item.status,
    referred_by_seller_code: item.referredBySellerCode || '',
    seller_commission_amount: item.sellerCommissionAmount || 0,
    seller_commission_paid: Boolean(item.sellerCommissionPaid),
    impressions_count: item.impressions,
    clicks_count: item.clicks,
    created_at: item.createdAt
  }))
);

writeCsv(
  '12_affiliate_sellers.csv',
  [
    'id', 'source_id', 'name', 'email', 'phone', 'code', 'coupon_code', 'commission_rate', 'status',
    'total_referred_clients', 'total_sales_volume', 'accumulated_commission', 'available_commission',
    'paid_commission', 'pending_commission', 'created_at'
  ],
  initialSellers.map((item) => ({
    id: uuidFrom(item.id),
    source_id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    code: item.code,
    coupon_code: item.couponCode,
    commission_rate: item.commissionRate,
    status: item.status,
    total_referred_clients: item.totalReferredClients,
    total_sales_volume: item.totalSalesVolume,
    accumulated_commission: item.accumulatedCommission,
    available_commission: item.availableCommission,
    paid_commission: item.paidCommission,
    pending_commission: item.pendingCommission,
    created_at: item.createdAt
  }))
);

writeCsv(
  '13_commissions.csv',
  [
    'id', 'source_id', 'seller_code', 'campaign_id', 'campaign_code', 'advertiser_name',
    'original_gross_amount', 'discount_amount', 'net_paid_amount', 'commission_rate',
    'commission_amount', 'status', 'created_at', 'paid_at'
  ],
  initialCommissions.map((item) => ({
    id: uuidFrom(item.id),
    source_id: item.id,
    seller_code: item.sellerCode,
    campaign_id: campaignId.get(item.campaignId) || '',
    campaign_code: item.campaignCode,
    advertiser_name: item.advertiserName,
    original_gross_amount: item.originalGrossAmount,
    discount_amount: item.discountAmount,
    net_paid_amount: item.netPaidAmount,
    commission_rate: item.commissionRate,
    commission_amount: item.commissionAmount,
    status: item.status,
    created_at: item.createdAt,
    paid_at: item.paidAt || ''
  }))
);

writeCsv(
  '14_formula_da_beleza.csv',
  ['id', 'headline', 'topics', 'about_title', 'about_description', 'about_highlights', 'host_image_url', 'logo_url'],
  [{
    id: 'current',
    headline: initialFormulaDaBelezaProgram.headline,
    topics: pgArray(initialFormulaDaBelezaProgram.topics),
    about_title: initialFormulaDaBelezaProgram.aboutTitle,
    about_description: initialFormulaDaBelezaProgram.aboutDescription,
    about_highlights: pgArray(initialFormulaDaBelezaProgram.aboutHighlights),
    host_image_url: initialFormulaDaBelezaProgram.hostImageUrl,
    logo_url: initialFormulaDaBelezaProgram.logoUrl
  }]
);

writeCsv(
  '15_formula_da_beleza_videos.csv',
  ['id', 'column_number', 'title', 'video_url', 'thumbnail_url', 'duration', 'active', 'featured_on_banner'],
  initialFormulaDaBelezaProgram.videoColumns.map((item) => ({
    id: uuidFrom(item.id),
    column_number: item.columnNumber,
    title: item.title,
    video_url: item.videoUrl,
    thumbnail_url: item.thumbnailUrl,
    duration: item.duration,
    active: item.active,
    featured_on_banner: item.featuredOnBanner
  }))
);

writeCsv(
  '16_formula_da_beleza_participations.csv',
  ['id', 'name', 'email', 'phone', 'company', 'participation_type', 'message', 'status', 'created_at'],
  []
);

writeCsv(
  '17_events.csv',
  ['id', 'source_id', 'title', 'event_date', 'location', 'category', 'image_url', 'description', 'ticket_link'],
  initialEvents.map((item) => ({
    id: uuidFrom(item.id),
    source_id: item.id,
    title: item.title,
    event_date: item.date,
    location: item.location,
    category: item.category,
    image_url: item.imageUrl,
    description: item.description,
    ticket_link: item.ticketLink || ''
  }))
);

writeCsv(
  '18_profiles.csv',
  ['id', 'email', 'name', 'role', 'avatar_url', 'phone', 'company_name', 'affiliate_code', 'referred_by'],
  []
);

writeCsv(
  '19_ad_clicks.csv',
  ['id', 'campaign_id', 'user_id', 'referrer', 'device', 'region', 'language', 'ip_hash', 'created_at'],
  []
);

writeCsv(
  '20_ad_impressions.csv',
  ['id', 'campaign_id', 'position', 'device', 'region', 'created_at'],
  []
);

writeCsv(
  '21_audit_logs.csv',
  ['id', 'user_email', 'action', 'module', 'details', 'created_at'],
  []
);

console.log('planilhas', fs.readdirSync(outDir).length);
