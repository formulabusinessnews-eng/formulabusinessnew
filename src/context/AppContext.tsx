import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { 
  UserProfile, 
  UserRole, 
  Language, 
  NewsItem, 
  Category, 
  VideoItem, 
  BreakingNewsTickerItem, 
  MagazineIssue, 
  MagazinePage, 
  AdPlan, 
  AdCampaign, 
  AdPosition, 
  AdminCampaignInput, 
  Coupon, 
  AffiliateSeller, 
  CommissionRecord, 
  SiteSettings, 
  EventItem, 
  AuditLog,
  FormulaDaBelezaProgram,
  FormulaDaBelezaVideoColumn,
  FormulaDaBelezaParticipationRequest
} from '../types';
import { 
  initialSiteSettings, 
  initialCategories, 
  initialTickerItems, 
  initialNews, 
  initialVideos, 
  initialMagazineIssues, 
  initialAdPlans, 
  initialCoupons, 
  initialSellers, 
  initialCommissions, 
  initialAdCampaigns, 
  initialEvents,
  initialFormulaDaBelezaProgram
} from '../lib/mockData';
import { translations } from '../i18n/translations';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { guestProfile, isPortalAdminIdentity, PORTAL_ADMIN_EMAIL } from '../lib/adminAccess';
import { fetchProfileById, findProfileIdByEmail, registerPortalUser } from '../lib/accountStore';
import { bumpCampaignStat, fetchCampaigns, insertCampaignRow, updateCampaignRow } from '../lib/campaignStore';
import {
  deleteAdPlanRow,
  insertAdPlan,
  sortAdPlans,
  syncAdPlans,
  updateAdPlanRow
} from '../lib/adPlanStore';
import {
  deleteCouponRow,
  incrementCouponUseRow,
  insertCoupon,
  sortCoupons,
  syncCoupons,
  updateCouponRow
} from '../lib/couponStore';
import {
  deleteNewsRow,
  insertNews,
  republishNewsOnTop,
  sortNewsByDate,
  syncNewsWithSupabase,
  updateNewsRow
} from '../lib/newsStore';
import {
  insertAffiliate,
  insertCommission,
  sortAffiliates,
  sortCommissions,
  syncAffiliatesAndCommissions,
  updateAffiliateRow,
  updateCommissionRow
} from '../lib/affiliateStore';

type AdPlanInput = {
  name: string;
  durationDays: number;
  price: number;
  discountPercentage: number;
  description: string;
  active: boolean;
  highlighted: boolean;
};

type CouponInput = {
  code: string;
  discountPercent: number;
  discountFixed?: number;
  minPurchaseValue?: number;
  firstPurchaseOnly: boolean;
  sellerOwnerCode?: string;
  active: boolean;
  expiresAt: string;
  maxUses?: number;
};

type MutationResult = { success: boolean; error?: string };

type AffiliateInput = {
  name: string;
  email: string;
  phone: string;
  code: string;
  couponCode: string;
  commissionRate: number;
  status: AffiliateSeller['status'];
  password?: string;
};

type AdvertiserAccountInput = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  password: string;
};

