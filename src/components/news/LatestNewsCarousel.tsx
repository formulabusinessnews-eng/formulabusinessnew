import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Play, 
  Pause, 
  Flame 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { publishedNews } from '../../lib/newsStore';
import { NewsItem } from '../../types';

interface Props {
  onSelectNews: (news: NewsItem) => void;
}

export const LatestNewsCarousel: React.FC<Props> = ({ onSelectNews }) => {
  const { t, news } = useApp();
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate items array for seamless, infinite continuous ticker loop
  const visibleNews = publishedNews(news);
  const loopNews = visibleNews.length ? [...visibleNews, ...visibleNews] : [];

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 overflow-hidden">
      
      {/* Header with Title and Ticker Speed / Pause Controls */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6 pb-3 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-[#D9A928] text-xs font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D9A928] animate-pulse" />
            <span>MERCADO EM TEMPO REAL</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2 font-heading">
            {t.latestNews.title}
          </h2>
        </div>

        {/* Ticker Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition font-semibold ${
              isPaused 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                : 'bg-[#061827] text-[#D9A928] border-[#D9A928]/40 hover:bg-[#D9A928]/20'
            }`}
            title="Pausar ou Retomar Movimento do Letreiro"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden sm:inline">{isPaused ? 'Letreiro Pausado' : 'Movimento Lento Ativo'}</span>
          </button>
        </div>
      </div>

      {/* CONTINUOUS SLOW TICKER CAROUSEL TRACK ("se movam como letreiro bem lento") */}
      <div 
        className="w-full overflow-hidden relative py-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Soft edge gradient fades for luxury ticker feel */}
        <div className="absolute left-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-r from-[#020B14] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-l from-[#020B14] to-transparent z-10 pointer-events-none" />

        <div 
          className="flex items-stretch gap-4 sm:gap-5 animate-slow-marquee cursor-pointer"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {loopNews.map((item, idx) => (
            <article
              key={`${item.id}-${idx}`}
              onClick={() => onSelectNews(item)}
              className="w-[280px] sm:w-[320px] md:w-[350px] flex-shrink-0 bg-[#061827] border border-gray-800 hover:border-[#D9A928] rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_10px_30px_rgba(217,169,40,0.2)] transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image & Badges */}
                <div className="h-44 w-full relative overflow-hidden bg-black">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-[#020B14]/90 backdrop-blur-md text-[#D9A928] font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded border border-[#D9A928]/30">
                    {item.category}
                  </span>
                  <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-gray-300 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                    <Clock className="w-2.5 h-2.5 text-[#D9A928]" />
                    {item.readTime}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-4">
                  <div className="text-[11px] text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#D9A928]" />
                    <span>
                      {new Date(item.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-[#D9A928] transition line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.excerpt}
                  </p>
                </div>
              </div>

              {/* Author & Read Action Footer */}
              <div className="p-4 pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
                <span className="truncate max-w-[170px]">
                  {t.latestNews.by} <strong className="text-gray-200">{item.author}</strong>
                </span>
                <span className="text-[#D9A928] group-hover:translate-x-1 transition flex items-center gap-1 font-bold text-[11px]">
                  Ler Matéria <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="text-center mt-3 text-[11px] text-gray-500">
        💡 Toque ou passe o mouse sobre qualquer notícia para pausar e ler com calma.
      </div>
    </section>
  );
};
