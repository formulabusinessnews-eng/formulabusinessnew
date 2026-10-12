import React from 'react';
import { X, Clock, Calendar, Share2, Tag, Bookmark, ArrowLeft } from 'lucide-react';
import { NewsItem } from '../../types';
import { AdBannerSlot } from '../ads/AdBannerSlot';

interface Props {
  news: NewsItem | null;
  onClose: () => void;
}

export const NewsDetailModal: React.FC<Props> = ({ news, onClose }) => {
  if (!news) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="p-4 bg-[#020B14] border-b border-gray-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-gray-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Portal</span>
          </button>

          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Article Body */}
        <div className="overflow-y-auto p-6 md:p-10 space-y-6 text-white">
          
          {/* Category & Date */}
          <div className="flex items-center gap-3 text-xs">
            <span className="bg-[#D9A928] text-black font-extrabold uppercase px-3 py-0.5 rounded text-[11px]">
              {news.category}
            </span>
            <span className="text-gray-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(news.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
            <span className="text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {news.readTime}
            </span>
          </div>

          {/* Title & Excerpt */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
            {news.title}
          </h1>

          <p className="text-base text-gray-300 font-medium leading-relaxed border-l-2 border-[#D9A928] pl-4">
            {news.excerpt}
          </p>

          {/* Author */}
          <div className="flex items-center gap-3 pt-2 text-xs text-gray-400 border-b border-gray-800 pb-4">
            <span>Por <strong className="text-white font-bold">{news.author}</strong></span>
            <span>•</span>
            <span>Fórmula Business News Editorial</span>
          </div>

          {/* Main Feature Image */}
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-800 max-h-[460px]">
            <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
          </div>

          {/* Article Text Content */}
          <div className="text-sm md:text-base text-gray-300 leading-loose space-y-4">
            {news.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Sponsored Ad placement within news */}
          <div className="my-8">
            <AdBannerSlot position="BETWEEN_NEWS" />
          </div>

          {/* Tags */}
          <div className="pt-4 border-t border-gray-800 flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-[#D9A928]" />
            {news.tags.map((tag, idx) => (
              <span key={idx} className="bg-[#020B14] border border-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
