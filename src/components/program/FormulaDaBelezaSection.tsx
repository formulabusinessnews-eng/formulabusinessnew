import React, { useMemo, useState } from 'react';
import { Play, X, Sparkles, CheckCircle2, Mic2, Building2, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FormulaDaBelezaParticipationType } from '../../types';

type ModalView = 'none' | 'video' | 'about' | 'participate' | 'participate-success';

const participationOptions: { value: FormulaDaBelezaParticipationType; label: string }[] = [
  { value: 'CONVIDADO', label: 'Quero ser convidado(a) do programa' },
  { value: 'MARCA', label: 'Quero apresentar minha marca' },
  { value: 'PATROCINADOR', label: 'Quero patrocinar o programa' },
  { value: 'OUTRO', label: 'Outra oportunidade' }
];

export const FormulaDaBelezaSection: React.FC = () => {
  const {
    formulaDaBeleza,
    submitFormulaDaBelezaParticipation,
    siteSettings
  } = useApp();

  const [modal, setModal] = useState<ModalView>('none');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    participationType: 'CONVIDADO' as FormulaDaBelezaParticipationType,
    message: ''
  });

  const featuredVideo = useMemo(() => {
    return (
      formulaDaBeleza.videoColumns.find(col => col.featuredOnBanner && col.active) ||
      formulaDaBeleza.videoColumns.find(col => col.active) ||
      formulaDaBeleza.videoColumns[0]
    );
  }, [formulaDaBeleza.videoColumns]);

  const closeModal = () => setModal('none');

  const handleParticipateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.message.trim()) {
      return;
    }

    submitFormulaDaBelezaParticipation({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim() || undefined,
      participationType: form.participationType,
      message: form.message.trim()
    });

    setForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      participationType: 'CONVIDADO',
      message: ''
    });
    setModal('participate-success');
  };

  return (
    <>
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2">
        <div className="relative bg-[#070d16] border-y border-[#c9a227]/80 overflow-hidden">
          {/* —— MOBILE / TABLET —— */}
          <div className="lg:hidden flex flex-col items-center px-3 sm:px-5 pt-3 pb-4">
            {/* Antônio + logo: relação próxima (como aprovado) */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={formulaDaBeleza.hostImageUrl}
                  alt="Antônio Porto — Programa Fórmula da Beleza"
                  className="relative z-10 h-[220px] sm:h-[260px] md:h-[280px] w-auto object-contain object-bottom"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[1px] z-0 w-[62%] h-[14px]"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 42%, transparent 72%)'
                  }}
                />
              </div>
              <img
                src={formulaDaBeleza.logoUrl}
                alt="Programa Fórmula da Beleza"
                className="relative z-10 -mt-1 h-[100px] sm:h-[118px] md:h-[128px] w-auto object-contain"
              />
            </div>

            {/* Demais blocos com leve respiro */}
            <div className="mt-5 sm:mt-6 w-full max-w-xl text-center px-1">
              <h2 className="text-[13px] sm:text-[15px] md:text-base font-extrabold uppercase tracking-wide text-white leading-snug">
                {formulaDaBeleza.headline}
              </h2>
              <div className="mt-3 sm:mt-3.5 space-y-1 text-[10px] sm:text-[11px] tracking-[0.14em] text-gray-200 uppercase font-semibold">
                {formulaDaBeleza.topics.map(topic => (
                  <p key={topic}>{topic}</p>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => featuredVideo && setModal('video')}
              className="mt-5 sm:mt-6 w-full max-w-md overflow-hidden rounded-sm border border-[#c9a227]/25"
              aria-label={
                featuredVideo
                  ? `Assistir coluna ${String(featuredVideo.columnNumber).padStart(2, '0')}`
                  : 'Assistir'
              }
            >
              <img
                src={featuredVideo?.thumbnailUrl}
                alt={featuredVideo?.title || 'Programa Fórmula da Beleza'}
                className="w-full h-[150px] sm:h-[170px] md:h-[190px] object-cover"
              />
            </button>

            {/* 3 botões sempre visíveis: empilhados no mobile, lado a lado no tablet */}
            <div className="mt-5 sm:mt-6 w-full max-w-xl grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setModal('video')}
                className="inline-flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-md bg-gradient-to-b from-[#e8c56a] to-[#c9a227] text-black font-extrabold text-[11px] uppercase tracking-wide hover:brightness-110 transition"
              >
                <span className="w-5 h-5 rounded-full border border-black/30 flex items-center justify-center shrink-0">
                  <Play className="w-3 h-3 fill-black" />
                </span>
                Assista Agora
              </button>

              <button
                type="button"
                onClick={() => setModal('about')}
                className="inline-flex items-center justify-center w-full px-3 py-2.5 rounded-md border border-[#c9a227] text-[#e8c56a] font-bold text-[11px] uppercase tracking-wide hover:bg-[#c9a227]/10 transition"
              >
                Conheça o Programa
              </button>

              <button
                type="button"
                onClick={() => setModal('participate')}
                className="inline-flex items-center justify-center w-full px-3 py-2.5 rounded-md border border-[#c9a227] text-white font-bold text-[11px] uppercase tracking-wide hover:bg-[#c9a227]/10 hover:text-[#e8c56a] transition"
              >
                Quero Participar
              </button>
            </div>
          </div>

          {/* —— DESKTOP —— */}
          <div className="hidden lg:grid grid-cols-[auto_auto_minmax(0,1fr)_260px] xl:grid-cols-[auto_auto_minmax(0,1fr)_300px] grid-rows-[1fr_auto] items-center gap-x-4 px-3 pt-2">
            <div className="row-span-2 flex justify-start self-end">
              <div className="relative">
                <img
                  src={formulaDaBeleza.hostImageUrl}
                  alt="Antônio Porto — Programa Fórmula da Beleza"
                  className="relative z-10 h-[310px] w-auto max-w-none object-contain object-bottom"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[1px] z-0 w-[62%] h-[14px]"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 42%, transparent 72%)'
                  }}
                />
              </div>
            </div>

            <div className="flex justify-start self-center pb-10">
              <img
                src={formulaDaBeleza.logoUrl}
                alt="Programa Fórmula da Beleza"
                className="h-[148px] w-auto object-contain"
              />
            </div>

            <div className="text-left self-center pb-8 px-1 min-w-0">
              <h2 className="text-[17px] font-extrabold uppercase tracking-wide text-white leading-snug">
                {formulaDaBeleza.headline}
              </h2>
              <div className="mt-2.5 space-y-0.5 text-[11px] tracking-[0.14em] text-gray-200 uppercase font-semibold">
                {formulaDaBeleza.topics.map(topic => (
                  <p key={topic}>{topic}</p>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => featuredVideo && setModal('video')}
              className="row-span-2 self-center mr-2 mb-3 overflow-hidden rounded-sm border border-[#c9a227]/25"
              aria-label={
                featuredVideo
                  ? `Assistir coluna ${String(featuredVideo.columnNumber).padStart(2, '0')}`
                  : 'Assistir'
              }
            >
              <img
                src={featuredVideo?.thumbnailUrl}
                alt={featuredVideo?.title || 'Programa Fórmula da Beleza'}
                className="w-full h-[188px] object-cover"
              />
            </button>

            <div className="col-start-3 flex flex-row flex-nowrap items-center justify-start gap-2 pb-3.5 pt-1">
              <button
                type="button"
                onClick={() => setModal('video')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gradient-to-b from-[#e8c56a] to-[#c9a227] text-black font-extrabold text-[11px] uppercase tracking-wide hover:brightness-110 transition whitespace-nowrap"
              >
                <span className="w-5 h-5 rounded-full border border-black/30 flex items-center justify-center">
                  <Play className="w-3 h-3 fill-black" />
                </span>
                Assista Agora
              </button>

              <button
                type="button"
                onClick={() => setModal('about')}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-[#c9a227] text-[#e8c56a] font-bold text-[11px] uppercase tracking-wide hover:bg-[#c9a227]/10 transition whitespace-nowrap"
              >
                Conheça o Programa
              </button>

              <button
                type="button"
                onClick={() => setModal('participate')}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-[#c9a227] text-white font-bold text-[11px] uppercase tracking-wide hover:bg-[#c9a227]/10 hover:text-[#e8c56a] transition whitespace-nowrap"
              >
                Quero Participar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO MODAL */}
      {modal === 'video' && featuredVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#020B14] border-b border-gray-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-black tracking-widest text-[#D9A928] uppercase">
                  Coluna {String(featuredVideo.columnNumber).padStart(2, '0')}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {featuredVideo.title}
                </h3>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`${featuredVideo.videoUrl}?autoplay=1`}
                title={featuredVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* ABOUT MODAL */}
      {modal === 'about' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#020B14] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D9A928]" />
                <h3 className="text-sm sm:text-base font-bold text-white">Conheça o Programa</h3>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={formulaDaBeleza.logoUrl}
                  alt="Logo do programa"
                  className="h-20 w-auto object-contain"
                />
                <div>
                  <h4 className="text-lg font-bold text-white">{formulaDaBeleza.aboutTitle}</h4>
                  <p className="text-xs text-[#D9A928] font-semibold uppercase tracking-wider mt-1">
                    Com Antônio Porto na TV
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                {formulaDaBeleza.aboutDescription}
              </p>

              <ul className="space-y-2">
                {formulaDaBeleza.aboutHighlights.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-[#D9A928] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModal('video')}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#D9A928] text-black font-bold text-xs uppercase"
                >
                  Assista Agora
                </button>
                <button
                  type="button"
                  onClick={() => setModal('participate')}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#D9A928] text-[#D9A928] font-bold text-xs uppercase"
                >
                  Quero Participar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PARTICIPATE MODAL */}
      {(modal === 'participate' || modal === 'participate-success') && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#020B14] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-[#D9A928]" />
                <h3 className="text-sm sm:text-base font-bold text-white">Quero Participar</h3>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {modal === 'participate-success' ? (
              <div className="p-8 text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold text-white">Solicitação enviada!</h4>
                <p className="text-sm text-gray-300">
                  Nossa equipe comercial entrará em contato em breve pelo e-mail ou telefone informados.
                  Contato direto: {siteSettings.contactEmail}
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-lg bg-[#D9A928] text-black font-bold text-xs uppercase"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleParticipateSubmit} className="p-5 sm:p-6 space-y-3 text-xs">
                <p className="text-sm text-gray-300">
                  Candidate-se como convidado, marque sua marca no programa ou fale sobre patrocínio.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 block mb-1">Nome completo *</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">E-mail *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Telefone / WhatsApp *</label>
                    <input
                      required
                      value={form.phone}
                      onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Empresa / Marca
                    </label>
                    <input
                      value={form.company}
                      onChange={e => setForm(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Tipo de participação *</label>
                  <select
                    value={form.participationType}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        participationType: e.target.value as FormulaDaBelezaParticipationType
                      }))
                    }
                    className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] outline-none"
                  >
                    {participationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Conte um pouco da sua história *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] outline-none resize-none"
                    placeholder="Ex.: Quero apresentar minha marca de estética no programa..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#D9A928] hover:bg-[#F3C64B] text-black font-extrabold text-xs uppercase tracking-wide transition"
                >
                  <Send className="w-4 h-4" />
                  Enviar Solicitação
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
