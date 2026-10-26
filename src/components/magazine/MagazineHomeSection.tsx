import React, { useState } from 'react';
import { BookOpen, Sparkles, Download, Eye, BarChart3, Share2, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MagazineIssue } from '../../types';
import { ReadershipReportModal } from './ReadershipReportModal';
import { toDisplayDate } from '../../lib/publishDate';
import { magazineIssueUrl } from '../../lib/magazinePath';

export const MagazineHomeSection: React.FC = () => {
  const { t, magazineIssues, openMagazineReader, recordMagazineDownload } = useApp();
  const [selectedIssueForReport, setSelectedIssueForReport] = useState<MagazineIssue | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const featuredIssue = magazineIssues.find(m => m.featured) || magazineIssues[0];
  const otherIssues = magazineIssues.filter(m => m.id !== featuredIssue?.id);

  const handleCopyLink = (issue: MagazineIssue, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = magazineIssueUrl(issue.issueNumber);
    navigator.clipboard.writeText(link);
    setCopiedId(issue.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleDownload = (issue: MagazineIssue, e: React.MouseEvent) => {
    e.stopPropagation();
    recordMagazineDownload(issue.id);
    if (issue.pdfUrl) {
      window.open(issue.pdfUrl, '_blank');
    }
  };

  if (!featuredIssue) return null;

  return (
    <section id="revista" className="w-full bg-gradient-to-b from-[#020B14] via-[#051422] to-[#020B14] py-16 border-y border-[#D9A928]/20 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#D9A928]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Section Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D9A928]/10 border border-[#D9A928]/30 text-[#D9A928] text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {t.magazine.badge}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white font-heading">
            {t.magazine.title}
          </h2>
          <p className="text-sm md:text-base text-gray-300 mt-2">
            {t.magazine.subtitle}
          </p>
        </div>

        {/* FEATURED EDITION HERO SPREAD */}
        <div className="bg-[#061827]/90 border border-[#D9A928]/40 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          
          {/* Cover with 3D Book Spine Effect */}
          <div className="w-full max-w-[320px] sm:max-w-[360px] flex-shrink-0 relative group cursor-pointer" onClick={() => openMagazineReader(featuredIssue.id)}>
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(217,169,40,0.25)] border-2 border-[#D9A928]/40 transform group-hover:-translate-y-2 group-hover:scale-[1.02] transition duration-500 bg-black aspect-[3/4]">
              <img 
                src={featuredIssue.coverImageUrl} 
                alt={featuredIssue.title}
                className="w-full h-full object-cover"
              />

              {/* Physical Book Crease / Gloss Overlay */}
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* 3D Page Flip Badge */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-center">
                <span className="bg-[#D9A928] text-black font-extrabold text-xs uppercase px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 group-hover:bg-[#F3C64B] transition">
                  <BookOpen className="w-4 h-4" />
                  {t.magazine.readEdition}
                </span>
              </div>
            </div>
          </div>

          {/* Issue Meta & Highlights */}
          <div className="flex-1 flex flex-col justify-between text-left">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#D9A928] bg-[#D9A928]/10 px-3 py-1 rounded-full border border-[#D9A928]/30">
                  {t.magazine.edition} #{featuredIssue.issueNumber}
                </span>
                <span className="text-xs text-gray-400">
                  • {t.magazine.publishedIn} {toDisplayDate(featuredIssue.publishDate)}
                </span>
                <span className="text-xs text-gray-400">
                  • {featuredIssue.pagesCount} {t.magazine.pages}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {featuredIssue.title}
              </h3>
              
              <h4 className="text-base font-semibold text-[#D9A928] mt-1">
                {featuredIssue.subtitle}
              </h4>

              <p className="text-sm text-gray-300 mt-4 leading-relaxed">
                {featuredIssue.description}
              </p>

              {/* Advertisers featured in this edition */}
              {featuredIssue.clientAdvertisersFeatured.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <span className="text-xs uppercase font-semibold text-gray-400 block mb-2">
                    {t.magazine.topAdvertisers}:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {featuredIssue.clientAdvertisersFeatured.map((brand, idx) => (
                      <span
                        key={idx}
                        className="bg-[#020B14] border border-[#D9A928]/30 text-white text-xs px-3 py-1 rounded-lg font-medium"
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openMagazineReader(featuredIssue.id)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D9A928] to-[#F3C64B] text-black font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-[#D9A928]/25 hover:scale-105 active:scale-95 transition"
              >
                <BookOpen className="w-5 h-5 fill-black" />
                {t.magazine.readEdition}
              </button>

              {featuredIssue.downloadAllowed && (
                <button
                  onClick={(e) => handleDownload(featuredIssue, e)}
                  className="px-5 py-3 rounded-xl bg-[#0A2238] border border-gray-700 hover:border-gray-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4 text-[#D9A928]" />
                  {t.magazine.downloadPdf}
                </button>
              )}

              {/* View Readership Stats */}
              <button
                onClick={() => setSelectedIssueForReport(featuredIssue)}
                className="px-4 py-3 rounded-xl bg-[#0A2238] border border-[#D9A928]/30 text-[#D9A928] hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition"
              >
                <BarChart3 className="w-4 h-4" />
                {t.magazine.readershipReport}
              </button>

              {/* Client Access Link */}
              <button
                onClick={(e) => handleCopyLink(featuredIssue, e)}
                className="px-4 py-3 rounded-xl bg-[#0A2238] border border-gray-800 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition"
                title={t.magazine.clientLink}
              >
                {copiedId === featuredIssue.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-[#D9A928]" />}
                <span>{copiedId === featuredIssue.id ? t.magazine.linkCopied : t.magazine.clientLink}</span>
              </button>
            </div>

          </div>
        </div>

        {/* PREVIOUS EDITIONS CAROUSEL / GRID */}
        {otherIssues.length > 0 && (
          <div className="mt-14">
            <h4 className="text-base font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-4 bg-[#D9A928] rounded-sm" />
              Edições Anteriores da Revista
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => openMagazineReader(issue.id)}
                  className="bg-[#061827] border border-gray-800 hover:border-[#D9A928]/50 rounded-2xl p-4 flex gap-4 transition group cursor-pointer"
                >
                  <div className="w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-black border border-[#D9A928]/30 relative shadow">
                    <img src={issue.coverImageUrl} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[#D9A928] text-[9px] font-bold px-1 rounded">
                      #{issue.issueNumber}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#D9A928]">
                        {toDisplayDate(issue.publishDate)}
                      </span>
                      <h5 className="text-sm font-bold text-white group-hover:text-[#D9A928] transition line-clamp-2 mt-0.5">
                        {issue.title}
                      </h5>
                      {issue.clientAdvertisersFeatured.length > 0 && (
                        <span className="text-[11px] text-gray-300 mt-1 block line-clamp-2">
                          {issue.clientAdvertisersFeatured.join(' · ')}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 mt-1 block">
                        {issue.pagesCount} páginas
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-800 text-xs">
                      <span className="text-[#D9A928] font-bold flex items-center gap-1">
                        Folhear 3D <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Readership Report Modal */}
      {selectedIssueForReport && (
        <ReadershipReportModal
          issue={selectedIssueForReport}
          onClose={() => setSelectedIssueForReport(null)}
        />
      )}
    </section>
  );
};
