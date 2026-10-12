import React from 'react';
import { Flame, Bell, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BreakingNewsTicker: React.FC = () => {
  const { t, tickerItems } = useApp();

  const activeItems = tickerItems.filter(item => item.active);

  if (activeItems.length === 0) return null;

  return (
    <div className="w-full bg-[#030e1a] border-y border-[#D9A928]/30 overflow-hidden relative shadow-md">
      <div className="max-w-7xl mx-auto flex items-stretch">
        
        {/* Urgent Badge on Left */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#D9A928] to-[#B8860B] text-black font-extrabold px-3 sm:px-5 py-2 flex items-center gap-1.5 text-xs tracking-wider uppercase z-10 shadow-lg">
          <Flame className="w-4 h-4 animate-bounce text-black" />
          <span>{t.ticker.breaking}</span>
        </div>

        {/* Scrolling Ticker Track */}
        <div className="flex-1 overflow-hidden relative flex items-center py-2 bg-[#020B14]/80">
          <div className="animate-ticker flex items-center gap-12 text-xs md:text-sm text-gray-200 pl-4">
            {activeItems.concat(activeItems).map((item, idx) => (
              <a
                key={`${item.id}-${idx}`}
                href={item.link || '#noticias'}
                className="flex items-center gap-2 hover:text-[#D9A928] transition group cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-[#D9A928] flex-shrink-0 group-hover:scale-110 transition" />
                <span className="font-medium whitespace-nowrap">
                  {item.text}
                </span>
                <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-[#D9A928] group-hover:translate-x-0.5 transition" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
