// Domain Models for Portal Fórmula Business News

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'EDITOR' 
  | 'FINANCE' 
  | 'AD_MANAGER' 
  | 'SELLER' 
  | 'ADVERTISER' 
  | 'USER';

export type Language = 'pt-BR' | 'en' | 'es';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  companyName?: string;
  affiliateCode?: string; // If seller
  referredBy?: string; // Seller code who referred them
  createdAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  author: string;
  publishedAt: string;
  featured?: boolean;
  breakingNews?: boolean;
  views: number;
  readTime: string;
  status: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED';
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // YouTube, Vimeo or MP4
  thumbnailUrl: string;
  duration: string;
  category: string;
  publishedAt: string;
  isHeroFeatured?: boolean;
  isShort?: boolean;
  views: number;
  /** Numeração da coluna no painel (ex.: 01, 02) para facilitar alterações */
  columnNumber?: number;
}

/** Coluna de vídeo do banner Programa Fórmula da Beleza */
export interface FormulaDaBelezaVideoColumn {
  id: string;
  columnNumber: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  active: boolean;
  featuredOnBanner: boolean;
}

export interface FormulaDaBelezaProgram {
  headline: string;
  topics: string[];
  aboutTitle: string;
  aboutDescription: string;
  aboutHighlights: string[];
  hostImageUrl: string;
  logoUrl: string;
  videoColumns: FormulaDaBelezaVideoColumn[];
}

export type FormulaDaBelezaParticipationType =
  | 'CONVIDADO'
  | 'MARCA'
  | 'PATROCINADOR'
  | 'OUTRO';

export interface FormulaDaBelezaParticipationRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  participationType: FormulaDaBelezaParticipationType;
  message: string;
  createdAt: string;
  status: 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'ARCHIVED';
}

export interface BreakingNewsTickerItem {
  id: string;
  text: string;
  link?: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  active: boolean;
  startDate?: string;
  endDate?: string;
  language?: Language;
}

// Magazine Types with Realistic Page Flip & Readership Analytics
export interface MagazinePage {
  pageNumber: number;
  imageUrl: string;
  title?: string;
  description?: string;
  featuredAdvertiser?: string;
}

export interface ReadershipAnalytics {
  totalReaders: number;
  totalPageviews: number;
  avgReadTimeMinutes: number;
  completionRate: number; // percentage
  downloadsCount: number;
  sharesCount: number;
  pageDropoffs: { pageNumber: number; views: number; avgSecondsSpent: number }[];
  devices: { desktop: number; mobile: number; tablet: number };
  regions: { region: string; percentage: number }[];
  lastUpdated: string;
}

export interface MagazineIssue {
  id: string;
  issueNumber: number;
  title: string;
  subtitle: string;
  description: string;
  coverImageUrl: string;
  pdfUrl?: string;
  publishDate: string;
  pagesCount: number;
  pages: MagazinePage[];
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  featured: boolean;
  themeColor?: string;
  downloadAllowed: boolean;
  clientAccessLink?: string;
  businessClientAccessLink?: string; // Special share link for advertisers/clients
  clientAdvertisersFeatured: string[];
  analytics: ReadershipAnalytics;
}

// Advertising System Models
export type AdPosition =
  | 'TOP_HEADER'
  | 'BREAKING_NEWS'
  | 'HERO_TOP'
  | 'HERO_SIDE'
  | 'CAROUSEL_01'
  | 'BETWEEN_NEWS'
  | 'CONTENT_TOP'
  | 'CONTENT_MIDDLE'
  | 'CONTENT_BOTTOM'
  | 'SIDEBAR'
  | 'FOOTER'
  | 'MOBILE_TOP'
  | 'MOBILE_MIDDLE';

export type CampaignStatus =
  | 'DRAFT'
  | 'WAITING_APPROVAL'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface AdPlan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  discountPercentage: number;
  active: boolean;
  description: string;
  highlighted?: boolean;
}

export interface AdCampaign {
  id: string;
  campaignCode: string;
  advertiserId: string;
  advertiserName: string;
  advertiserEmail: string;
  companyName: string;
  campaignName: string;
  destinationUrl: string;
  creativeDesktopUrl: string;
  creativeMobileUrl: string;
  position: AdPosition;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  originalPrice: number;
  couponCodeUsed?: string;
  discountAmount: number;
  netAmountPaid: number;
  status: CampaignStatus;
  referredBySellerCode?: string;
  sellerCommissionAmount?: number;
  sellerCommissionPaid?: boolean;
  createdAt: string;
  impressions: number;
  clicks: number;
}

/** Dados editáveis de uma campanha no painel administrativo. */
export interface AdminCampaignInput {
  campaignName: string;
  companyName: string;
  advertiserName: string;
  advertiserEmail: string;
  destinationUrl: string;
  creativeDesktopUrl: string;
  creativeMobileUrl: string;
  position: AdPosition;
  planId: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  originalPrice: number;
  discountAmount: number;
  netAmountPaid: number;
  referredBySellerCode?: string;
}

export interface AdClickRecord {
  id: string;
  campaignId: string;
  timestamp: string;
  referrer: string;
  device: 'desktop' | 'mobile' | 'tablet';
  region: string;
  language: string;
  ipHash?: string;
}

export interface AdImpressionRecord {
  id: string;
  campaignId: string;
  position: AdPosition;
  timestamp: string;
  device: 'desktop' | 'mobile' | 'tablet';
  region: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number; // e.g. 10
  discountFixed?: number;
  minPurchaseValue?: number;
  firstPurchaseOnly: boolean;
  sellerOwnerCode?: string; // If affiliate referral coupon
  active: boolean;
  expiresAt: string;
  usesCount: number;
  maxUses?: number;
}

export interface AffiliateSeller {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  code: string; // e.g. JOAO10
  couponCode: string; // e.g. JOAO10
  commissionRate: number; // default 0.10 (10%)
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  totalReferredClients: number;
  totalSalesVolume: number;
  accumulatedCommission: number;
  availableCommission: number;
  paidCommission: number;
  pendingCommission: number;
  createdAt: string;
}

export interface CommissionRecord {
  id: string;
  sellerCode: string;
  campaignId: string;
  campaignCode: string;
  advertiserName: string;
  originalGrossAmount: number;
  discountAmount: number;
  netPaidAmount: number;
  commissionRate: number; // 0.10
  commissionAmount: number; // 10% of netPaidAmount
  status: 'PENDING' | 'AVAILABLE' | 'PAID';
  createdAt: string;
  paidAt?: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  category: 'CONGRESSO' | 'PREMIAÇÃO' | 'CULTURA' | 'BUSINESS' | 'NETWORKING';
  imageUrl: string;
  description: string;
  ticketLink?: string;
}

export interface SiteSettings {
  portalName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl?: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  primaryColor: string;
  goldColor: string;
  isLive: boolean;
  liveTitle: string;
  liveStreamUrl: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  googleAnalyticsId?: string;
  metaPixelId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  module: string;
  details: string;
}
