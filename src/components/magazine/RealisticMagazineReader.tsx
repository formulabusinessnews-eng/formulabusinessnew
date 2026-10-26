import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Download,
  Share2,
  BookOpen,
  Layers,
  Check,
} from 'lucide-react';
import { PageFlip } from 'page-flip/dist/js/page-flip.module.js';
import { useApp } from '../../context/AppContext';
import { MagazineIssue } from '../../types';
import { toDisplayDate } from '../../lib/publishDate';
import { magazineIssueUrl } from '../../lib/magazinePath';

interface Props {
  issue: MagazineIssue;
  onClose: () => void;
}

export const RealisticMagazineReader: React.FC<Props> = ({ issue, onClose }) => {
  const { t, recordMagazineRead, recordMagazineDownload } = useApp();

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [timeSpentOnPage, setTimeSpentOnPage] = useState(0);

  const shellRef = useRef<HTMLDivElement>(null);
  const bookHostRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  const lastFlipSoundAtRef = useRef(0);

  const sortedPages = useMemo(
    () => [...issue.pages].sort((a, b) => a.pageNumber - b.pageNumber),
    [issue.pages]
  );

  const pagesKey = useMemo(
    () =>
      sortedPages
        .map(
          (p) =>
            `${p.pageNumber}::${p.imageUrl}::${p.title || ''}::${p.description || ''}::${p.featuredAdvertiser || ''}`
        )
        .join('||'),
    [sortedPages]
  );

  const totalPages = pageCount || sortedPages.length || issue.pagesCount || 1;

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const playPageTurnSound = useCallback(() => {
    if (!soundEnabledRef.current) return;

    const nowMs = performance.now();
    if (nowMs - lastFlipSoundAtRef.current < 220) return;
    lastFlipSoundAtRef.current = nowMs;

    try {
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtor();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      const now = ctx.currentTime;

      const makePaper = (duration: number) => {
        const length = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let brown = 0;
        for (let i = 0; i < length; i++) {
          const white = Math.random() * 2 - 1;
          brown = brown * 0.96 + white * 0.04;
          data[i] = brown * 4.2;
        }
        return buffer;
      };

      const rustle = ctx.createBufferSource();
      rustle.buffer = makePaper(0.78);
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.Q.setValueAtTime(0.65, now);
      band.frequency.setValueAtTime(620, now);
      band.frequency.exponentialRampToValueAtTime(2600, now + 0.32);
      band.frequency.exponentialRampToValueAtTime(980, now + 0.7);
      const rustleGain = ctx.createGain();
      rustleGain.gain.setValueAtTime(0.0001, now);
      rustleGain.gain.exponentialRampToValueAtTime(0.2, now + 0.09);
      rustleGain.gain.setValueAtTime(0.16, now + 0.42);
      rustleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.76);
      rustle.connect(band);
      band.connect(rustleGain);
      rustleGain.connect(ctx.destination);
      rustle.start(now);
      rustle.stop(now + 0.78);

      const fiber = ctx.createBufferSource();
      fiber.buffer = makePaper(0.32);
      const high = ctx.createBiquadFilter();
      high.type = 'highpass';
      high.frequency.setValueAtTime(1600, now);
      const fiberGain = ctx.createGain();
      fiberGain.gain.setValueAtTime(0.0001, now + 0.04);
      fiberGain.gain.exponentialRampToValueAtTime(0.07, now + 0.14);
      fiberGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
      fiber.connect(high);
      high.connect(fiberGain);
      fiberGain.connect(ctx.destination);
      fiber.start(now + 0.04);
      fiber.stop(now + 0.36);

      const land = ctx.createOscillator();
      land.type = 'sine';
      land.frequency.setValueAtTime(96, now + 0.58);
      land.frequency.exponentialRampToValueAtTime(46, now + 0.78);
      const landGain = ctx.createGain();
      landGain.gain.setValueAtTime(0.0001, now + 0.56);
      landGain.gain.exponentialRampToValueAtTime(0.1, now + 0.6);
      landGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      land.connect(landGain);
      landGain.connect(ctx.destination);
      land.start(now + 0.56);
      land.stop(now + 0.82);
    } catch {
      // Audio may be blocked until user gesture
    }
  }, []);

  // StPageFlip: virada 3D com dobra real (estilo Heyzine)
  useEffect(() => {
    const host = bookHostRef.current;
    if (!host || !pagesKey) return;

    host.innerHTML = '';
    const mount = document.createElement('div');
    mount.className = 'magazine-flip-mount';
    host.appendChild(mount);

    const pages = sortedPages.filter((p) => Boolean(p.imageUrl));
    const pageNodes = pages.map((pageData, index) => {
      const page = document.createElement('div');
      page.className = 'magazine-flip-page';
      if (index === 0 || index === pages.length - 1) {
        page.dataset.density = 'hard';
      }

      const img = document.createElement('img');
      img.src = pageData.imageUrl;
      img.alt = pageData.title || `Página ${pageData.pageNumber}`;
      img.draggable = false;
      page.appendChild(img);

      if (pageData.title || pageData.description || pageData.featuredAdvertiser) {
        const overlay = document.createElement('div');
        overlay.className = 'magazine-page-copy';
        if (pageData.featuredAdvertiser) {
          const badge = document.createElement('span');
          badge.className = 'magazine-page-sponsor';
          badge.textContent = pageData.featuredAdvertiser;
          overlay.appendChild(badge);
        }
        if (pageData.title) {
          const title = document.createElement('h3');
          title.className = 'magazine-page-title';
          title.textContent = pageData.title;
          overlay.appendChild(title);
        }
        if (pageData.description) {
          const text = document.createElement('p');
          text.className = 'magazine-page-text';
          text.textContent = pageData.description;
          overlay.appendChild(text);
        }
        page.appendChild(overlay);
      }

      return page;
    });

    const pageFlip = new PageFlip(mount, {
      width: 480,
      height: 680,
      size: 'stretch',
      minWidth: 280,
      maxWidth: 560,
      minHeight: 400,
      maxHeight: 780,
      drawShadow: true,
      flippingTime: 900,
      usePortrait: true,
      startZIndex: 5,
      autoSize: true,
      maxShadowOpacity: 0.65,
      showCover: true,
      mobileScrollSupport: true,
      swipeDistance: 28,
      clickEventForward: true,
      useMouseEvents: true,
      showPageCorners: true,
      disableFlipByClick: false,
    });

    pageFlipRef.current = pageFlip;

    pageFlip.on('init', (e) => {
      const data = e.data as { page: number };
      setCurrentPageIndex(data.page ?? 0);
      setPageCount(pageFlip.getPageCount());
    });

    pageFlip.on('flip', (e) => {
      setCurrentPageIndex(Number(e.data) || 0);
      setIsFlipping(false);
    });

    pageFlip.on('changeState', (e) => {
      const state = String(e.data);
      if (state === 'flipping') {
        setIsFlipping(true);
        playPageTurnSound();
      } else if (state === 'user_fold') {
        setIsFlipping(true);
      } else if (state === 'read' || state === 'fold_corner') {
        setIsFlipping(false);
      }
    });

    pageFlip.loadFromHTML(pageNodes);

    return () => {
      pageFlipRef.current = null;
      try {
        pageFlip.destroy();
      } catch {
        // ignore teardown races
      }
      host.innerHTML = '';
    };
  }, [issue.id, pagesKey, playPageTurnSound, sortedPages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        pageFlipRef.current?.flipNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        pageFlipRef.current?.flipPrev();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          exitFullscreen();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  useEffect(() => {
    setTimeSpentOnPage(0);
    const timer = setInterval(() => {
      setTimeSpentOnPage((prev) => {
        const next = prev + 1;
        if (next === 10 || next === 30 || next === 60) {
          recordMagazineRead(issue.id, currentPageIndex + 1, next);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPageIndex, issue.id, recordMagazineRead]);

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      shellRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      exitFullscreen();
    }
  };

  const handleCopyClientLink = () => {
    const link = magazineIssueUrl(issue.issueNumber);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleDownload = () => {
    recordMagazineDownload(issue.id);
    if (issue.pdfUrl) {
      window.open(issue.pdfUrl, '_blank');
    }
  };

  const goToPage = (pageIndex: number) => {
    const flip = pageFlipRef.current;
    if (!flip) return;
    const clamped = Math.max(0, Math.min(totalPages - 1, pageIndex));
    const current = flip.getCurrentPageIndex();
    if (clamped === current) return;
    playPageTurnSound();
    // flip() anima só 1 spread de distância; turnToPage cobre saltos longos (miniaturas/slider)
    if (Math.abs(clamped - current) <= 2) {
      flip.flip(clamped);
    } else {
      flip.turnToPage(clamped);
      setCurrentPageIndex(clamped);
    }
  };

  const pageLabel =
    currentPageIndex === 0
      ? '1'
      : `${currentPageIndex + 1}${
          currentPageIndex + 1 < totalPages ? `-${Math.min(totalPages, currentPageIndex + 2)}` : ''
        }`;

  return (
    <div
      ref={shellRef}
      className="fixed inset-0 z-50 bg-[#020B14]/95 backdrop-blur-xl flex flex-col select-none overflow-hidden"
    >
      <header className="min-h-14 border-b border-[#D9A928]/20 bg-[#061827]/90 px-3 md:px-8 py-2 flex items-center gap-2 text-white z-20">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="hidden sm:inline-flex p-2 rounded bg-[#D9A928]/10 text-[#D9A928] border border-[#D9A928]/30 shrink-0">
            <BookOpen className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider text-[#D9A928] font-bold truncate">
                {t.magazine.edition} #{issue.issueNumber}
              </span>
              <span className="hidden sm:inline text-xs text-gray-400 shrink-0">• {toDisplayDate(issue.publishDate)}</span>
            </div>
            <h2 className="text-sm md:text-base font-semibold text-white truncate">
              {issue.title}
            </h2>
            {issue.clientAdvertisersFeatured.length > 0 && (
              <p className="hidden sm:block text-[10px] text-[#D9A928] truncate">
                {issue.clientAdvertisersFeatured.join(' · ')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 max-w-[42vw] sm:max-w-none">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition shrink-0 ${
              soundEnabled ? 'text-[#D9A928] bg-[#D9A928]/10' : 'text-gray-400 hover:text-white'
            }`}
            title={t.magazine.flipSound}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden lg:inline">{t.magazine.flipSound}</span>
          </button>

          <button
            onClick={handleCopyClientLink}
            className="p-2 rounded-lg text-xs bg-[#0A2238] border border-[#D9A928]/30 hover:border-[#D9A928] text-white flex items-center gap-1.5 transition shrink-0"
            title={t.magazine.clientLink}
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4 text-[#D9A928]" />
            )}
            <span className="hidden md:inline">
              {copiedLink ? t.magazine.linkCopied : t.magazine.clientLink}
            </span>
          </button>

          {issue.downloadAllowed && (
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg text-xs bg-[#0A2238] border border-gray-700 hover:border-gray-500 text-white flex items-center gap-1.5 transition shrink-0"
              title={t.magazine.downloadPdf}
            >
              <Download className="w-4 h-4 text-[#D9A928]" />
              <span className="hidden md:inline">{t.magazine.downloadPdf}</span>
            </button>
          )}

          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-2 rounded-lg text-xs transition shrink-0 ${
              showThumbnails
                ? 'bg-[#D9A928] text-black font-semibold'
                : 'text-gray-300 hover:text-white bg-[#0A2238]'
            }`}
            title="Ver Todas as Páginas"
          >
            <Layers className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center bg-[#0A2238] rounded-lg border border-gray-800 p-0.5">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(0.8, prev - 0.15))}
              className="p-1.5 hover:text-[#D9A928] text-gray-300 transition"
              title={t.magazine.zoomOut}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 text-gray-400 font-mono">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(1.5, prev + 0.15))}
              className="p-1.5 hover:text-[#D9A928] text-gray-300 transition"
              title={t.magazine.zoomIn}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-gray-300 hover:text-white bg-[#0A2238] transition shrink-0"
            title={isFullscreen ? t.magazine.exitFullscreen : t.magazine.fullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition shrink-0"
            title={t.magazine.closeReader}
            aria-label={t.magazine.closeReader}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-hidden magazine-stage">
        <button
          onClick={() => pageFlipRef.current?.flipPrev()}
          disabled={currentPageIndex <= 0 || isFlipping}
          className={`absolute left-4 md:left-8 z-30 p-3 md:p-4 rounded-full bg-[#061827]/80 hover:bg-[#D9A928] text-white hover:text-black border border-[#D9A928]/40 shadow-2xl transition duration-200 backdrop-blur-md ${
            currentPageIndex <= 0
              ? 'opacity-20 cursor-not-allowed pointer-events-none'
              : 'hover:scale-110 active:scale-95'
          }`}
          aria-label={t.magazine.prevPage}
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        <div
          className="relative w-full max-w-[1100px] h-full max-h-[780px] transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <div className="magazine-book-frame absolute inset-0 pointer-events-none" />
          <div ref={bookHostRef} className="magazine-book-host w-full h-full" />
        </div>

        <button
          onClick={() => pageFlipRef.current?.flipNext()}
          disabled={currentPageIndex >= totalPages - 1 || isFlipping}
          className={`absolute right-4 md:right-8 z-30 p-3 md:p-4 rounded-full bg-[#061827]/80 hover:bg-[#D9A928] text-white hover:text-black border border-[#D9A928]/40 shadow-2xl transition duration-200 backdrop-blur-md ${
            currentPageIndex >= totalPages - 1
              ? 'opacity-20 cursor-not-allowed pointer-events-none'
              : 'hover:scale-110 active:scale-95'
          }`}
          aria-label={t.magazine.nextPage}
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </main>

      {showThumbnails && (
        <div className="h-28 bg-[#061827] border-t border-[#D9A928]/20 p-2 overflow-x-auto flex items-center gap-3 z-30">
          {sortedPages.map((p, idx) => (
            <button
              key={p.pageNumber}
              onClick={() => goToPage(idx)}
              className={`relative h-20 w-16 flex-shrink-0 rounded border-2 transition overflow-hidden ${
                currentPageIndex === idx ||
                (currentPageIndex > 0 && currentPageIndex + 1 === idx)
                  ? 'border-[#D9A928] scale-105 shadow-md shadow-[#D9A928]/40'
                  : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-500'
              }`}
            >
              <img
                src={p.imageUrl}
                alt={`Página ${p.pageNumber}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[10px] text-center text-[#D9A928] font-bold">
                {p.pageNumber}
              </span>
            </button>
          ))}
        </div>
      )}

      <footer className="h-12 border-t border-[#D9A928]/20 bg-[#061827]/90 px-4 md:px-8 flex items-center justify-between text-xs text-gray-300 z-20">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[#D9A928]">
            {t.magazine.page} {pageLabel} {t.magazine.of} {totalPages}
          </span>
          <span className="hidden md:inline text-gray-400">
            • Tempo de leitura ativa: {timeSpentOnPage}s
          </span>
        </div>

        <div className="flex items-center gap-3 max-w-xs w-full px-2">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalPages - 1)}
            value={currentPageIndex}
            onChange={(e) => goToPage(parseInt(e.target.value, 10))}
            className="w-full accent-[#D9A928] h-1.5 bg-gray-700 rounded-lg cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 hidden sm:inline">
            Dica: arraste o canto da página ou use as setas
          </span>
        </div>
      </footer>
    </div>
  );
};
