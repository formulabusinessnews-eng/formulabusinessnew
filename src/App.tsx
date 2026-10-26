import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { BreakingNewsTicker } from './components/ticker/BreakingNewsTicker';
import { HeroSection } from './components/hero/HeroSection';
import { LatestNewsCarousel } from './components/news/LatestNewsCarousel';
import { FormulaDaBelezaSection } from './components/program/FormulaDaBelezaSection';
import { MagazineHomeSection } from './components/magazine/MagazineHomeSection';
import { RealisticMagazineReader } from './components/magazine/RealisticMagazineReader';
import { AdBannerSlot } from './components/ads/AdBannerSlot';
import { AdTickerBanner } from './components/ads/AdTickerBanner';
import { AdCheckoutModal } from './components/ads/AdCheckoutModal';
import { LiveBroadcastModal } from './components/modals/LiveBroadcastModal';
import { NewsDetailModal } from './components/news/NewsDetailModal';
import { AdvertiserDashboard } from './components/dashboard/AdvertiserDashboard';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EventsSection } from './components/events/EventsSection';
import { VideosSection } from './components/video/VideosSection';
import { NewsItem } from './types';
import { parseMagazineRoute } from './lib/magazinePath';

const MainPortalContent: React.FC = () => {
  const { 
    activeMagazineId, 
    magazineIssues, 
    closeMagazineReader,
    setIsAdCheckoutOpen,
    isPortalAdmin
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active magazine object if reader is open
  const currentOpenMagazine = magazineIssues.find(m => m.id === activeMagazineId);

  const handleNavigateTab = (tab: string) => {
    if (tab === 'admin' && !isPortalAdmin) {
      setActiveTab('home');
      return;
    }
    setActiveTab(tab);
    if (tab === 'anuncie') {
      setIsAdCheckoutOpen(true);
    }
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const route = parseMagazineRoute();
    if (tab === 'revista') {
      if (route.kind === 'issue') closeMagazineReader();
      else if (route.kind === 'other') window.history.pushState({}, '', '/revista');
      return;
    }
    if (route.kind !== 'other') closeMagazineReader('/');
  };

  useEffect(() => {
    const syncTab = () => {
      const route = parseMagazineRoute();
      if (route.kind === 'list' || route.kind === 'issue') setActiveTab('revista');
    };
    syncTab();
    window.addEventListener('popstate', syncTab);
    return () => window.removeEventListener('popstate', syncTab);
  }, []);

  useEffect(() => {
    if (activeTab === 'admin' && !isPortalAdmin) {
      setActiveTab('home');
    }
  }, [activeTab, isPortalAdmin]);

  return (
    <div className="min-h-screen bg-[#020B14] text-white flex flex-col selection:bg-[#D9A928] selection:text-black pb-16 lg:pb-0">
      
      {/* 1. Header with Mobile-First Nav, Language Selector & Role Switcher */}
      <Header 
        onNavigateTab={handleNavigateTab} 
        activeTab={activeTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* 2. Breaking News Ticker (Right under the main menu) */}
      <BreakingNewsTicker />

      {/* Main View Router */}
      <main className="flex-1">
        
        {/* VIEW: HOME PORTAL */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Top Header Ad Placement */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-4">
              <AdBannerSlot position="TOP_HEADER" />
            </div>

            {/* Hero (Video Broadcast + Highlights) */}
            <HeroSection onSelectNews={setSelectedNews} />

            {/* Continuous Slow Ticker Carousel: Últimas Notícias */}
            <LatestNewsCarousel onSelectNews={setSelectedNews} />

            {/* Programa Fórmula da Beleza — entre Últimas Notícias e Marcas em Evidência */}
            <FormulaDaBelezaSection />

            {/* Slow Moving Ad Banner Ticker ("os banners se movam como letreiro bem lento") */}
            <AdTickerBanner />

            {/* Digital Magazine with Realistic 3D Page Flip Experience */}
            <MagazineHomeSection />

            {/* Content Middle Ad Placement */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2">
              <AdBannerSlot position="CONTENT_MIDDLE" />
            </div>

            {/* Events & Congresses */}
            <EventsSection />

            {/* Multimedia Videos & YouTube Shorts */}
            <VideosSection />
          </div>
        )}

        {/* VIEW: ADVERTISER DASHBOARD ("MINHA PUBLICIDADE") */}
        {activeTab === 'advertiser' && (
          <AdvertiserDashboard />
        )}

        {/* VIEW: SELLER / AFFILIATE DASHBOARD ("PAINEL CONSULTOR 10%") */}
        {activeTab === 'seller' && (
          <SellerDashboard />
        )}

        {/* VIEW: ADMIN MASTER DASHBOARD (MAGAZINE MANAGER + FULL PLATFORM) */}
        {activeTab === 'admin' && isPortalAdmin && (
          <AdminDashboard />
        )}

        {/* VIEW: REVISTA DEDICADA */}
        {activeTab === 'revista' && (
          <div className="pt-6">
            <MagazineHomeSection />
          </div>
        )}

        {/* VIEW: CATEGORY / EDITORIAL FILTER */}
        {!['home', 'advertiser', 'seller', 'admin', 'revista'].includes(activeTab) && (
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-6">
            <div className="pb-4 border-b border-gray-800">
              <span className="text-xs uppercase font-mono text-[#D9A928] font-bold">Editoria Especial</span>
              <h2 className="text-2xl font-bold uppercase text-white mt-1">
                {activeTab.replace('-', ' & ')}
              </h2>
            </div>
            <LatestNewsCarousel onSelectNews={setSelectedNews} />
            <div className="py-4">
              <AdBannerSlot position="BETWEEN_NEWS" />
            </div>
          </div>
        )}
      </main>

      {/* Institutional Footer */}
      <Footer onNavigateTab={handleNavigateTab} />

      {/* MOBILE BOTTOM NAVIGATION BAR (Fixed at bottom on mobile screens) */}
      <MobileBottomNav 
        activeTab={activeTab}
        onNavigateTab={handleNavigateTab}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* MODALS */}
      
      {/* 1. Realistic 3D Physical Magazine Reader */}
      {currentOpenMagazine && (
        <RealisticMagazineReader
          issue={currentOpenMagazine}
          onClose={() => closeMagazineReader()}
        />
      )}

      {/* 2. Self-service Ad Checkout Modal */}
      <AdCheckoutModal />

      {/* 3. Live Broadcast Streaming Modal */}
      <LiveBroadcastModal />

      {/* 4. News Article Reading Modal */}
      <NewsDetailModal
        news={selectedNews}
        onClose={() => setSelectedNews(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainPortalContent />
    </AppProvider>
  );
}
