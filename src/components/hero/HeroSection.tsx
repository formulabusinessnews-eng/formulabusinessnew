import React, { useState } from 'react';
import { Play, Eye, Clock, Calendar, ArrowRight, Video } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { publishedNews } from '../../lib/newsStore';
import { NewsItem } from '../../types';

interface Props {
  onSelectNews: (news: NewsItem) => void;
}

export const HeroSection: React.FC<Props> = ({ onSelectNews }) => {
  const { t, news, videos, setIsLiveModalOpen } = useApp();

  // Primary featured video
  const heroVideo = videos.find(v => v.isHeroFeatured) || videos[0];
  const [isPlayingInline, setIsPlayingInline] = useState(false);

  // Right-hand editorial highlights
  const highlights = publishedNews(news).slice(0, 4);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: LARGE FEATURED VIDEO / MEDIA (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#061827] border border-[#D9A928]/30 rounded-2xl overflow-hidden shadow-2xl relative group">
          
          {/* Video Container */}
          <div className="relative aspect-video w-full bg-black overflow-hidden">
            {isPlayingInline && heroVideo ? (
              <iframe
                src={`${heroVideo.videoUrl}?autoplay=1`}
                title={heroVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src={heroVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80'}
                  alt={heroVideo?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#061827] via-black/40 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-[#D9A928] text-black font-extrabold text-xs uppercase px-3 py-1 rounded shadow-lg flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" />
                    {t.hero.featuredVideo}
                  </span>
                  <span className="bg-black/70 backdrop-blur-md text-gray-300 font-medium text-xs px-2.5 py-1 rounded border border-gray-700">
                    {heroVideo?.duration}
                  </span>
                </div>

                {/* Big Center Play Button */}
                <button
                  onClick={() => setIsPlayingInline(true)}
                  className="absolute inset-0 m-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#D9A928] hover:bg-[#F3C64B] text-black flex items-center justify-center shadow-[0_0_35px_rgba(217,169,40,0.6)] group-hover:scale-110 active:scale-95 transition"
                  aria-label={t.hero.watchNow}
                >
                  <Play className="w-7 h-7 md:w-9 md:h-9 fill-black ml-1" />
                </button>
              </>
            )}
          </div>

          {/* Video Metadata / Headline Info */}
          <div className="p-6 bg-[#061827]">
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
              <span className="text-[#D9A928] font-bold uppercase tracking-wider">
                {heroVideo?.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                {heroVideo?.views.toLocaleString('pt-BR')} {t.hero.views}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight hover:text-[#D9A928] transition cursor-pointer">
              {heroVideo?.title}
            </h1>

            <p className="text-sm text-gray-300 mt-2 line-clamp-2">
              {heroVideo?.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsPlayingInline(!isPlayingInline)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D9A928] to-[#F3C64B] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-[#D9A928]/20"
              >
                <Play className="w-4 h-4 fill-black" />
                {isPlayingInline ? 'Pausar Player' : t.hero.watchNow}
              </button>

              <button
                onClick={() => setIsLiveModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#0A2238] border border-red-500/30 text-red-400 hover:text-white hover:border-red-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                {t.nav.watchLive}
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: "DESTAQUES" EDITORIAL LIST (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#061827] border border-gray-800 rounded-2xl p-5 shadow-2xl">
          
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-4 bg-[#D9A928] rounded-sm" />
              {t.hero.highlights}
            </h2>
            <span className="text-xs text-[#D9A928] font-semibold cursor-pointer hover:underline">
              {t.latestNews.viewAll}
            </span>
          </div>

          {/* Cards List */}
          <div className="space-y-3.5 flex-1">
            {highlights.map((item, idx) => (
              <article
                key={item.id}
                onClick={() => onSelectNews(item)}
                className="group p-2.5 rounded-xl hover:bg-[#0A2238]/60 border border-transparent hover:border-[#D9A928]/30 transition cursor-pointer flex gap-3.5 items-center"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 sm:w-24 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden relative bg-black border border-gray-800">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-[#D9A928] font-bold px-1 rounded">
                    0{idx + 1}
                  </span>
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] text-[#D9A928] font-bold uppercase">
                    <span>{item.category}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 font-normal">
                      {new Date(item.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#D9A928] transition line-clamp-2 leading-snug mt-0.5">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                    <span>{item.author}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {item.readTime}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
