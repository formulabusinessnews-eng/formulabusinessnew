import React, { useEffect } from 'react';
import { Sparkles, ExternalLink, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdPosition } from '../../types';

interface Props {
  position: AdPosition;
  className?: string;
}

export const AdBannerSlot: React.FC<Props> = ({ position, className = '' }) => {
  const { 
    adCampaigns, 
    trackAdClick, 
    trackAdImpression, 
    setIsAdCheckoutOpen, 
    setPreselectedAdPosition 
  } = useApp();

  // Find active campaign for this slot
  const campaign = adCampaigns.find(c => c.position === position && c.status === 'ACTIVE');

  // Record impression on mount
  useEffect(() => {
    if (campaign) {
      trackAdImpression(campaign.id, position);
    }
  }, [campaign?.id, position]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (campaign) {
      const destUrl = trackAdClick(campaign.id);
      if (destUrl && destUrl !== '#') {
        window.open(destUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      // Open Checkout to buy this spot!
      setPreselectedAdPosition(position);
      setIsAdCheckoutOpen(true);
    }
  };

  if (campaign) {
    return (
      <div className={`relative group overflow-hidden rounded-xl border border-[#D9A928]/30 shadow-lg ${className}`}>
        {/* Ad Tag Badge */}
        <div className="absolute top-2 right-2 bg-black/85 text-[9px] uppercase tracking-wider text-[#D9A928] px-2 py-0.5 rounded font-mono border border-[#D9A928]/30 z-10 flex items-center gap-1 backdrop-blur-md">
          <span>Patrocinado</span>
          <ArrowUpRight className="w-2.5 h-2.5" />
        </div>

        <a 
          href={campaign.destinationUrl}
          onClick={handleClick}
          target="_blank"
          rel="noreferrer"
          className="block w-full h-full relative"
        >
          {/* Responsive images */}
          <picture>
            <source media="(max-width: 640px)" srcSet={campaign.creativeMobileUrl || campaign.creativeDesktopUrl} />
            <img 
              src={campaign.creativeDesktopUrl} 
              alt={campaign.campaignName} 
              className="w-full h-auto object-cover max-h-36 sm:max-h-48 group-hover:scale-[1.01] transition duration-300"
            />
          </picture>
        </a>
      </div>
    );
  }

  // Available Slot Placeholder with luxury Gold/Dark styling
  return (
    <div 
      onClick={handleClick}
      className={`cursor-pointer group relative overflow-hidden rounded-xl border border-dashed border-[#D9A928]/40 hover:border-[#D9A928] bg-gradient-to-r from-[#030e1a] via-[#061827] to-[#030e1a] p-4 text-center transition hover:shadow-[0_0_20px_rgba(217,169,40,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-3 text-left">
        <span className="p-2.5 rounded-lg bg-[#D9A928]/10 text-[#D9A928] border border-[#D9A928]/20 group-hover:scale-110 transition">
          <Sparkles className="w-4 h-4" />
        </span>
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#D9A928]">
            Espaço Comercial em Destaque • {position.replace('_', ' ')}
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#D9A928] transition">
            Sua Marca em Evidência no Portal Líder de Negócios
          </h4>
        </div>
      </div>

      <button className="px-3.5 py-1.5 rounded-lg bg-[#D9A928] group-hover:bg-[#F3C64B] text-black text-xs font-bold transition flex items-center gap-1 shadow flex-shrink-0">
        <span>Anuncie Aqui</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
