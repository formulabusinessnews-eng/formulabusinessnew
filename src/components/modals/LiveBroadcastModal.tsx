import React from 'react';
import { X, Radio, Eye, Share2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LiveBroadcastModal: React.FC = () => {
  const { siteSettings, isLiveModalOpen, setIsLiveModalOpen, t } = useApp();

  if (!isLiveModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-[#020B14] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/40 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <Radio className="w-3.5 h-3.5" />
              {t.nav.live}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-lg">
              {siteSettings.liveTitle}
            </h3>
          </div>
          <button 
            onClick={() => setIsLiveModalOpen(false)}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Player */}
        <div className="aspect-video w-full bg-black">
          <iframe
            src={`${siteSettings.liveStreamUrl}?autoplay=1`}
            title={siteSettings.liveTitle}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#020B14] border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1 text-[#D9A928]">
            <Sparkles className="w-3.5 h-3.5" /> Transmissão oficial exclusiva Fórmula Business News
          </span>
          <button
            onClick={() => setIsLiveModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
