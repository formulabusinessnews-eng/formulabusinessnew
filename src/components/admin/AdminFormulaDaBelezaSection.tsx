import React, { useState } from 'react';
import {
  Tv,
  Plus,
  Star,
  Save,
  Play,
  Hash,
  Users,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FormulaDaBelezaVideoColumn } from '../../types';
import { ImageUrlField } from './ImageUrlField';

export const AdminFormulaDaBelezaSection: React.FC = () => {
  const {
    formulaDaBeleza,
    formulaVideosSyncError,
    updateFormulaDaBeleza,
    updateFormulaDaBelezaVideoColumn,
    setFeaturedFormulaDaBelezaVideo,
    addFormulaDaBelezaVideoColumn,
    formulaDaBelezaParticipations,
    updateFormulaDaBelezaParticipationStatus
  } = useApp();

  const [newColumn, setNewColumn] = useState({
    title: '',
    videoUrl: 'https://www.youtube.com/embed/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&auto=format&fit=crop&q=80',
    duration: '10:00'
  });

  const formatColumn = (n: number) => String(n).padStart(2, '0');

  const thumbnailSizeHint =
    'Arquivo: 1280 × 720 px (16:9), JPG ou PNG. No banner ela é recortada para 300 × 188 px no desktop e até 448 × 190 px no celular.';

  const handleAddColumn = () => {
    if (!newColumn.title.trim() || !newColumn.videoUrl.trim()) return;

    addFormulaDaBelezaVideoColumn({
      title: newColumn.title.trim(),
      videoUrl: newColumn.videoUrl.trim(),
      thumbnailUrl: newColumn.thumbnailUrl.trim(),
      duration: newColumn.duration.trim() || '00:00',
      active: true,
      featuredOnBanner: false
    });

    setNewColumn({
      title: '',
      videoUrl: 'https://www.youtube.com/embed/',
      thumbnailUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&auto=format&fit=crop&q=80',
      duration: '10:00'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl p-6 space-y-2">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Tv className="w-4 h-4 text-[#D9A928]" />
          Programa Fórmula da Beleza — Gestão do Banner & Vídeos
        </h3>
        <p className="text-xs text-gray-400">
          O link do YouTube fica na coluna <strong className="text-[#D9A928]">video_url</strong> da tabela{' '}
          <strong className="text-[#D9A928]">formula_da_beleza_videos</strong>. O botão “Usar no banner” só marca{' '}
          <strong className="text-[#D9A928]">featured_on_banner</strong>: ele não abre o YouTube. O vídeo toca ao clicar na imagem do banner na página inicial.
        </p>
        {formulaVideosSyncError && (
          <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            {formulaVideosSyncError}
          </p>
        )}
      </div>

      {/* Institutional copy */}
      <div className="bg-[#061827] border border-gray-800 rounded-2xl p-6 space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Textos do Banner</h4>
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-gray-400 block mb-1">Headline</label>
            <textarea
              rows={2}
              value={formulaDaBeleza.headline}
              onChange={e => updateFormulaDaBeleza({ headline: e.target.value })}
              className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-3 text-white focus:border-[#D9A928] outline-none"
            />
          </div>
          <div>
            <label className="text-gray-400 block mb-1">Sobre o programa (modal Conheça o Programa)</label>
            <textarea
              rows={4}
              value={formulaDaBeleza.aboutDescription}
              onChange={e => updateFormulaDaBeleza({ aboutDescription: e.target.value })}
              className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-3 text-white focus:border-[#D9A928] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Numbered video columns */}
      <div className="bg-[#061827] border border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#D9A928]" />
            Colunas de Vídeo Numeradas
          </h4>
          <span className="text-[10px] text-gray-400 font-mono">
            {formulaDaBeleza.videoColumns.length} coluna(s)
          </span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          A thumbnail é a mesma em todas as colunas: só muda qual delas fica no banner.
          Envie em <strong className="text-[#D9A928]">1280 × 720 px (16:9)</strong>.
          No site o recorte fica em <strong className="text-white">300 × 188 px</strong> no desktop
          e em até <strong className="text-white">448 × 190 px</strong> no celular.
        </p>

        <div className="space-y-4">
          {[...formulaDaBeleza.videoColumns]
            .sort((a, b) => a.columnNumber - b.columnNumber)
            .map((col: FormulaDaBelezaVideoColumn) => (
              <div
                key={col.id}
                className={`rounded-xl border p-4 space-y-3 ${
                  col.featuredOnBanner
                    ? 'border-[#D9A928]/60 bg-[#0A2238]/50'
                    : 'border-gray-800 bg-[#020B14]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#D9A928] text-black text-xs font-black tracking-wider">
                      COLUNA {formatColumn(col.columnNumber)}
                    </span>
                    {col.featuredOnBanner && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
                        <Star className="w-3 h-3" /> No banner
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-[11px] text-gray-300">
                      <input
                        type="checkbox"
                        checked={col.active}
                        onChange={e =>
                          updateFormulaDaBelezaVideoColumn(col.id, { active: e.target.checked })
                        }
                        className="accent-[#D9A928]"
                      />
                      Ativa
                    </label>
                    {!col.featuredOnBanner && (
                      <button
                        type="button"
                        onClick={() => setFeaturedFormulaDaBelezaVideo(col.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#D9A928] text-black text-[10px] font-bold uppercase flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" /> Usar no banner
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="md:col-span-2">
                    <label className="text-gray-400 block mb-1">Título</label>
                    <input
                      value={col.title}
                      onChange={e =>
                        updateFormulaDaBelezaVideoColumn(col.id, { title: e.target.value })
                      }
                      className="w-full bg-[#061827] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">URL do vídeo (link do YouTube)</label>
                    <input
                      value={col.videoUrl}
                      onChange={e =>
                        updateFormulaDaBelezaVideoColumn(col.id, { videoUrl: e.target.value })
                      }
                      className="w-full bg-[#061827] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] outline-none font-mono text-[11px]"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">URL da thumbnail</label>
                    <ImageUrlField
                      value={col.thumbnailUrl}
                      onChange={url =>
                        updateFormulaDaBelezaVideoColumn(col.id, { thumbnailUrl: url })
                      }
                      folder={`formula-da-beleza/coluna-${formatColumn(col.columnNumber)}`}
                      hint={thumbnailSizeHint}
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Duração</label>
                    <input
                      value={col.duration}
                      onChange={e =>
                        updateFormulaDaBelezaVideoColumn(col.id, { duration: e.target.value })
                      }
                      className="w-full bg-[#061827] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="w-full h-20 rounded-lg overflow-hidden border border-gray-700 bg-black">
                      <img
                        src={col.thumbnailUrl}
                        alt={`Prévia coluna ${formatColumn(col.columnNumber)}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Add new numbered column */}
        <div className="border border-dashed border-[#D9A928]/40 rounded-xl p-4 space-y-3">
          <h5 className="text-xs font-bold text-[#D9A928] uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Nova Coluna de Vídeo
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <input
              placeholder="Título do vídeo"
              value={newColumn.title}
              onChange={e => setNewColumn(prev => ({ ...prev, title: e.target.value }))}
              className="bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#D9A928]"
            />
            <input
              placeholder="https://www.youtube.com/embed/..."
              value={newColumn.videoUrl}
              onChange={e => setNewColumn(prev => ({ ...prev, videoUrl: e.target.value }))}
              className="bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#D9A928] font-mono"
            />
            <ImageUrlField
              value={newColumn.thumbnailUrl}
              onChange={url => setNewColumn(prev => ({ ...prev, thumbnailUrl: url }))}
              folder="formula-da-beleza/nova-coluna"
              placeholder="URL da thumbnail"
              hint={thumbnailSizeHint}
              inputClassName="bg-[#020B14]"
            />
            <input
              placeholder="Duração (ex: 12:40)"
              value={newColumn.duration}
              onChange={e => setNewColumn(prev => ({ ...prev, duration: e.target.value }))}
              className="bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#D9A928]"
            />
          </div>
          <button
            type="button"
            onClick={handleAddColumn}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D9A928] text-black text-xs font-bold"
          >
            <Save className="w-3.5 h-3.5" /> Adicionar Coluna Numerada
          </button>
        </div>
      </div>

      {/* Participation requests */}
      <div className="bg-[#061827] border border-gray-800 rounded-2xl p-6 space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-[#D9A928]" />
          Solicitações — Quero Participar
        </h4>

        {formulaDaBelezaParticipations.length === 0 ? (
          <p className="text-xs text-gray-400">Nenhuma solicitação recebida ainda.</p>
        ) : (
          <div className="space-y-2">
            {formulaDaBelezaParticipations.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#020B14] border border-gray-800 text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <strong className="text-white">{item.name}</strong>
                    <span className="text-gray-400 ml-2">{item.email}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#D9A928]/15 text-[#D9A928] font-bold uppercase text-[10px]">
                    {item.participationType}
                  </span>
                </div>
                <p className="text-gray-300">{item.message}</p>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-800">
                  <span className="text-gray-500">
                    {item.phone}
                    {item.company ? ` • ${item.company}` : ''}
                  </span>
                  <select
                    value={item.status}
                    onChange={e =>
                      updateFormulaDaBelezaParticipationStatus(
                        item.id,
                        e.target.value as typeof item.status
                      )
                    }
                    className="bg-[#061827] border border-gray-700 rounded-lg px-2 py-1 text-[11px] text-white"
                  >
                    <option value="NEW">Nova</option>
                    <option value="CONTACTED">Contatado</option>
                    <option value="SCHEDULED">Agendado</option>
                    <option value="ARCHIVED">Arquivado</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        Alterações são salvas automaticamente no navegador (localStorage).
      </div>
    </div>
  );
};
