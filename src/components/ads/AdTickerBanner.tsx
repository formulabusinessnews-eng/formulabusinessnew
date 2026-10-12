import React, { useState } from 'react';
import { Sparkles, ArrowUpRight, Play, Pause, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdTickerBanner: React.FC = () => {
  const { 
    adCampaigns, 
    trackAdClick, 
    trackAdImpression, 
    setIsAdCheckoutOpen, 
    setPreselectedAdPosition 
  } = useApp();

  const [isPaused, setIsPaused] = useState(false);

  // Active campaigns
  const activeCampaigns = adCampaigns.filter(c => c.status === 'ACTIVE');

  // If few campaigns, supplement with placeholder slots
  const displayItems = activeCampaigns.length >= 2 
    ? activeCampaigns 
    : [
        ...activeCampaigns,
        {
          id: 'placeholder-1',
          campaignCode: 'PATROCÍNIO-01',
          companyName: 'Banco Vanguardia M&A',
          campaignName: 'Assessoria Especializada em Fusões e Private Equity',
          creativeDesktopUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000&h=260&fit=crop&q=80',
          destinationUrl: 'https://vanguardiamna.com.br',
          position: 'BETWEEN_NEWS' as const,
          status: 'ACTIVE' as const
        },
        {
          id: 'placeholder-2',
          campaignCode: 'PATROCÍNIO-02',
          companyName: 'Nexus Cloud Technologies',
          campaignName: 'Nuvem Soberana e Inteligência Artificial Corporativa',
          creativeDesktopUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&h=260&fit=crop&q=80',
          destinationUrl: 'https://nexuscloud.tech',
          position: 'BETWEEN_NEWS' as const,
          status: 'ACTIVE' as const
        },
        {
          id: 'placeholder-3',
          campaignCode: 'PATROCÍNIO-03',
          companyName: 'Luxe BioEstética & Longevidade',
          campaignName: 'Tratamentos de Alta Tecnologia e Medicina Regenerativa',
          creativeDesktopUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1000&h=260&fit=crop&q=80',
          destinationUrl: 'https://luxebio.com.br',
          position: 'BETWEEN_NEWS' as const,
          status: 'ACTIVE' as const
        }
      ];

  // Infinite duplicate loop
  const loopItems = [...displayItems, ...displayItems];

  const handleItemClick = (item: typeof displayItems[0]) => {
    if (item.id.startsWith('placeholder')) {
      setPreselectedAdPosition('BETWEEN_NEWS');
      setIsAdCheckoutOpen(true);
    } else {
      const url = trackAdClick(item.id);
      if (url && url !== '#') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 overflow-hidden">
      
      {/* Ticker Header */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2 text-[#D9A928] font-bold uppercase tracking-wider text-[10px] sm:text-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D9A928] animate-pulse" />
          <span>MARCAS EM EVIDÊNCIA • LETREIRO DE PATROCINADORES</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 p-1"
          >
            {isPaused ? <Play className="w-3 h-3 text-[#D9A928]" /> : <Pause className="w-3 h-3 text-gray-400" />}
            <span className="hidden sm:inline">{isPaused ? 'Retomar' : 'Pausar'}</span>
          </button>
          
          <button
            onClick={() => {
              setPreselectedAdPosition('BETWEEN_NEWS');
              setIsAdCheckoutOpen(true);
            }}
            className="text-[10px] font-bold text-black bg-[#D9A928] hover:bg-[#F3C64B] px-2.5 py-0.5 rounded-full transition flex items-center gap-1"
          >
            <span>Anunciar Aqui</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* CONTINUOUS SLOW MOVING BANNER TICKER */}
      <div 
        className="w-full overflow-hidden relative py-1"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Soft edge gradient fades */}
        <div className="absolute left-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-r from-[#020B14] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-l from-[#020B14] to-transparent z-10 pointer-events-none" />

        <div 
          className="flex items-center gap-5 sm:gap-6 animate-slow-marquee cursor-pointer"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {loopItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => handleItemClick(item)}
              className="w-[300px] sm:w-[380px] md:w-[440px] flex-shrink-0 bg-[#061827] border border-[#D9A928]/30 hover:border-[#D9A928] rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(217,169,40,0.25)] transition duration-300 relative group flex flex-col justify-between"
            >
              <div className="h-32 sm:h-36 w-full relative overflow-hidden bg-black">
                <img
                  src={item.creativeDesktopUrl}
                  alt={item.companyName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#061827] via-black/30 to-transparent" />

                {/* Badge */}
                <span className="absolute top-2.5 right-2.5 bg-black/85 text-[9px] uppercase tracking-wider text-[#D9A928] px-2 py-0.5 rounded font-mono border border-[#D9A928]/30 flex items-center gap-1 backdrop-blur-md">
                  <span>Publicidade Oficial</span>
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </span>
              </div>

              {/* Banner Info */}
              <div className="p-3 bg-[#061827] flex items-center justify-between gap-3 border-t border-gray-800">
                <div className="min-w-0">
                  <span className="text-[10px] text-[#D9A928] font-bold uppercase truncate block">
                    {item.companyName}
                  </span>
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-[#D9A928] transition">
                    {item.campaignName}
                  </h4>
                </div>

                <span className="p-1.5 rounded-lg bg-[#D9A928]/10 text-[#D9A928] flex-shrink-0 group-hover:bg-[#D9A928] group-hover:text-black transition">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
