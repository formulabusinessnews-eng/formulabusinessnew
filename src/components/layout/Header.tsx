import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Search, 
  Globe, 
  Radio, 
  User, 
  ShieldCheck, 
  Briefcase, 
  TrendingUp, 
  ChevronDown, 
  Sparkles,
  Phone,
  Mail,
  BookOpen,
  ArrowRight,
  Flame,
  LayoutDashboard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language, UserRole } from '../../types';

interface Props {
  onNavigateTab: (tab: string) => void;
  activeTab: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<Props> = ({ 
  onNavigateTab, 
  activeTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const { 
    language, 
    setLanguage, 
    t, 
    currentUser, 
    switchUserRole, 
    siteSettings,
    setIsLiveModalOpen,
    setIsAdCheckoutOpen
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentDateFormatted = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(new Date());

  const navMenuItems = [
    { id: 'home', label: t.nav.home },
    { id: 'revista', label: 'REVISTA 3D', isSpecial: true },
    { id: 'business', label: t.nav.business },
    { id: 'empreendedorismo', label: t.nav.entrepreneurship },
    { id: 'beleza-estetica', label: t.nav.beauty },
    { id: 'tecnologia-inovacao', label: t.nav.tech },
    { id: 'saude-bem-estar', label: t.nav.health },
    { id: 'carreira-profissoes', label: t.nav.career },
    { id: 'cultura', label: t.nav.culture },
    { id: 'economia', label: t.nav.economy },
    { id: 'eventos', label: t.nav.events },
    { id: 'videos', label: t.nav.videos },
    { id: 'anuncie', label: t.nav.advertise, highlight: true }
  ];

  const handleSelectNav = (id: string) => {
    onNavigateTab(id);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  return (
    <header className="w-full bg-[#020B14] border-b border-[#0A2238] sticky top-0 z-40">
      
      {/* 1. TOP UTILITY BAR (Optimized for Mobile & Desktop) */}
      <div className="bg-[#030e1a] border-b border-gray-800/80 px-3 lg:px-8 py-1.5 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Left: Date & Contacts (Desktop) */}
          <div className="flex items-center gap-3">
            <span className="capitalize text-gray-300 font-medium text-[11px]">
              {currentDateFormatted}
            </span>
            <div className="hidden lg:flex items-center gap-3 text-[11px] text-gray-400 border-l border-gray-800 pl-3">
              <span className="flex items-center gap-1 hover:text-white transition">
                <Mail className="w-3 h-3 text-[#D9A928]" />
                {siteSettings.contactEmail}
              </span>
              <span className="flex items-center gap-1 hover:text-white transition">
                <Phone className="w-3 h-3 text-[#D9A928]" />
                {siteSettings.contactPhone}
              </span>
            </div>
          </div>

          {/* Right: Live broadcast, Language switcher & User profile switcher */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Live Indicator Button */}
            {siteSettings.isLive && (
              <button
                onClick={() => setIsLiveModalOpen(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600/30 transition text-[10px] sm:text-[11px] font-bold animate-pulse"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <Radio className="w-3 h-3" />
                <span>{t.nav.live}</span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-[#061827] rounded-lg border border-gray-800 p-0.5 text-[10px] sm:text-[11px]">
              <Globe className="w-3 h-3 text-[#D9A928] ml-1 mr-1 hidden sm:inline" />
              <button
                onClick={() => setLanguage('pt-BR')}
                className={`px-1.5 py-0.5 rounded transition ${language === 'pt-BR' ? 'bg-[#D9A928] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                title="Português"
              >
                PT
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded transition ${language === 'en' ? 'bg-[#D9A928] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`px-1.5 py-0.5 rounded transition ${language === 'es' ? 'bg-[#D9A928] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                title="Español"
              >
                ES
              </button>
            </div>

            {/* User Profile & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#061827] border border-gray-800 hover:border-[#D9A928]/50 text-white text-[11px] transition"
              >
                <div className="w-4 h-4 rounded-full bg-[#D9A928] text-black flex items-center justify-center font-bold text-[9px]">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-medium text-[10px] truncate max-w-[80px]">
                  {currentUser.role}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* Role Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#061827] border border-[#D9A928]/40 rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="p-2 border-b border-gray-800">
                    <p className="font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-[#D9A928] uppercase font-mono">{currentUser.role}</p>
                    <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
                  </div>

                  <div className="py-2 space-y-1">
                    <p className="px-2 text-[10px] font-bold text-gray-500 uppercase">Alternar Perfil para Teste:</p>
                    
                    <button
                      onClick={() => { switchUserRole('SUPER_ADMIN'); setIsUserMenuOpen(false); onNavigateTab('admin'); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${currentUser.role === 'SUPER_ADMIN' ? 'bg-[#D9A928] text-black font-bold' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Administrador Master</span>
                      {currentUser.role === 'SUPER_ADMIN' && <span className="text-[10px]">Ativo</span>}
                    </button>

                    <button
                      onClick={() => { switchUserRole('ADVERTISER'); setIsUserMenuOpen(false); onNavigateTab('advertiser'); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${currentUser.role === 'ADVERTISER' ? 'bg-[#D9A928] text-black font-bold' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                      <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Anunciante</span>
                      {currentUser.role === 'ADVERTISER' && <span className="text-[10px]">Ativo</span>}
                    </button>

                    <button
                      onClick={() => { switchUserRole('SELLER'); setIsUserMenuOpen(false); onNavigateTab('seller'); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${currentUser.role === 'SELLER' ? 'bg-[#D9A928] text-black font-bold' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                      <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Consultor / Afiliado</span>
                      {currentUser.role === 'SELLER' && <span className="text-[10px]">Ativo</span>}
                    </button>

                    <button
                      onClick={() => { switchUserRole('USER'); setIsUserMenuOpen(false); onNavigateTab('home'); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${currentUser.role === 'USER' ? 'bg-[#D9A928] text-black font-bold' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Leitor / Público</span>
                      {currentUser.role === 'USER' && <span className="text-[10px]">Ativo</span>}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* 2. MAIN BRANDING ROW (Clean Mobile & Desktop Layout) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo Container */}
        <div 
          onClick={() => handleSelectNav('home')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0 min-w-0"
        >
          {siteSettings.logoUrl ? (
            <div className="h-8 sm:h-10 md:h-12 flex items-center">
              <img 
                src={siteSettings.logoUrl} 
                alt={siteSettings.portalName} 
                className="h-full object-contain filter drop-shadow-[0_0_8px_rgba(217,169,40,0.3)] group-hover:scale-105 transition"
              />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#D9A928] to-[#996515] flex items-center justify-center font-serif-luxury font-black text-black text-lg sm:text-xl shadow-lg flex-shrink-0">
              F
            </div>
          )}
          
          <div className="flex flex-col truncate">
            <span className="font-heading font-extrabold text-sm sm:text-lg md:text-xl tracking-tight text-white flex items-center gap-1 leading-none truncate">
              FÓRMULA <span className="text-[#D9A928]">BUSINESS</span>
            </span>
            <span className="text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.2em] text-gray-400 font-semibold uppercase truncate">
              NEWS & DIGITAL MEDIA
            </span>
          </div>
        </div>

        {/* Quick Search Bar (Desktop) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.nav.quickSearch}
              className="w-full bg-[#061827] border border-gray-800 rounded-full py-1.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D9A928]/60 transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2" />
          </div>
        </div>

        {/* Action Buttons on Right */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#061827] border border-gray-800 text-gray-300 hover:text-white"
            aria-label="Buscar"
          >
            <Search className="w-4 h-4 text-[#D9A928]" />
          </button>

          {/* Quick Magazine 3D button on header (Desktop Only - on mobile it is in the bottom bar) */}
          <button
            onClick={() => handleSelectNav('revista')}
            className="hidden md:flex px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold items-center gap-1 bg-[#D9A928]/10 text-[#D9A928] border border-[#D9A928]/40 hover:bg-[#D9A928] hover:text-black transition"
            title="Abrir Revista Digital 3D"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Revista 3D</span>
          </button>

          {/* Desktop Dashboard Shortcuts (Hidden on Mobile to avoid layout squeeze) */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => handleSelectNav('advertiser')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
                activeTab === 'advertiser'
                  ? 'bg-[#D9A928] text-black border-[#D9A928]'
                  : 'bg-[#061827] text-gray-200 border-gray-800 hover:border-[#D9A928]/50'
              }`}
              title={t.nav.myAds}
            >
              <Briefcase className="w-3.5 h-3.5 text-[#D9A928]" />
              <span className="hidden xl:inline">{t.nav.myAds}</span>
            </button>

            <button
              onClick={() => handleSelectNav('seller')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
                activeTab === 'seller'
                  ? 'bg-[#D9A928] text-black border-[#D9A928]'
                  : 'bg-[#061827] text-gray-200 border-gray-800 hover:border-[#D9A928]/50'
              }`}
              title={t.nav.sellerPanel}
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="hidden xl:inline">{t.nav.sellerPanel}</span>
            </button>

            <button
              onClick={() => handleSelectNav('admin')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition ${
                activeTab === 'admin'
                  ? 'bg-[#D9A928] text-black border-[#D9A928]'
                  : 'bg-gradient-to-r from-[#D9A928]/20 to-[#D9A928]/10 text-[#D9A928] border-[#D9A928]/40 hover:bg-[#D9A928]/30'
              }`}
              title={t.nav.admin}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{t.nav.admin}</span>
            </button>
          </div>

        </div>

      </div>

      {/* MOBILE SEARCH EXPANDABLE ROW */}
      {isMobileSearchOpen && (
        <div className="lg:hidden px-4 pb-3 bg-[#020B14] border-b border-gray-800 flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.nav.quickSearch}
            className="flex-1 bg-[#061827] border border-gray-700 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D9A928]"
            autoFocus
          />
          <button
            onClick={() => setIsMobileSearchOpen(false)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. MAIN HORIZONTAL NAVIGATION MENU (Desktop) */}
      <nav className="hidden lg:block border-t border-gray-900 bg-[#04101b]">
        <div className="max-w-7xl mx-auto px-8 flex items-center overflow-x-auto no-scrollbar">
          {navMenuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectNav(item.id)}
                className={`py-3 px-3.5 text-xs font-bold tracking-wider transition uppercase whitespace-nowrap border-b-2 flex items-center gap-1 ${
                  item.isSpecial
                    ? 'text-[#D9A928] hover:text-[#F3C64B] border-transparent font-black bg-[#D9A928]/10 rounded-t'
                    : item.highlight
                    ? 'text-amber-400 hover:text-amber-300 border-transparent font-black'
                    : isActive
                    ? 'border-[#D9A928] text-[#D9A928] bg-[#061827]/50'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-600'
                }`}
              >
                {item.isSpecial && <BookOpen className="w-3.5 h-3.5 text-[#D9A928]" />}
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 4. ADVANCED MOBILE SLIDE-OVER DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
          />

          {/* Drawer Sheet */}
          <div className="relative w-4/5 max-w-sm bg-[#04101b] border-r border-[#D9A928]/30 h-full flex flex-col shadow-2xl z-10 overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="p-4 bg-[#020B14] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#D9A928] text-black font-black flex items-center justify-center text-sm">
                  F
                </div>
                <span className="font-bold text-white text-sm">FÓRMULA BUSINESS</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
                aria-label="Fechar Menu"
              >
                <X className="w-5 h-5 text-[#D9A928]" />
              </button>
            </div>

            {/* Profile & Role Section */}
            <div className="p-4 bg-[#061827] border-b border-gray-800">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Perfil Ativo:</span>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{currentUser.name}</h4>
                  <span className="text-[10px] text-[#D9A928] font-mono">{currentUser.role}</span>
                </div>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="px-2 py-1 bg-[#0A2238] border border-gray-700 text-[10px] text-[#D9A928] rounded font-semibold"
                >
                  Alternar
                </button>
              </div>
            </div>

            {/* Quick Portals & Dashboards Section */}
            <div className="p-4 border-b border-gray-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#D9A928] block tracking-wider">
                Acesso a Painéis
              </span>
              
              <button
                onClick={() => handleSelectNav('revista')}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#D9A928]/20 to-[#D9A928]/10 border border-[#D9A928]/40 text-left flex items-center justify-between text-xs font-bold text-[#D9A928]"
              >
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Revista Digital 3D</span>
                <span className="text-[9px] bg-[#D9A928] text-black px-1.5 py-0.5 rounded font-extrabold uppercase">Ler Agora</span>
              </button>

              <button
                onClick={() => handleSelectNav('advertiser')}
                className="w-full p-2.5 rounded-xl bg-[#061827] border border-gray-800 hover:border-[#D9A928]/40 text-left flex items-center justify-between text-xs font-semibold text-gray-200"
              >
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-[#D9A928]" /> {t.nav.myAds}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
              </button>

              <button
                onClick={() => handleSelectNav('seller')}
                className="w-full p-2.5 rounded-xl bg-[#061827] border border-gray-800 hover:border-[#D9A928]/40 text-left flex items-center justify-between text-xs font-semibold text-gray-200"
              >
                <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#38BDF8]" /> {t.nav.sellerPanel} (10%)</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
              </button>

              <button
                onClick={() => handleSelectNav('admin')}
                className="w-full p-2.5 rounded-xl bg-[#061827] border border-gray-800 hover:border-[#D9A928]/40 text-left flex items-center justify-between text-xs font-semibold text-gray-200"
              >
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#D9A928]" /> {t.nav.admin}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>

            {/* Editorial Categories Menu */}
            <div className="p-4 flex-1 space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider mb-2">
                Editorias & Conteúdo
              </span>
              {navMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                    activeTab === item.id
                      ? 'bg-[#D9A928] text-black'
                      : 'text-gray-300 hover:bg-[#061827] hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {activeTab === item.id && <span className="text-[10px]">•</span>}
                </button>
              ))}
            </div>

            {/* Drawer Footer Contact */}
            <div className="p-4 bg-[#020B14] border-t border-gray-800 text-[11px] text-gray-400 space-y-1">
              <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-[#D9A928]" /> {siteSettings.contactPhone}</p>
              <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-[#D9A928]" /> {siteSettings.contactEmail}</p>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
