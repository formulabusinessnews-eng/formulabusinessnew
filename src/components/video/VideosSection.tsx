import React from 'react';
import { Play, Video, Eye, Clock, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VideosSection: React.FC = () => {
  const { videos, setIsLiveModalOpen } = useApp();

  const shorts = videos.filter(v => v.isShort);
  const longVideos = videos.filter(v => !v.isShort);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-10">
      
      {/* 1. Shorts Carousel */}
      <div>
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800">
          <div>
            <span className="text-[10px] uppercase font-mono text-[#D9A928] font-bold tracking-widest block">
              Pílulas Rápidas de Conhecimento
            </span>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D9A928]" />
              Fórmula Shorts & Insights em 60s
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {shorts.map(item => (
            <div
              key={item.id}
              onClick={() => setIsLiveModalOpen(true)}
              className="bg-[#061827] border border-gray-800 hover:border-[#D9A928] rounded-2xl overflow-hidden group cursor-pointer shadow-lg transition duration-300 relative aspect-[9/16]"
            >
              <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                {item.columnNumber != null && (
                  <span className="bg-[#D9A928] text-black font-black text-[9px] uppercase px-2 py-0.5 rounded shadow tracking-wider">
                    COLUNA {String(item.columnNumber).padStart(2, '0')}
                  </span>
                )}
                <span className="bg-red-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded shadow ml-auto">
                  Short
                </span>
              </div>

              <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[#D9A928]/90 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
                <Play className="w-5 h-5 fill-black ml-0.5" />
              </div>

              <div className="absolute bottom-3 inset-x-3 text-left">
                <span className="text-[10px] text-[#D9A928] font-bold flex items-center gap-1 mb-1">
                  <Eye className="w-3 h-3" /> {item.views.toLocaleString('pt-BR')} views
                </span>
                <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Programas & Entrevistas */}
      <div>
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800">
          <div>
            <span className="text-[10px] uppercase font-mono text-[#D9A928] font-bold tracking-widest block">
              Programação Multimídia
            </span>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-[#38BDF8]" />
              Programas & Entrevistas de Alta Liderança
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {longVideos.map(vid => (
            <div
              key={vid.id}
              onClick={() => setIsLiveModalOpen(true)}
              className="bg-[#061827] border border-gray-800 hover:border-[#D9A928]/40 rounded-2xl overflow-hidden group cursor-pointer shadow-xl transition flex flex-col sm:flex-row gap-4 p-4"
            >
              <div className="w-full sm:w-48 h-32 flex-shrink-0 relative rounded-xl overflow-hidden bg-black">
                <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                {vid.columnNumber != null && (
                  <span className="absolute top-2 left-2 bg-[#D9A928] text-black text-[10px] font-black px-2 py-0.5 rounded tracking-wider">
                    COLUNA {String(vid.columnNumber).padStart(2, '0')}
                  </span>
                )}
                <span className="absolute bottom-2 right-2 bg-black/80 text-[10px] text-white px-2 py-0.5 rounded font-mono">
                  {vid.duration}
                </span>
                <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[#D9A928] text-black flex items-center justify-center opacity-85 group-hover:scale-110 transition shadow">
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#D9A928]">{vid.category}</span>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#D9A928] transition line-clamp-2 mt-1">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                    {vid.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-2">
                  <Eye className="w-3 h-3 text-gray-400" />
                  <span>{vid.views.toLocaleString('pt-BR')} visualizações</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
