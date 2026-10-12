-- ==============================================================================
-- PORTAL FÓRMULA BUSINESS NEWS — SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Run this script in your Supabase SQL Editor to provision all tables, 
-- Row Level Security (RLS) policies, indexes, functions, triggers, and seed data.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN', 'ADMIN', 'EDITOR', 'FINANCE', 'AD_MANAGER', 'SELLER', 'ADVERTISER', 'USER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM (
    'DRAFT', 'WAITING_APPROVAL', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ad_position AS ENUM (
    'TOP_HEADER', 'BREAKING_NEWS', 'HERO_TOP', 'HERO_SIDE', 'CAROUSEL_01', 
    'BETWEEN_NEWS', 'CONTENT_TOP', 'CONTENT_MIDDLE', 'CONTENT_BOTTOM', 
    'SIDEBAR', 'FOOTER', 'MOBILE_TOP', 'MOBILE_MIDDLE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES & USERS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role DEFAULT 'USER',
  avatar_url TEXT,
  phone TEXT,
  company_name TEXT,
  affiliate_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  portal_name TEXT NOT NULL DEFAULT 'Portal Fórmula Business News',
  tagline TEXT DEFAULT 'Líder em Notícias de Negócios, Inovação e Mercado',
  logo_url TEXT,
  favicon_url TEXT,
  contact_email TEXT DEFAULT 'comercial@formulabusiness.com.br',
  contact_phone TEXT DEFAULT '+55 (11) 3280-9000',
  contact_whatsapp TEXT DEFAULT '+55 (11) 98877-6655',
  primary_color TEXT DEFAULT '#020B14',
  gold_color TEXT DEFAULT '#D9A928',
  is_live BOOLEAN DEFAULT false,
  live_title TEXT DEFAULT 'Transmissão Ao Vivo — Fórum Líderes do Amanhã',
  live_stream_url TEXT DEFAULT 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  facebook_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  linkedin_url TEXT,
  ga_id TEXT,
  pixel_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BREAKING NEWS TICKER
CREATE TABLE IF NOT EXISTS public.breaking_news_ticker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  link TEXT,
  priority TEXT DEFAULT 'HIGH',
  active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CATEGORIES & EDITORIAL
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#D9A928',
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT DEFAULT 'PUBLISHED',
  featured BOOLEAN DEFAULT false,
  breaking_news BOOLEAN DEFAULT false,
  views_count BIGINT DEFAULT 0,
  read_time TEXT DEFAULT '4 min',
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. VIDEOS
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  duration TEXT DEFAULT '08:45',
  category TEXT DEFAULT 'Business',
  is_hero_featured BOOLEAN DEFAULT false,
  is_short BOOLEAN DEFAULT false,
  views_count BIGINT DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DIGITAL MAGAZINE & 3D REALISTIC READER
CREATE TABLE IF NOT EXISTS public.magazine_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_number INT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cover_image_url TEXT NOT NULL,
  pdf_url TEXT,
  publish_date DATE NOT NULL,
  pages_count INT DEFAULT 16,
  status TEXT DEFAULT 'PUBLISHED',
  featured BOOLEAN DEFAULT false,
  download_allowed BOOLEAN DEFAULT true,
  client_access_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  client_advertisers_featured TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.magazine_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.magazine_issues(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  featured_advertiser TEXT,
  UNIQUE(issue_id, page_number)
);

CREATE TABLE IF NOT EXISTS public.magazine_readership_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.magazine_issues(id) ON DELETE CASCADE,
  total_readers BIGINT DEFAULT 0,
  total_pageviews BIGINT DEFAULT 0,
  avg_read_time_seconds INT DEFAULT 0,
  completion_rate NUMERIC(5,2) DEFAULT 0.00,
  downloads_count BIGINT DEFAULT 0,
  shares_count BIGINT DEFAULT 0,
  page_dropoffs JSONB DEFAULT '[]'::jsonb,
  device_breakdown JSONB DEFAULT '{"desktop": 62, "mobile": 31, "tablet": 7}'::jsonb,
  region_breakdown JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ADVERTISING SYSTEM (PLANS, CAMPAIGNS, TRACKING)
CREATE TABLE IF NOT EXISTS public.ad_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  duration_days INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  discount_percentage INT DEFAULT 0,
  description TEXT,
  active BOOLEAN DEFAULT true,
  highlighted BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INT NOT NULL DEFAULT 10,
  discount_fixed NUMERIC(10,2) DEFAULT 0,
  min_purchase_value NUMERIC(10,2) DEFAULT 0,
  first_purchase_only BOOLEAN DEFAULT false,
  seller_owner_code TEXT,
  active BOOLEAN DEFAULT true,
  uses_count INT DEFAULT 0,
  max_uses INT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_code TEXT NOT NULL UNIQUE,
  advertiser_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  advertiser_name TEXT NOT NULL,
  advertiser_email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  creative_desktop_url TEXT NOT NULL,
  creative_mobile_url TEXT NOT NULL,
  position ad_position NOT NULL,
  plan_id UUID REFERENCES public.ad_plans(id),
  plan_name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  original_price NUMERIC(10,2) NOT NULL,
  coupon_code_used TEXT,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  net_amount_paid NUMERIC(10,2) NOT NULL,
  status campaign_status DEFAULT 'ACTIVE',
  referred_by_seller_code TEXT,
  seller_commission_amount NUMERIC(10,2) DEFAULT 0,
  seller_commission_paid BOOLEAN DEFAULT false,
  impressions_count BIGINT DEFAULT 0,
  clicks_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ad_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referrer TEXT,
  device TEXT,
  region TEXT,
  language TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  position ad_position NOT NULL,
  device TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AFFILIATES & RECURRING COMMISSIONS (10% ON NET SPENT)
CREATE TABLE IF NOT EXISTS public.affiliate_sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  code TEXT NOT NULL UNIQUE, -- e.g. JOAO10
  coupon_code TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC(4,2) DEFAULT 0.10, -- 10%
  status TEXT DEFAULT 'ACTIVE',
  total_referred_clients INT DEFAULT 0,
  total_sales_volume NUMERIC(12,2) DEFAULT 0,
  accumulated_commission NUMERIC(12,2) DEFAULT 0,
  available_commission NUMERIC(12,2) DEFAULT 0,
  paid_commission NUMERIC(12,2) DEFAULT 0,
  pending_commission NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_code TEXT NOT NULL,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  campaign_code TEXT NOT NULL,
  advertiser_name TEXT NOT NULL,
  original_gross_amount NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_paid_amount NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(4,2) NOT NULL DEFAULT 0.10,
  commission_amount NUMERIC(10,2) NOT NULL, -- 10% of net_paid_amount
  status TEXT DEFAULT 'AVAILABLE', -- PENDING, AVAILABLE, PAID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Public can read published news, magazine issues, site settings, and active banners
CREATE POLICY "Public can view published news" ON public.news FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public can view published magazine issues" ON public.magazine_issues FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Public can view active campaigns" ON public.ad_campaigns FOR SELECT USING (status = 'ACTIVE');

-- Advertisers can only view and insert their own campaigns
CREATE POLICY "Advertisers can view their own campaigns" ON public.ad_campaigns 
FOR SELECT USING (auth.uid() = advertiser_id OR auth.jwt() ->> 'role' IN ('ADMIN', 'SUPER_ADMIN'));

-- Sellers can only view their own commissions and team data
CREATE POLICY "Sellers can view their commissions" ON public.commissions
FOR SELECT USING (
  seller_code = (SELECT affiliate_code FROM public.profiles WHERE id = auth.uid())
  OR auth.jwt() ->> 'role' IN ('ADMIN', 'SUPER_ADMIN')
);

-- Admins can do everything
CREATE POLICY "Admins have full access to news" ON public.news FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'EDITOR'))
);