type PortalPanel = 'admin' | 'seller' | 'advertiser';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)['pt-BR'];
  
  currentUser: UserProfile;
  isPortalAdmin: boolean;
  switchUserRole: (role: UserRole) => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; panel?: PortalPanel }>;
  signOut: () => Promise<void>;
  
  // Site Settings
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  
  // Editorial & News
  news: NewsItem[];
  categories: Category[];
  tickerItems: BreakingNewsTickerItem[];
  videos: VideoItem[];
  events: EventItem[];
  newsSyncError: string | null;
  addNews: (item: Omit<NewsItem, 'id' | 'views'>) => Promise<void>;
  updateNews: (id: string, item: Partial<NewsItem>) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  republishEditorialNews: () => Promise<void>;
  updateTickerItem: (id: string, updates: Partial<BreakingNewsTickerItem>) => void;
  addTickerItem: (text: string, link?: string, priority?: 'HIGH' | 'NORMAL' | 'LOW') => void;
  deleteTickerItem: (id: string) => void;

  // Digital Magazine & Realistic 3D Reader
  magazineIssues: MagazineIssue[];
  activeMagazineId: string | null;
  openMagazineReader: (issueId: string) => void;
  closeMagazineReader: () => void;
  addMagazineIssue: (issue: Omit<MagazineIssue, 'id' | 'analytics'>) => void;
  updateMagazineIssue: (id: string, updates: Partial<MagazineIssue>) => void;
  deleteMagazineIssue: (id: string) => void;
  addPageToIssue: (issueId: string, page: MagazinePage) => void;
  updatePageInIssue: (issueId: string, pageNumber: number, updates: Partial<MagazinePage>) => void;
  removePageFromIssue: (issueId: string, pageNumber: number) => void;
  recordMagazineRead: (issueId: string, pageNumber: number, secondsSpent: number) => void;
  recordMagazineDownload: (issueId: string) => void;

  // Advertising & Campaigns
  adPlans: AdPlan[];
  adPlansSyncError: string | null;
  addAdPlan: (input: AdPlanInput) => Promise<{ success: boolean; error?: string }>;
  updateAdPlan: (id: string, input: AdPlanInput) => Promise<{ success: boolean; error?: string }>;
  deleteAdPlan: (id: string) => Promise<{ success: boolean; error?: string }>;
  adCampaigns: AdCampaign[];
  campaignsSyncError: string | null;
  coupons: Coupon[];
  couponsSyncError: string | null;
  addCoupon: (input: CouponInput) => Promise<MutationResult>;
  updateCoupon: (id: string, input: CouponInput) => Promise<MutationResult>;
  toggleCouponActive: (id: string) => Promise<MutationResult>;
  deleteCoupon: (id: string) => Promise<MutationResult>;
  affiliates: AffiliateSeller[];
  commissions: CommissionRecord[];
  affiliatesSyncError: string | null;
  affiliatesReady: boolean;
  addAffiliate: (input: AffiliateInput) => Promise<MutationResult>;
  updateAffiliate: (id: string, input: AffiliateInput) => Promise<MutationResult>;
  setAffiliateStatus: (id: string, status: AffiliateSeller['status']) => Promise<MutationResult>;
  addAdvertiserAccount: (input: AdvertiserAccountInput) => Promise<MutationResult>;
  
  createCampaign: (data: {
    advertiserName: string;
    advertiserEmail: string;
    companyName: string;
    campaignName: string;
    destinationUrl: string;
    creativeDesktopUrl: string;
    creativeMobileUrl: string;
    position: AdPosition;
    planId: string;
    couponCode?: string;
  }) => Promise<{ success: boolean; campaign?: AdCampaign; error?: string }>;

  updateCampaignStatus: (id: string, status: AdCampaign['status']) => Promise<{ success: boolean; error?: string }>;
  createAdminCampaign: (data: AdminCampaignInput) => Promise<{ success: boolean; campaign?: AdCampaign; error?: string }>;
  updateCampaign: (id: string, data: AdminCampaignInput) => Promise<{ success: boolean; error?: string }>;
  trackAdClick: (campaignId: string) => string; // returns destination URL
  trackAdImpression: (campaignId: string, position: AdPosition) => void;
  validateCoupon: (code: string, originalPrice: number) => { 
    valid: boolean; 
    discountAmount: number; 
    sellerOwnerCode?: string; 
    message?: string 
  };
  
  // Affiliates & Commissions
  requestSellerPayout: (sellerCode: string, amount: number) => boolean;
  approveCommissionPayout: (commissionId: string) => Promise<MutationResult>;

  // Audit Logs
  auditLogs: AuditLog[];
  logAuditAction: (action: string, module: string, details: string) => void;

  // Active Live Modal
  isLiveModalOpen: boolean;
  setIsLiveModalOpen: (open: boolean) => void;
  
  // Advertising Checkout Modal
  isAdCheckoutOpen: boolean;
  setIsAdCheckoutOpen: (open: boolean) => void;
  preselectedAdPosition: AdPosition | null;
  setPreselectedAdPosition: (pos: AdPosition | null) => void;

  // Programa Fórmula da Beleza
  formulaDaBeleza: FormulaDaBelezaProgram;
  updateFormulaDaBeleza: (updates: Partial<Omit<FormulaDaBelezaProgram, 'videoColumns'>>) => void;
  updateFormulaDaBelezaVideoColumn: (id: string, updates: Partial<FormulaDaBelezaVideoColumn>) => void;
  setFeaturedFormulaDaBelezaVideo: (id: string) => void;
  addFormulaDaBelezaVideoColumn: (column: Omit<FormulaDaBelezaVideoColumn, 'id' | 'columnNumber'>) => void;
  formulaDaBelezaParticipations: FormulaDaBelezaParticipationRequest[];
  submitFormulaDaBelezaParticipation: (
    data: Omit<FormulaDaBelezaParticipationRequest, 'id' | 'createdAt' | 'status'>
  ) => void;
  updateFormulaDaBelezaParticipationStatus: (
    id: string,
    status: FormulaDaBelezaParticipationRequest['status']
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'portal_formula_business_state_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('fbn_lang') as Language) || 'pt-BR';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fbn_lang', lang);
  };

  const t = translations[language] || translations['pt-BR'];

  const [isPortalAdmin, setIsPortalAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(guestProfile);

  useEffect(() => {
    if (!supabase) return;

    const applyAuthUser = async (user: {
      id: string;
      email?: string;
      created_at?: string;
      user_metadata?: Record<string, unknown>;
    } | null) => {
      if (!user) {
        setIsPortalAdmin(false);
        setCurrentUser(guestProfile());
        return;
      }

      if (isPortalAdminIdentity(user.id, user.email)) {
        const meta = user.user_metadata || {};
        const name = typeof meta.name === 'string'
          ? meta.name
          : typeof meta.full_name === 'string'
            ? meta.full_name
            : 'Administrador';
        setIsPortalAdmin(true);
        setCurrentUser({
          id: user.id,
          email: user.email || PORTAL_ADMIN_EMAIL,
          name,
          role: 'SUPER_ADMIN',
          createdAt: user.created_at || new Date().toISOString()
        });
        return;
      }

      setIsPortalAdmin(false);
      try {
        const profile = await fetchProfileById(user.id);
        if (profile && (profile.role === 'SELLER' || profile.role === 'ADVERTISER')) {
          setCurrentUser(profile);
          return;
        }
      } catch {
        // A sessão permanece, mas o painel só abre com a linha em profiles.
      }
      setCurrentUser(guestProfile());
    };

    supabase.auth.getSession().then(({ data }) => {
      void applyAuthUser(data.session?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      void applyAuthUser(session?.user ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const switchUserRole = (role: UserRole) => {
    if (isPortalAdmin || role === 'SUPER_ADMIN' || role === 'ADMIN') return;
    if (role === 'SELLER') {
      setCurrentUser({
        id: 'user-seller-1',
        email: 'joao.consultor@formulabusiness.com.br',
        name: 'João Victor Silva (Consultor/Afiliado)',
        role: 'SELLER',
        phone: '+55 (11) 98765-4321',
        affiliateCode: 'JOAO10',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        createdAt: '2026-03-15'
      });
    } else if (role === 'ADVERTISER') {
      setCurrentUser({
        id: 'user-adv-1',
        email: 'contato@vanguardiamna.com.br',
        name: 'Vanguardia M&A Partners (Anunciante)',
        companyName: 'Vanguardia M&A Consultoria',
        role: 'ADVERTISER',
        referredBy: 'JOAO10',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        createdAt: '2026-10-01'
      });
    } else {
      setCurrentUser({
        id: 'user-guest-1',
        email: 'leitor@corporativo.com.br',
        name: 'Leitor / Visitante',
        role: 'USER',
        createdAt: '2026-10-05'
      });
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string; panel?: PortalPanel }> => {
    if (!supabase) {
      return { success: false, error: 'O acesso administrativo não está disponível neste ambiente.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error || !data.user) {
      return { success: false, error: 'E-mail ou senha inválidos.' };
    }

    if (isPortalAdminIdentity(data.user.id, data.user.email)) {
      return { success: true, panel: 'admin' };
    }

    let profile = null;
    try {
      profile = await fetchProfileById(data.user.id);
    } catch (profileError) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: profileError instanceof Error ? profileError.message : 'Não foi possível ler o perfil.'
      };
    }

    if (profile?.role === 'SELLER') {
      if (supabase) {
        const { data: sellerRow } = await supabase
          .from('affiliate_sellers')
          .select('status')
          .eq('user_id', profile.id)
          .maybeSingle();
        if (sellerRow?.status === 'INACTIVE') {
          await supabase.auth.signOut();
          return { success: false, error: 'Este afiliado está inativo.' };
        }
      }
      setIsPortalAdmin(false);
      setCurrentUser(profile);
      return { success: true, panel: 'seller' };
    }

    if (profile?.role === 'ADVERTISER') {
      setIsPortalAdmin(false);
      setCurrentUser(profile);
      return { success: true, panel: 'advertiser' };
    }

    await supabase.auth.signOut();
    return { success: false, error: 'Esta conta não tem acesso de administrador, afiliado ou anunciante.' };
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setIsPortalAdmin(false);
    setCurrentUser(guestProfile());
  };

  // State entities loaded from LocalStorage or seeded from mockData
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_settings`);
    if (!saved) return initialSiteSettings;

    const parsed = JSON.parse(saved) as SiteSettings;
    // Migra a logo seed (Unsplash) para a logo principal local
    if (!parsed.logoUrl || parsed.logoUrl.includes('unsplash.com')) {
      return { ...parsed, logoUrl: initialSiteSettings.logoUrl };
    }
    return parsed;
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_news`);
    return saved ? JSON.parse(saved) : initialNews;
  });
  const [newsSyncError, setNewsSyncError] = useState<string | null>(null);
  const newsRef = useRef(news);
  newsRef.current = news;

  const [categories] = useState<Category[]>(initialCategories);

  const [tickerItems, setTickerItems] = useState<BreakingNewsTickerItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_ticker`);
    return saved ? JSON.parse(saved) : initialTickerItems;
  });

  const [videos] = useState<VideoItem[]>(initialVideos);
  const [events] = useState<EventItem[]>(initialEvents);

  const [formulaDaBeleza, setFormulaDaBeleza] = useState<FormulaDaBelezaProgram>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_formula_da_beleza`);
    return saved ? JSON.parse(saved) : initialFormulaDaBelezaProgram;
  });

  const [formulaDaBelezaParticipations, setFormulaDaBelezaParticipations] = useState<FormulaDaBelezaParticipationRequest[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_formula_da_beleza_participations`);
    return saved ? JSON.parse(saved) : [];
  });

  const [magazineIssues, setMagazineIssues] = useState<MagazineIssue[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_magazines`);
    return saved ? JSON.parse(saved) : initialMagazineIssues;
  });

  const [activeMagazineId, setActiveMagazineId] = useState<string | null>(null);

  const [adPlans, setAdPlans] = useState<AdPlan[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_adplans`);
    return sortAdPlans(saved ? JSON.parse(saved) : initialAdPlans);
  });
  const [adPlansSyncError, setAdPlansSyncError] = useState<string | null>(null);
  const adPlansRef = useRef(adPlans);
  adPlansRef.current = adPlans;

  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_campaigns`);
    return saved ? JSON.parse(saved) : initialAdCampaigns;
  });
  const [campaignsSyncError, setCampaignsSyncError] = useState<string | null>(null);
  const adCampaignsRef = useRef(adCampaigns);
  adCampaignsRef.current = adCampaigns;

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_coupons`);
    return sortCoupons(saved ? JSON.parse(saved) : initialCoupons);
  });
  const [couponsSyncError, setCouponsSyncError] = useState<string | null>(null);
  const couponsRef = useRef(coupons);
  couponsRef.current = coupons;

  const [affiliates, setAffiliates] = useState<AffiliateSeller[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_affiliates`);
    return saved ? JSON.parse(saved) : initialSellers;
  });
  const [commissions, setCommissions] = useState<CommissionRecord[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_commissions`);
    return saved ? JSON.parse(saved) : initialCommissions;
  });
  const [affiliatesSyncError, setAffiliatesSyncError] = useState<string | null>(null);
  const [affiliatesReady, setAffiliatesReady] = useState(!isSupabaseConfigured);
  const affiliatesRef = useRef(affiliates);
  affiliatesRef.current = affiliates;
  const commissionsRef = useRef(commissions);
  commissionsRef.current = commissions;

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      userEmail: 'sistema@formulabusiness.com.br',
      action: 'BOOT_SYSTEM',
      module: 'SISTEMA',
      details: 'Motor Fórmula Business News inicializado com dados de produção e seeds.'
    }
  ]);

  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isAdCheckoutOpen, setIsAdCheckoutOpen] = useState(false);
  const [preselectedAdPosition, setPreselectedAdPosition] = useState<AdPosition | null>(null);

  // Sync to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_settings`, JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_news`, JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_ticker`, JSON.stringify(tickerItems));
  }, [tickerItems]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_magazines`, JSON.stringify(magazineIssues));
  }, [magazineIssues]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_adplans`, JSON.stringify(adPlans));
  }, [adPlans]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_campaigns`, JSON.stringify(adCampaigns));
  }, [adCampaigns]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_coupons`, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_affiliates`, JSON.stringify(affiliates));
  }, [affiliates]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_commissions`, JSON.stringify(commissions));
  }, [commissions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_formula_da_beleza`, JSON.stringify(formulaDaBeleza));
  }, [formulaDaBeleza]);

  useEffect(() => {
    localStorage.setItem(
      `${LOCAL_STORAGE_KEY}_formula_da_beleza_participations`,
      JSON.stringify(formulaDaBelezaParticipations)
    );
  }, [formulaDaBelezaParticipations]);

  // Periodic Campaign Expiration & Status Check
  useEffect(() => {
    const checkCampaignStatus = () => {
      const now = new Date();
      setAdCampaigns(prev => prev.map(camp => {
        const end = new Date(camp.endDate);
        const start = new Date(camp.startDate);
        if (now > end && camp.status === 'ACTIVE') {
          return { ...camp, status: 'EXPIRED' };
        }
        if (now >= start && now <= end && camp.status === 'SCHEDULED') {
          return { ...camp, status: 'ACTIVE' };
        }
        return camp;
      }));
    };

    checkCampaignStatus();
    const interval = setInterval(checkCampaignStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Audit Logger
  const logAuditAction = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: currentUser.email,
      action,
      module,
      details
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  // Site Settings
  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings(prev => ({ ...prev, ...settings }));
    logAuditAction('UPDATE_SETTINGS', 'CONFIGURAÇÕES', 'Configurações gerais do portal atualizadas');
  };

  const updateFormulaDaBeleza = (updates: Partial<Omit<FormulaDaBelezaProgram, 'videoColumns'>>) => {
    setFormulaDaBeleza(prev => ({ ...prev, ...updates }));
    logAuditAction('UPDATE_PROGRAM', 'FÓRMULA DA BELEZA', 'Dados institucionais do programa atualizados');
  };

  const updateFormulaDaBelezaVideoColumn = (id: string, updates: Partial<FormulaDaBelezaVideoColumn>) => {
    setFormulaDaBeleza(prev => ({
      ...prev,
      videoColumns: prev.videoColumns.map(col => (col.id === id ? { ...col, ...updates } : col))
    }));
    const col = formulaDaBeleza.videoColumns.find(c => c.id === id);
    logAuditAction(
      'UPDATE_VIDEO_COLUMN',
      'FÓRMULA DA BELEZA',
      `Coluna de vídeo ${String(col?.columnNumber ?? '').padStart(2, '0')} atualizada`
    );
  };

  const setFeaturedFormulaDaBelezaVideo = (id: string) => {
    setFormulaDaBeleza(prev => ({
      ...prev,
      videoColumns: prev.videoColumns.map(col => ({
        ...col,
        featuredOnBanner: col.id === id
      }))
    }));
    const col = formulaDaBeleza.videoColumns.find(c => c.id === id);
    logAuditAction(
      'SET_FEATURED_VIDEO',
      'FÓRMULA DA BELEZA',
      `Coluna ${String(col?.columnNumber ?? '').padStart(2, '0')} definida como vídeo do banner`
    );
  };

  const addFormulaDaBelezaVideoColumn = (
    column: Omit<FormulaDaBelezaVideoColumn, 'id' | 'columnNumber'>
  ) => {
    setFormulaDaBeleza(prev => {
      const nextNumber =
        prev.videoColumns.reduce((max, col) => Math.max(max, col.columnNumber), 0) + 1;
      const newColumn: FormulaDaBelezaVideoColumn = {
        ...column,
        id: `fdb-col-${Date.now()}`,
        columnNumber: nextNumber,
        featuredOnBanner: prev.videoColumns.length === 0 ? true : column.featuredOnBanner
      };
      return {
        ...prev,
        videoColumns: [...prev.videoColumns, newColumn]
      };
    });
    logAuditAction('ADD_VIDEO_COLUMN', 'FÓRMULA DA BELEZA', 'Nova coluna de vídeo adicionada');
  };

  const submitFormulaDaBelezaParticipation = (
    data: Omit<FormulaDaBelezaParticipationRequest, 'id' | 'createdAt' | 'status'>
  ) => {
    const request: FormulaDaBelezaParticipationRequest = {
      ...data,
      id: `fdb-part-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'NEW'
    };
    setFormulaDaBelezaParticipations(prev => [request, ...prev]);
    logAuditAction(
      'PARTICIPATION_REQUEST',
      'FÓRMULA DA BELEZA',
      `Nova inscrição: ${data.name} (${data.participationType})`
    );
  };

  const updateFormulaDaBelezaParticipationStatus = (
    id: string,
    status: FormulaDaBelezaParticipationRequest['status']
  ) => {
    setFormulaDaBelezaParticipations(prev =>
      prev.map(item => (item.id === id ? { ...item, status } : item))
    );
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    syncAdPlans(adPlansRef.current)
      .then(items => {
        if (cancelled) return;
        setAdPlans(items);
        setAdPlansSyncError(null);
        logAuditAction('SYNC_AD_PLANS', 'PLANOS', `Pacotes sincronizados com o Supabase (${items.length}).`);
      })
      .catch(error => {
        if (cancelled) return;
        setAdPlansSyncError(error instanceof Error ? error.message : 'Falha ao sincronizar os pacotes de anúncio.');
      });

    syncCoupons(couponsRef.current)
      .then(items => {
        if (cancelled) return;
        setCoupons(items);
        setCouponsSyncError(null);
        logAuditAction('SYNC_COUPONS', 'CUPONS', `Cupons sincronizados com o Supabase (${items.length}).`);
      })
      .catch(error => {
        if (cancelled) return;
        setCouponsSyncError(error instanceof Error ? error.message : 'Falha ao sincronizar os cupons de desconto.');
      });

    fetchCampaigns()
      .then(items => {
        if (cancelled) return;
        setAdCampaigns(items);
        setCampaignsSyncError(null);
        logAuditAction('SYNC_CAMPAIGNS', 'PUBLICIDADE', `Campanhas sincronizadas com o Supabase (${items.length}).`);
      })
      .catch(error => {
        if (cancelled) return;
        setCampaignsSyncError(error instanceof Error ? error.message : 'Falha ao sincronizar as campanhas.');
      });

    syncAffiliatesAndCommissions()
      .then(result => {
        if (cancelled) return;
        setAffiliates(result.affiliates);
        setCommissions(result.commissions);
        setAffiliatesSyncError(null);
        setAffiliatesReady(true);
        logAuditAction(
          'SYNC_AFFILIATES',
          'AFILIADOS',
          `Afiliados sincronizados com o Supabase (${result.affiliates.length} consultores, ${result.commissions.length} comissões).`
        );
      })
      .catch(error => {
        if (cancelled) return;
        setAffiliatesSyncError(error instanceof Error ? error.message : 'Falha ao sincronizar afiliados e comissões.');
        setAffiliatesReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // News Actions — Supabase é a fonte da publicação daqui em diante
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    const snapshot = newsRef.current;

    syncNewsWithSupabase(snapshot)
      .then(items => {
        if (cancelled) return;
        setNews(items);
        setNewsSyncError(null);
        logAuditAction(
          'SYNC_NEWS',
          'NOTÍCIAS',
          `Acervo sincronizado com o Supabase (${items.length} matérias).`
        );
      })
      .catch(error => {
        if (cancelled) return;
        setNewsSyncError(error instanceof Error ? error.message : 'Falha ao sincronizar notícias.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const addNews = async (item: Omit<NewsItem, 'id' | 'views'>) => {
    const newItem: NewsItem = {
      ...item,
      id: crypto.randomUUID(),
      views: 0
    };
    if (isSupabaseConfigured) await insertNews(newItem);
    setNews(prev => sortNewsByDate([newItem, ...prev]));
    logAuditAction('CREATE_NEWS', 'NOTÍCIAS', `Notícia criada: "${newItem.title}"`);
  };

  const updateNews = async (id: string, updates: Partial<NewsItem>) => {
    const current = newsRef.current.find(item => item.id === id);
    if (!current) return;
    const next = { ...current, ...updates };
    if (isSupabaseConfigured) await updateNewsRow(next);
    setNews(prev => sortNewsByDate(prev.map(item => item.id === id ? { ...item, ...updates } : item)));
    logAuditAction('UPDATE_NEWS', 'NOTÍCIAS', `Notícia atualizada: "${next.title}"`);
  };

  const deleteNews = async (id: string) => {
    if (isSupabaseConfigured) await deleteNewsRow(id);
    setNews(prev => prev.filter(item => item.id !== id));
    logAuditAction('DELETE_NEWS', 'NOTÍCIAS', `Notícia ${id} excluída`);
  };

  const republishEditorialNews = async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase não está configurado neste ambiente.');
    }
    await republishNewsOnTop(newsRef.current);
    const items = await syncNewsWithSupabase(newsRef.current);
    setNews(items);
    setNewsSyncError(null);
    logAuditAction('REPUBLISH_NEWS', 'NOTÍCIAS', 'Acervo republicado no topo do site e gravado no Supabase.');
  };

  // Ticker Actions
  const updateTickerItem = (id: string, updates: Partial<BreakingNewsTickerItem>) => {
    setTickerItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const addTickerItem = (text: string, link?: string, priority: 'HIGH' | 'NORMAL' | 'LOW' = 'HIGH') => {
    const newItem: BreakingNewsTickerItem = {
      id: `ticker-${Date.now()}`,
      text,
      link,
      priority,
      active: true
    };
    setTickerItems(prev => [newItem, ...prev]);
  };

  const deleteTickerItem = (id: string) => {
    setTickerItems(prev => prev.filter(item => item.id !== id));
  };

  // Magazine Readers & Analytics
  const openMagazineReader = (issueId: string) => {
    setActiveMagazineId(issueId);
    // Record page 1 view
    recordMagazineRead(issueId, 1, 10);
  };

  const closeMagazineReader = () => {
    setActiveMagazineId(null);
  };

  const addMagazineIssue = (issue: Omit<MagazineIssue, 'id' | 'analytics'>) => {
    const newIssue: MagazineIssue = {
      ...issue,
      id: `mag-${Date.now()}`,
      clientAccessLink:
        issue.clientAccessLink ||
        `${window.location.origin}/#magazine-parceiro-${issue.issueNumber}`,
      analytics: {
        totalReaders: 1,
        totalPageviews: 1,
        avgReadTimeMinutes: 0.5,
        completionRate: 0,
        downloadsCount: 0,
        sharesCount: 0,
        pageDropoffs: issue.pages.map(p => ({ pageNumber: p.pageNumber, views: 1, avgSecondsSpent: 15 })),
        devices: { desktop: 70, mobile: 25, tablet: 5 },
        regions: [{ region: 'São Paulo', percentage: 100 }],
        lastUpdated: new Date().toISOString()
      }
    };
    setMagazineIssues(prev => [newIssue, ...prev]);
    logAuditAction('CREATE_MAGAZINE', 'REVISTA', `Edição nº ${issue.issueNumber} cadastrada: ${issue.title}`);
  };

  const updateMagazineIssue = (id: string, updates: Partial<MagazineIssue>) => {
    setMagazineIssues(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    logAuditAction('UPDATE_MAGAZINE', 'REVISTA', `Edição ${id} atualizada`);
  };

  const deleteMagazineIssue = (id: string) => {
    setMagazineIssues(prev => prev.filter(item => item.id !== id));
    logAuditAction('DELETE_MAGAZINE', 'REVISTA', `Edição ${id} excluída`);
  };

  const addPageToIssue = (issueId: string, page: MagazinePage) => {
    setMagazineIssues(prev => prev.map(mag => {
      if (mag.id !== issueId) return mag;
      const updatedPages = [...mag.pages, page].sort((a, b) => a.pageNumber - b.pageNumber);
      const pageDropoffs = [
        ...mag.analytics.pageDropoffs,
        { pageNumber: page.pageNumber, views: 0, avgSecondsSpent: 0 }
      ].sort((a, b) => a.pageNumber - b.pageNumber);
      return {
        ...mag,
        pages: updatedPages,
        pagesCount: updatedPages.length,
        analytics: { ...mag.analytics, pageDropoffs }
      };
    }));
    logAuditAction('ADD_MAGAZINE_PAGE', 'REVISTA', `Página ${page.pageNumber} adicionada à edição ${issueId}`);
  };

  const updatePageInIssue = (issueId: string, pageNumber: number, updates: Partial<MagazinePage>) => {
    setMagazineIssues(prev => prev.map(mag => {
      if (mag.id !== issueId) return mag;
      const pages = mag.pages.map(p =>
        p.pageNumber === pageNumber ? { ...p, ...updates, pageNumber: p.pageNumber } : p
      );
      return {
        ...mag,
        pages,
        pagesCount: pages.length,
        ...(pageNumber === 1 && updates.imageUrl ? { coverImageUrl: updates.imageUrl } : {})
      };
    }));
    logAuditAction('UPDATE_MAGAZINE_PAGE', 'REVISTA', `Página ${pageNumber} da edição ${issueId} atualizada`);
  };

  const removePageFromIssue = (issueId: string, pageNumber: number) => {
    setMagazineIssues(prev => prev.map(mag => {
      if (mag.id !== issueId) return mag;
      const filtered = mag.pages.filter(p => p.pageNumber !== pageNumber);
      const renumbered = filtered.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
      const pageDropoffs = filtered.map((oldPage, idx) => {
        const prevDrop = mag.analytics.pageDropoffs.find(d => d.pageNumber === oldPage.pageNumber);
        return {
          pageNumber: idx + 1,
          views: prevDrop?.views ?? 0,
          avgSecondsSpent: prevDrop?.avgSecondsSpent ?? 0
        };
      });
      return {
        ...mag,
        pages: renumbered,
        pagesCount: renumbered.length,
        coverImageUrl: renumbered[0]?.imageUrl || mag.coverImageUrl,
        analytics: { ...mag.analytics, pageDropoffs }
      };
    }));
    logAuditAction('DELETE_MAGAZINE_PAGE', 'REVISTA', `Página ${pageNumber} removida da edição ${issueId}`);
  };

  const recordMagazineRead = (issueId: string, pageNumber: number, secondsSpent: number) => {
    setMagazineIssues(prev => prev.map(mag => {
      if (mag.id !== issueId) return mag;
      const currentAnalytics = mag.analytics;
      const pageDropoffs = currentAnalytics.pageDropoffs.map(item => {
        if (item.pageNumber === pageNumber) {
          return {
            ...item,
            views: item.views + 1,
            avgSecondsSpent: Math.round((item.avgSecondsSpent + secondsSpent) / 2)
          };
        }
        return item;
      });

      return {
        ...mag,
        analytics: {
          ...currentAnalytics,
          totalPageviews: currentAnalytics.totalPageviews + 1,
          totalReaders: currentAnalytics.totalReaders + 1,
          pageDropoffs,
          lastUpdated: new Date().toISOString()
        }
      };
    }));
  };

  const recordMagazineDownload = (issueId: string) => {
    setMagazineIssues(prev => prev.map(mag => {
      if (mag.id !== issueId) return mag;
      return {
        ...mag,
        analytics: {
          ...mag.analytics,
          downloadsCount: mag.analytics.downloadsCount + 1
        }
      };
    }));
  };

  // Advertising Tracking & Anti-Fraud
  const trackAdClick = (campaignId: string): string => {
    const campaign = adCampaigns.find(c => c.id === campaignId);
    if (!campaign) return '#';

    // Anti-fraud / throttling: check last click in session
    const sessionKey = `fbn_clk_${campaignId}`;
    const lastClick = sessionStorage.getItem(sessionKey);
    const now = Date.now();
    
    // Only increment click counter if > 3 seconds since last click from this session
    if (!lastClick || now - parseInt(lastClick, 10) > 3000) {
      sessionStorage.setItem(sessionKey, now.toString());
      setAdCampaigns(prev => prev.map(camp => {
        if (camp.id === campaignId) {
          return { ...camp, clicks: camp.clicks + 1 };
        }
        return camp;
      }));
      void bumpCampaignStat(campaignId, 'click');
    }

    return campaign.destinationUrl;
  };

  const trackAdImpression = (campaignId: string, _position: AdPosition) => {
    setAdCampaigns(prev => prev.map(camp => {
      if (camp.id === campaignId) {
        return { ...camp, impressions: camp.impressions + 1 };
      }
      return camp;
    }));
    void bumpCampaignStat(campaignId, 'impression');
  };

  const couponDiscountAmount = (coupon: Coupon, originalPrice: number) => {
    const percentAmount = coupon.discountPercent > 0
      ? Math.round((originalPrice * (coupon.discountPercent / 100)) * 100) / 100
      : 0;
    const fixedAmount = coupon.discountFixed && coupon.discountFixed > 0
      ? Math.round(coupon.discountFixed * 100) / 100
      : 0;
    return Math.min(originalPrice, Math.max(percentAmount, fixedAmount));
  };

  // Coupon Validation
  const validateCoupon = (code: string, originalPrice: number) => {
    const trimmed = code.trim().toUpperCase();
    const coupon = coupons.find(c => c.code.toUpperCase() === trimmed);
    
    if (!coupon || !coupon.active) {
      return { valid: false, discountAmount: 0, message: 'Cupom não encontrado ou inativo.' };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      return { valid: false, discountAmount: 0, message: 'Cupom expirado.' };
    }

    if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
      return { valid: false, discountAmount: 0, message: 'Este cupom atingiu o limite de usos.' };
    }

    if (coupon.minPurchaseValue && originalPrice < coupon.minPurchaseValue) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Compra mínima de R$ ${coupon.minPurchaseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para este cupom.`
      };
    }

    if (coupon.firstPurchaseOnly) {
      const email = currentUser.email.trim().toLowerCase();
      const alreadyBought = adCampaigns.some(campaign => campaign.advertiserEmail.trim().toLowerCase() === email);
      if (alreadyBought) {
        return { valid: false, discountAmount: 0, message: 'Este cupom vale apenas na primeira compra.' };
      }
    }

    const discountAmount = couponDiscountAmount(coupon, originalPrice);
    if (discountAmount <= 0) {
      return { valid: false, discountAmount: 0, message: 'Este cupom não gera desconto para o valor informado.' };
    }

    const usedFixed = (coupon.discountFixed || 0) >= (coupon.discountPercent > 0
      ? originalPrice * (coupon.discountPercent / 100)
      : 0) && (coupon.discountFixed || 0) > 0;
    const label = usedFixed
      ? `R$ ${discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : `${coupon.discountPercent}%`;

    return {
      valid: true,
      discountAmount,
      sellerOwnerCode: coupon.sellerOwnerCode,
      message: `Cupom de ${label} OFF aplicado com sucesso!`
    };
  };

  const recordSellerSale = async (sale: {
    sellerCode: string;
    campaignId: string;
    campaignCode: string;
    advertiserName: string;
    originalGrossAmount: number;
    discountAmount: number;
    netPaidAmount: number;
    commissionAmount: number;
    createdAt: string;
  }) => {
    const seller = affiliatesRef.current.find(item => item.code === sale.sellerCode);
    const commission: CommissionRecord = {
      id: `comm-${Date.now()}`,
      sellerCode: sale.sellerCode,
      campaignId: sale.campaignId,
      campaignCode: sale.campaignCode,
      advertiserName: sale.advertiserName,
      originalGrossAmount: sale.originalGrossAmount,
      discountAmount: sale.discountAmount,
      netPaidAmount: sale.netPaidAmount,
      commissionRate: seller?.commissionRate || 0.10,
      commissionAmount: sale.commissionAmount,
      status: 'AVAILABLE',
      createdAt: sale.createdAt
    };

    if (isSupabaseConfigured) await insertCommission(commission);
    setCommissions(prev => sortCommissions([commission, ...prev]));

    if (!seller) return;
    const alreadyReferred = commissionsRef.current.some(item =>
      item.sellerCode === sale.sellerCode && item.advertiserName.trim().toLowerCase() === sale.advertiserName.trim().toLowerCase()
    );
    const nextSeller: AffiliateSeller = {
      ...seller,
      totalSalesVolume: seller.totalSalesVolume + sale.netPaidAmount,
      accumulatedCommission: seller.accumulatedCommission + sale.commissionAmount,
      availableCommission: seller.availableCommission + sale.commissionAmount,
      totalReferredClients: seller.totalReferredClients + (alreadyReferred ? 0 : 1)
    };
    if (isSupabaseConfigured) await updateAffiliateRow(nextSeller);
    setAffiliates(prev => sortAffiliates(prev.map(item => item.id === seller.id ? nextSeller : item)));
  };

  const sellerRateFor = (sellerCode?: string) => {
    if (!sellerCode) return 0;
    const seller = affiliatesRef.current.find(item => item.code === sellerCode);
    return seller?.commissionRate || 0.10;
  };

  const resolveAdvertiserId = async (email: string) => {
    if (
      currentUser.role === 'ADVERTISER' &&
      currentUser.email.trim().toLowerCase() === email.trim().toLowerCase()
    ) {
      return currentUser.id;
    }
    if (!isSupabaseConfigured) return '';
    return findProfileIdByEmail(email);
  };

  // Purchase Ad Campaign & Calculate Recurrent commission on the net amount
  const createCampaign = async (data: {
    advertiserName: string;
    advertiserEmail: string;
    companyName: string;
    campaignName: string;
    destinationUrl: string;
    creativeDesktopUrl: string;
    creativeMobileUrl: string;
    position: AdPosition;
    planId: string;
    couponCode?: string;
  }) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'As campanhas só são gravadas nas tabelas do Supabase.' };
    }

    const plan = adPlans.find(p => p.id === data.planId);
    if (!plan || !plan.active) {
      return { success: false, error: 'Plano selecionado não está disponível.' };
    }

    const originalPrice = plan.price;
    let discountAmount = 0;
    let sellerOwnerCode: string | undefined = undefined;

    if (data.couponCode) {
      const couponValidation = validateCoupon(data.couponCode, originalPrice);
      if (couponValidation.valid) {
        discountAmount = couponValidation.discountAmount;
        sellerOwnerCode = couponValidation.sellerOwnerCode;
        const matched = couponsRef.current.find(c => c.code.toUpperCase() === data.couponCode?.toUpperCase());
        if (matched) {
          const nextUses = matched.usesCount + 1;
          setCoupons(prev => prev.map(c => c.id === matched.id ? { ...c, usesCount: nextUses } : c));
          if (isSupabaseConfigured) {
            void incrementCouponUseRow(matched.id, nextUses).catch(() => undefined);
          }
        }
      }
    }

    // Critical Business Rule: Calculate on NET amount paid!
    const netAmountPaid = Math.max(0, originalPrice - discountAmount);

    const now = new Date();
    const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const campaignCode = `CAMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const sellerCommissionAmount = sellerOwnerCode
      ? Math.round((netAmountPaid * sellerRateFor(sellerOwnerCode)) * 100) / 100
      : 0;

    const draft: AdCampaign = {
      id: '',
      campaignCode,
      advertiserId: await resolveAdvertiserId(data.advertiserEmail),
      advertiserName: data.advertiserName,
      advertiserEmail: data.advertiserEmail.trim().toLowerCase(),
      companyName: data.companyName,
      campaignName: data.campaignName,
      destinationUrl: data.destinationUrl,
      creativeDesktopUrl: data.creativeDesktopUrl,
      creativeMobileUrl: data.creativeMobileUrl,
      position: data.position,
      planId: plan.id,
      planName: plan.name,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      originalPrice,
      couponCodeUsed: data.couponCode,
      discountAmount,
      netAmountPaid,
      status: 'ACTIVE',
      referredBySellerCode: sellerOwnerCode,
      sellerCommissionAmount,
      sellerCommissionPaid: false,
      createdAt: now.toISOString(),
      impressions: 0,
      clicks: 0
    };

    try {
      const saved = await insertCampaignRow(draft);
      setAdCampaigns(prev => [saved, ...prev]);
      if (sellerOwnerCode && sellerCommissionAmount > 0) {
        await recordSellerSale({
          sellerCode: sellerOwnerCode,
          campaignId: saved.id,
          campaignCode: saved.campaignCode,
          advertiserName: data.companyName,
          originalGrossAmount: originalPrice,
          discountAmount,
          netPaidAmount: netAmountPaid,
          commissionAmount: sellerCommissionAmount,
          createdAt: saved.createdAt
        });
      }
      logAuditAction('CREATE_CAMPAIGN', 'PUBLICIDADE', `Nova campanha paga: ${saved.campaignCode} - R$ ${netAmountPaid}`);
      return { success: true, campaign: saved };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível gravar a campanha.' };
    }
  };

  const applyAdminCampaignFields = (data: AdminCampaignInput, base?: AdCampaign): AdCampaign | { error: string } => {
    const plan = adPlans.find(p => p.id === data.planId);
    if (!plan) {
      return { error: 'Selecione um plano válido.' };
    }

    const campaignName = data.campaignName.trim();
    const companyName = data.companyName.trim();
    const destinationUrl = data.destinationUrl.trim();
    const creativeDesktopUrl = data.creativeDesktopUrl.trim();
    const creativeMobileUrl = data.creativeMobileUrl.trim() || creativeDesktopUrl;

    if (!campaignName || !companyName || !destinationUrl || !creativeDesktopUrl) {
      return { error: 'Preencha nome, empresa, link de destino e a arte do banner.' };
    }

    const originalPrice = Math.max(0, Number(data.originalPrice) || 0);
    const discountAmount = Math.min(originalPrice, Math.max(0, Number(data.discountAmount) || 0));
    const netAmountPaid = Math.max(0, Math.round((originalPrice - discountAmount) * 100) / 100);
    const sellerCode = data.referredBySellerCode?.trim().toUpperCase() || undefined;
    const sellerCommissionAmount = sellerCode
      ? Math.round((netAmountPaid * sellerRateFor(sellerCode)) * 100) / 100
      : 0;

    const now = new Date().toISOString();

    return {
      id: base?.id || `camp-${Date.now()}`,
      campaignCode: base?.campaignCode || `CAMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      advertiserId: base?.advertiserId || '',
      advertiserName: data.advertiserName.trim() || companyName,
      advertiserEmail: data.advertiserEmail.trim(),
      companyName,
      campaignName,
      destinationUrl,
      creativeDesktopUrl,
      creativeMobileUrl,
      position: data.position,
      planId: plan.id,
      planName: plan.name,
      startDate: data.startDate,
      endDate: data.endDate,
      originalPrice,
      couponCodeUsed: base?.couponCodeUsed,
      discountAmount,
      netAmountPaid,
      status: data.status,
      referredBySellerCode: sellerCode,
      sellerCommissionAmount,
      sellerCommissionPaid: base?.sellerCommissionPaid || false,
      createdAt: base?.createdAt || now,
      impressions: base?.impressions || 0,
      clicks: base?.clicks || 0
    };
  };

  const creditSellerCommission = async (campaign: AdCampaign) => {
    if (!campaign.referredBySellerCode || !campaign.sellerCommissionAmount) return;
    const alreadyCredited = commissionsRef.current.some(item => item.campaignId === campaign.id);
    if (alreadyCredited) return;
    await recordSellerSale({
      sellerCode: campaign.referredBySellerCode,
      campaignId: campaign.id,
      campaignCode: campaign.campaignCode,
      advertiserName: campaign.companyName,
      originalGrossAmount: campaign.originalPrice,
      discountAmount: campaign.discountAmount,
      netPaidAmount: campaign.netAmountPaid,
      commissionAmount: campaign.sellerCommissionAmount,
      createdAt: new Date().toISOString()
    });
  };

  const createAdminCampaign = async (data: AdminCampaignInput) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'As campanhas só são gravadas nas tabelas do Supabase.' };
    }
    const built = applyAdminCampaignFields(data);
    if ('error' in built) {
      return { success: false, error: built.error };
    }

    try {
      built.advertiserId = await resolveAdvertiserId(built.advertiserEmail);
      const saved = await insertCampaignRow(built);
      setAdCampaigns(prev => [saved, ...prev]);
      await creditSellerCommission(saved);
      logAuditAction('CREATE_CAMPAIGN', 'PUBLICIDADE', `Campanha criada no painel: ${saved.campaignCode} — ${saved.campaignName}`);
      return { success: true, campaign: saved };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível gravar a campanha.' };
    }
  };

  const updateCampaign = async (id: string, data: AdminCampaignInput) => {
    const existing = adCampaignsRef.current.find(c => c.id === id);
    if (!existing) {
      return { success: false, error: 'Campanha não encontrada.' };
    }

    const built = applyAdminCampaignFields(data, existing);
    if ('error' in built) {
      return { success: false, error: built.error };
    }

    try {
      built.advertiserId = existing.advertiserId || await resolveAdvertiserId(built.advertiserEmail);
      const saved = isSupabaseConfigured ? await updateCampaignRow(built) : built;
      setAdCampaigns(prev => prev.map(c => c.id === id ? saved : c));
      logAuditAction('UPDATE_CAMPAIGN', 'PUBLICIDADE', `Campanha editada: ${saved.campaignCode} — ${saved.campaignName}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível atualizar a campanha.' };
    }
  };

  const assertPlanAdmin = () => isPortalAdmin;

  const parseAdPlanInput = (input: AdPlanInput): AdPlanInput | { error: string } => {
    const name = input.name.trim();
    const description = input.description.trim();
    const durationDays = Math.round(Number(input.durationDays));
    const price = Math.round(Number(input.price) * 100) / 100;
    const discountPercentage = Math.round(Number(input.discountPercentage));

    if (!name) return { error: 'Informe o nome do pacote.' };
    if (!description) return { error: 'Informe a descrição do pacote.' };
    if (!Number.isInteger(durationDays) || durationDays < 1) {
      return { error: 'A duração precisa ser de pelo menos 1 dia.' };
    }
    if (!Number.isFinite(price) || price < 0) return { error: 'Informe um valor válido para o pacote.' };
    if (!Number.isInteger(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
      return { error: 'A economia exibida precisa ficar entre 0% e 100%.' };
    }

    return {
      name,
      description,
      durationDays,
      price,
      discountPercentage,
      active: input.active,
      highlighted: Boolean(input.highlighted)
    };
  };

  const addAdPlan = async (input: AdPlanInput) => {
    if (!assertPlanAdmin()) {
      return { success: false, error: 'Somente o administrador pode criar pacotes de anúncio.' };
    }
    const parsed = parseAdPlanInput(input);
    if ('error' in parsed) return { success: false, error: parsed.error };

    const plan: AdPlan = {
      ...parsed,
      id: `plan-${Date.now()}`
    };

    try {
      if (isSupabaseConfigured) await insertAdPlan(plan);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível criar o pacote.' };
    }

    setAdPlans(prev => sortAdPlans([
      plan,
      ...prev.map(item => (plan.highlighted ? { ...item, highlighted: false } : item))
    ]));
    logAuditAction('CREATE_AD_PLAN', 'PLANOS', `Pacote criado: ${plan.name} — R$ ${plan.price}`);
    return { success: true };
  };

  const updateAdPlan = async (id: string, input: AdPlanInput) => {
    if (!assertPlanAdmin()) {
      return { success: false, error: 'Somente o administrador pode alterar pacotes de anúncio.' };
    }
    const current = adPlansRef.current.find(item => item.id === id);
    if (!current) return { success: false, error: 'Pacote não encontrado.' };

    const parsed = parseAdPlanInput(input);
    if ('error' in parsed) return { success: false, error: parsed.error };

    const next: AdPlan = { ...current, ...parsed };
    try {
      if (isSupabaseConfigured) await updateAdPlanRow(next);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível atualizar o pacote.' };
    }

    setAdPlans(prev => sortAdPlans(prev.map(item => {
      if (item.id === id) return next;
      if (next.highlighted) return { ...item, highlighted: false };
      return item;
    })));
    logAuditAction('UPDATE_AD_PLAN', 'PLANOS', `Pacote atualizado: ${next.name} — R$ ${next.price}`);
    return { success: true };
  };

  const deleteAdPlan = async (id: string) => {
    if (!assertPlanAdmin()) {
      return { success: false, error: 'Somente o administrador pode excluir pacotes de anúncio.' };
    }
    const current = adPlansRef.current.find(item => item.id === id);
    if (!current) return { success: false, error: 'Pacote não encontrado.' };

    try {
      if (isSupabaseConfigured) await deleteAdPlanRow(id);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível excluir o pacote.' };
    }

    setAdPlans(prev => prev.filter(item => item.id !== id));
    logAuditAction('DELETE_AD_PLAN', 'PLANOS', `Pacote excluído: ${current.name}`);
    return { success: true };
  };

  const updateCampaignStatus = async (id: string, status: AdCampaign['status']) => {
    const existing = adCampaignsRef.current.find(item => item.id === id);
    if (!existing) return { success: false, error: 'Campanha não encontrada.' };
    const next = { ...existing, status };
    try {
      const saved = isSupabaseConfigured ? await updateCampaignRow(next) : next;
      setAdCampaigns(prev => prev.map(c => c.id === id ? saved : c));
      logAuditAction('STATUS_CAMPAIGN', 'PUBLICIDADE', `Campanha ${saved.campaignCode} alterada para ${status}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível alterar o status.' };
    }
  };

  const assertCouponAdmin = () => isPortalAdmin;

  const parseCouponInput = (input: CouponInput, ignoreId?: string): CouponInput | { error: string } => {
    const code = input.code.trim().toUpperCase().replace(/\s+/g, '');
    const discountPercent = Math.round(Number(input.discountPercent));
    const discountFixed = Math.round(Number(input.discountFixed || 0) * 100) / 100;
    const minPurchaseValue = Math.round(Number(input.minPurchaseValue || 0) * 100) / 100;
    const sellerOwnerCode = input.sellerOwnerCode?.trim().toUpperCase() || '';
    const expiresAt = input.expiresAt;
    const maxUsesRaw = input.maxUses;

    if (!/^[A-Z0-9][A-Z0-9_-]{1,19}$/.test(code)) {
      return { error: 'O código precisa ter de 2 a 20 caracteres, com letras, números, _ ou -.' };
    }
    if (couponsRef.current.some(item => item.id !== ignoreId && item.code.toUpperCase() === code)) {
      return { error: 'Já existe um cupom com este código.' };
    }
    if (!Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      return { error: 'O desconto percentual precisa ficar entre 0% e 100%.' };
    }
    if (!Number.isFinite(discountFixed) || discountFixed < 0) {
      return { error: 'Informe um valor fixo de desconto válido.' };
    }
    if (discountPercent <= 0 && discountFixed <= 0) {
      return { error: 'Informe um desconto percentual ou um valor fixo.' };
    }
    if (!Number.isFinite(minPurchaseValue) || minPurchaseValue < 0) {
      return { error: 'Informe uma compra mínima válida.' };
    }
    if (!expiresAt || Number.isNaN(new Date(expiresAt).getTime())) {
      return { error: 'Informe a data de validade do cupom.' };
    }
    if (maxUsesRaw !== undefined && (!Number.isInteger(maxUsesRaw) || maxUsesRaw < 1)) {
      return { error: 'O limite de usos precisa ser um número inteiro maior que zero.' };
    }

    return {
      code,
      discountPercent,
      discountFixed: discountFixed > 0 ? discountFixed : undefined,
      minPurchaseValue: minPurchaseValue > 0 ? minPurchaseValue : undefined,
      firstPurchaseOnly: input.firstPurchaseOnly,
      sellerOwnerCode: sellerOwnerCode || undefined,
      active: input.active,
      expiresAt,
      maxUses: maxUsesRaw
    };
  };

  const addCoupon = async (input: CouponInput) => {
    if (!assertCouponAdmin()) {
      return { success: false, error: 'Somente o administrador pode criar cupons.' };
    }
    const parsed = parseCouponInput(input);
    if ('error' in parsed) return { success: false, error: parsed.error };

    const coupon: Coupon = {
      ...parsed,
      id: `coup-${Date.now()}`,
      usesCount: 0
    };

    try {
      if (isSupabaseConfigured) await insertCoupon(coupon);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível criar o cupom.' };
    }

    setCoupons(prev => sortCoupons([coupon, ...prev]));
    logAuditAction('CREATE_COUPON', 'CUPONS', `Novo cupom: ${coupon.code}`);
    return { success: true };
  };

  const updateCoupon = async (id: string, input: CouponInput) => {
    if (!assertCouponAdmin()) {
      return { success: false, error: 'Somente o administrador pode alterar cupons.' };
    }
    const current = couponsRef.current.find(item => item.id === id);
    if (!current) return { success: false, error: 'Cupom não encontrado.' };

    const parsed = parseCouponInput(input, id);
    if ('error' in parsed) return { success: false, error: parsed.error };

    const next: Coupon = { ...current, ...parsed, usesCount: current.usesCount };
    try {
      if (isSupabaseConfigured) await updateCouponRow(next);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível atualizar o cupom.' };
    }

    setCoupons(prev => sortCoupons(prev.map(item => item.id === id ? next : item)));
    logAuditAction('UPDATE_COUPON', 'CUPONS', `Cupom atualizado: ${next.code} (${next.discountPercent}%)`);
    return { success: true };
  };

  const toggleCouponActive = async (id: string) => {
    if (!assertCouponAdmin()) {
      return { success: false, error: 'Somente o administrador pode alterar cupons.' };
    }
    const current = couponsRef.current.find(item => item.id === id);
    if (!current) return { success: false, error: 'Cupom não encontrado.' };

    const next: Coupon = { ...current, active: !current.active };
    try {
      if (isSupabaseConfigured) await updateCouponRow(next);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível atualizar o cupom.' };
    }

    setCoupons(prev => prev.map(item => item.id === id ? next : item));
    logAuditAction('TOGGLE_COUPON', 'CUPONS', `Cupom ${next.code} ${next.active ? 'ativado' : 'pausado'}`);
    return { success: true };
  };

  const deleteCoupon = async (id: string) => {
    if (!assertCouponAdmin()) {
      return { success: false, error: 'Somente o administrador pode excluir cupons.' };
    }
    const current = couponsRef.current.find(item => item.id === id);
    if (!current) return { success: false, error: 'Cupom não encontrado.' };

    try {
      if (isSupabaseConfigured) await deleteCouponRow(id);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível excluir o cupom.' };
    }

    setCoupons(prev => prev.filter(item => item.id !== id));
    logAuditAction('DELETE_COUPON', 'CUPONS', `Cupom excluído: ${current.code}`);
    return { success: true };
  };

  const assertAffiliateAdmin = () => isPortalAdmin;

  const parseAffiliateInput = (input: AffiliateInput, ignoreId?: string): AffiliateInput | { error: string } => {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    const code = input.code.trim().toUpperCase().replace(/\s+/g, '');
    const couponCode = (input.couponCode || input.code).trim().toUpperCase().replace(/\s+/g, '');
    const commissionRate = Math.round(Number(input.commissionRate) * 10000) / 10000;

    if (name.length < 3) return { error: 'Informe o nome do consultor.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Informe um e-mail válido.' };
    if (!/^[A-Z0-9][A-Z0-9_-]{1,19}$/.test(code)) {
      return { error: 'O código precisa ter de 2 a 20 caracteres, com letras, números, _ ou -.' };
    }
    if (!/^[A-Z0-9][A-Z0-9_-]{1,19}$/.test(couponCode)) {
      return { error: 'O cupom precisa ter de 2 a 20 caracteres, com letras, números, _ ou -.' };
    }
    if (affiliatesRef.current.some(item => item.id !== ignoreId && item.code === code)) {
      return { error: 'Já existe um consultor com este código.' };
    }
    if (affiliatesRef.current.some(item => item.id !== ignoreId && item.couponCode === couponCode)) {
      return { error: 'Já existe um consultor com este cupom.' };
    }
    if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 1) {
      return { error: 'A comissão precisa ficar entre 0% e 100%.' };
    }

    return {
      name,
      email,
      phone,
      code,
      couponCode,
      commissionRate,
      status: input.status
    };
  };

  const ensureSellerCoupon = async (seller: { code: string; couponCode: string }) => {
    if (couponsRef.current.some(item => item.code.toUpperCase() === seller.couponCode)) return;
    const coupon: Coupon = {
      id: `coupon-${seller.couponCode.toLowerCase()}`,
      code: seller.couponCode,
      discountPercent: 10,
      discountFixed: 0,
      minPurchaseValue: 0,
      firstPurchaseOnly: false,
      sellerOwnerCode: seller.code,
      active: true,
      expiresAt: '',
      usesCount: 0
    };
    if (isSupabaseConfigured) await insertCoupon(coupon);
    setCoupons(prev => sortCoupons([...prev, coupon]));
  };

  const addAffiliate = async (input: AffiliateInput) => {
    if (!assertAffiliateAdmin()) {
      return { success: false, error: 'Somente o administrador pode cadastrar consultores.' };
    }
    const parsed = parseAffiliateInput(input);
    if ('error' in parsed) return { success: false, error: parsed.error };
    if (!input.password || input.password.length < 6) {
      return { success: false, error: 'Defina uma senha de pelo menos 6 caracteres para o afiliado entrar.' };
    }
    if (!isSupabaseConfigured) {
      return { success: false, error: 'O cadastro do afiliado só é gravado nas tabelas do Supabase.' };
    }

    try {
      const userId = await registerPortalUser({
        email: parsed.email,
        password: input.password,
        name: parsed.name,
        role: 'SELLER',
        phone: parsed.phone,
        affiliateCode: parsed.code
      });
      const seller: AffiliateSeller = {
        ...parsed,
        id: `seller-${Date.now()}`,
        userId,
        totalReferredClients: 0,
        totalSalesVolume: 0,
        accumulatedCommission: 0,
        availableCommission: 0,
        paidCommission: 0,
        pendingCommission: 0,
        createdAt: new Date().toISOString()
      };
      await insertAffiliate(seller);
      try {
        await ensureSellerCoupon(parsed);
      } catch (couponError) {
        const message = couponError instanceof Error ? couponError.message : '';
        if (!/já existe|duplicate|23505/i.test(message)) throw couponError;
      }
      setAffiliates(prev => sortAffiliates([...prev, seller]));
      logAuditAction('CREATE_AFFILIATE', 'AFILIADOS', `Novo consultor: ${seller.name} (${seller.code})`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível cadastrar o consultor.' };
    }
  };

  const updateAffiliate = async (id: string, input: AffiliateInput) => {
    if (!assertAffiliateAdmin()) {
      return { success: false, error: 'Somente o administrador pode alterar consultores.' };
    }
    const current = affiliatesRef.current.find(item => item.id === id);
    if (!current) return { success: false, error: 'Consultor não encontrado.' };

    const parsed = parseAffiliateInput(input, id);
    if ('error' in parsed) return { success: false, error: parsed.error };

    const next: AffiliateSeller = { ...current, ...parsed };
    try {
      if (isSupabaseConfigured && input.password && !current.userId) {
        if (input.password.length < 6) {
          return { success: false, error: 'A senha do acesso precisa ter pelo menos 6 caracteres.' };
        }
        next.userId = await registerPortalUser({
          email: parsed.email,
          password: input.password,
          name: parsed.name,
          role: 'SELLER',
          phone: parsed.phone,
          affiliateCode: parsed.code
        });
      }
      if (isSupabaseConfigured) await updateAffiliateRow(next);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível atualizar o consultor.' };
    }

    setAffiliates(prev => sortAffiliates(prev.map(item => item.id === id ? next : item)));
    logAuditAction('UPDATE_AFFILIATE', 'AFILIADOS', `Consultor atualizado: ${next.name} (${next.code})`);
    return { success: true };
  };

  const setAffiliateStatus = async (id: string, status: AffiliateSeller['status']) => {
    const current = affiliatesRef.current.find(item => item.id === id);
    if (!current) return { success: false, error: 'Consultor não encontrado.' };
    return updateAffiliate(id, {
      name: current.name,
      email: current.email,
      phone: current.phone,
      code: current.code,
      couponCode: current.couponCode,
      commissionRate: current.commissionRate,
      status
    });
  };

  const addAdvertiserAccount = async (input: AdvertiserAccountInput) => {
    if (!isPortalAdmin) {
      return { success: false, error: 'Somente o administrador pode cadastrar o acesso do anunciante.' };
    }
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const companyName = input.companyName.trim();
    if (name.length < 3) return { success: false, error: 'Informe o nome do anunciante.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: 'Informe um e-mail válido.' };
    if (companyName.length < 2) return { success: false, error: 'Informe a empresa do anunciante.' };
    if (!input.password || input.password.length < 6) {
      return { success: false, error: 'Defina uma senha de pelo menos 6 caracteres.' };
    }
    if (!isSupabaseConfigured) {
      return { success: false, error: 'O acesso do anunciante só é gravado nas tabelas do Supabase.' };
    }

    try {
      await registerPortalUser({
        email,
        password: input.password,
        name,
        role: 'ADVERTISER',
        phone: input.phone.trim(),
        companyName
      });
      logAuditAction('CREATE_ADVERTISER', 'PUBLICIDADE', `Acesso de anunciante criado: ${email}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível cadastrar o anunciante.' };
    }
  };

  const requestSellerPayout = (sellerCode: string, amount: number) => {
    const seller = affiliatesRef.current.find(item => item.code === sellerCode);
    if (!seller || seller.availableCommission < amount) return false;

    const next: AffiliateSeller = {
      ...seller,
      availableCommission: seller.availableCommission - amount,
      pendingCommission: seller.pendingCommission + amount
    };
    setAffiliates(prev => prev.map(item => item.id === seller.id ? next : item));
    if (isSupabaseConfigured) {
      void updateAffiliateRow(next).catch(() => undefined);
    }

    logAuditAction('REQUEST_PAYOUT', 'AFILIADOS', `Solicitação de saque de R$ ${amount} pelo consultor ${sellerCode}`);
    return true;
  };

  const approveCommissionPayout = async (commissionId: string) => {
    if (!assertAffiliateAdmin()) {
      return { success: false, error: 'Somente o administrador pode registrar pagamentos.' };
    }
    const current = commissionsRef.current.find(item => item.id === commissionId);
    if (!current) return { success: false, error: 'Comissão não encontrada.' };
    if (current.status === 'PAID') return { success: false, error: 'Esta comissão já foi paga.' };

    const next: CommissionRecord = { ...current, status: 'PAID', paidAt: new Date().toISOString() };
    const seller = affiliatesRef.current.find(item => item.code === current.sellerCode);
    const nextSeller = seller
      ? {
          ...seller,
          availableCommission: current.status === 'AVAILABLE'
            ? Math.max(0, seller.availableCommission - current.commissionAmount)
            : seller.availableCommission,
          pendingCommission: current.status === 'PENDING'
            ? Math.max(0, seller.pendingCommission - current.commissionAmount)
            : seller.pendingCommission,
          paidCommission: seller.paidCommission + current.commissionAmount
        }
      : null;

    try {
      if (isSupabaseConfigured) {
        await updateCommissionRow(next);
        if (nextSeller) await updateAffiliateRow(nextSeller);
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Não foi possível registrar o pagamento.' };
    }

    setCommissions(prev => prev.map(item => item.id === commissionId ? next : item));
    if (nextSeller) {
      setAffiliates(prev => prev.map(item => item.id === nextSeller.id ? nextSeller : item));
    }
    logAuditAction('PAY_COMMISSION', 'AFILIADOS', `Comissão paga: ${current.sellerCode} — R$ ${current.commissionAmount.toFixed(2)}`);
    return { success: true };
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentUser,
        isPortalAdmin,
        switchUserRole,
        signIn,
        signOut,
        siteSettings,
        updateSiteSettings,
        news,
        newsSyncError,
        categories,
        tickerItems,
        videos,
        events,
        addNews,
        updateNews,
        deleteNews,
        republishEditorialNews,
        updateTickerItem,
        addTickerItem,
        deleteTickerItem,
        magazineIssues,
        activeMagazineId,
        openMagazineReader,
        closeMagazineReader,
        addMagazineIssue,
        updateMagazineIssue,
        deleteMagazineIssue,
        addPageToIssue,
        updatePageInIssue,
        removePageFromIssue,
        recordMagazineRead,
        recordMagazineDownload,
        adPlans,
        adPlansSyncError,
        addAdPlan,
        updateAdPlan,
        deleteAdPlan,
        adCampaigns,
        campaignsSyncError,
        coupons,
        couponsSyncError,
        addCoupon,
        updateCoupon,
        toggleCouponActive,
        deleteCoupon,
        affiliates,
        commissions,
        affiliatesSyncError,
        affiliatesReady,
        addAffiliate,
        updateAffiliate,
        setAffiliateStatus,
        addAdvertiserAccount,
        createCampaign,
        updateCampaignStatus,
        createAdminCampaign,
        updateCampaign,
        trackAdClick,
        trackAdImpression,
        validateCoupon,
        requestSellerPayout,
        approveCommissionPayout,
        auditLogs,
        logAuditAction,
        isLiveModalOpen,
        setIsLiveModalOpen,
        isAdCheckoutOpen,
        setIsAdCheckoutOpen,
        preselectedAdPosition,
        setPreselectedAdPosition,
        formulaDaBeleza,
        updateFormulaDaBeleza,
        updateFormulaDaBelezaVideoColumn,
        setFeaturedFormulaDaBelezaVideo,
        addFormulaDaBelezaVideoColumn,
        formulaDaBelezaParticipations,
        submitFormulaDaBelezaParticipation,
        updateFormulaDaBelezaParticipationStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