CREATE POLICY "Admins have full access to campaigns" ON public.ad_campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'AD_MANAGER', 'FINANCE'))
);

CREATE POLICY "Admins have full access to magazine" ON public.magazine_issues FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'EDITOR'))
);

-- 13. PROGRAMA FÓRMULA DA BELEZA
CREATE TABLE IF NOT EXISTS public.formula_da_beleza (
  id TEXT PRIMARY KEY DEFAULT 'current',
  headline TEXT NOT NULL,
  topics TEXT[] DEFAULT '{}',
  about_title TEXT NOT NULL,
  about_description TEXT NOT NULL,
  about_highlights TEXT[] DEFAULT '{}',
  host_image_url TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.formula_da_beleza_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_number INT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  duration TEXT DEFAULT '00:00',
  active BOOLEAN DEFAULT true,
  featured_on_banner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.formula_da_beleza_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  participation_type TEXT NOT NULL DEFAULT 'CONVIDADO',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leitura pública do conteúdo editorial (o painel admin ainda usa sessão local até o Auth)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breaking_news_ticker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazine_readership_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formula_da_beleza ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formula_da_beleza_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formula_da_beleza_participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view ticker" ON public.breaking_news_ticker FOR SELECT USING (active = true);
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Public can view magazine pages" ON public.magazine_pages FOR SELECT USING (true);
CREATE POLICY "Public can view magazine analytics" ON public.magazine_readership_analytics FOR SELECT USING (true);
CREATE POLICY "Public can view formula program" ON public.formula_da_beleza FOR SELECT USING (true);
CREATE POLICY "Public can view formula videos" ON public.formula_da_beleza_videos FOR SELECT USING (active = true);
CREATE POLICY "Anyone can submit formula participation" ON public.formula_da_beleza_participations FOR INSERT WITH CHECK (true);

-- Pacotes de anúncio: o painel usa sessão local e grava com a chave anon.
ALTER TABLE public.ad_plans ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_plans TO anon, authenticated;
CREATE POLICY "Admin panel can manage ad plans" ON public.ad_plans
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
