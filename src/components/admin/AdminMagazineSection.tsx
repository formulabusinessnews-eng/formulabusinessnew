import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3, 
  Share2, 
  Eye, 
  Layers, 
  Check, 
  X, 
  Calendar, 
  Upload,
  Link2,
  Save
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MagazineIssue, MagazinePage } from '../../types';
import { ReadershipReportModal } from '../magazine/ReadershipReportModal';
import { ImageUrlField } from './ImageUrlField';
import { maskDate, toDisplayDate, toStoredDate } from '../../lib/publishDate';
import { magazineIssueUrl, prefersPublicMagazineLink } from '../../lib/magazinePath';

const emptyPageForm = {
  imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80',
  title: '',
  description: '',
  featuredAdvertiser: ''
};

export const AdminMagazineSection: React.FC = () => {
  const { 
    t, 
    magazineIssues, 
    addMagazineIssue, 
    updateMagazineIssue, 
    deleteMagazineIssue, 
    addPageToIssue,
    updatePageInIssue,
    removePageFromIssue,
    openMagazineReader 
  } = useApp();

  // Modals state
  const [selectedIssueForReport, setSelectedIssueForReport] = useState<MagazineIssue | null>(null);
  const [isNewEditionModalOpen, setIsNewEditionModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<MagazineIssue | null>(null);
  const [managingPagesIssueId, setManagingPagesIssueId] = useState<string | null>(null);
  const [copiedLinkIssueId, setCopiedLinkIssueId] = useState<string | null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState<number | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // New/Edit Edition Form State
  const [formData, setFormData] = useState({
    issueNumber: 43,
    title: '',
    subtitle: '',
    description: '',
    coverImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    publishDate: toDisplayDate(new Date().toISOString().split('T')[0]),
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT' | 'ARCHIVED',
    featured: false,
    downloadAllowed: true,
    clientAccessLink: '',
    clientAdvertisersFeatured: 'Banco Vanguardia, Apex Tech, BioEstética'
  });

  // Page management form state
  const [pageForm, setPageForm] = useState(emptyPageForm);

  const managingPagesIssue =
    managingPagesIssueId
      ? magazineIssues.find((issue) => issue.id === managingPagesIssueId) || null
      : null;

  useEffect(() => {
    if (!managingPagesIssueId) {
      setEditingPageNumber(null);
      setPageForm(emptyPageForm);
    }
  }, [managingPagesIssueId]);

  // Calculations for magazine KPIs
  const totalEditions = magazineIssues.length;
  const totalReaders = magazineIssues.reduce((sum, item) => sum + (item.analytics?.totalReaders || 0), 0);
  const totalPageviews = magazineIssues.reduce((sum, item) => sum + (item.analytics?.totalPageviews || 0), 0);
  const totalDownloads = magazineIssues.reduce((sum, item) => sum + (item.analytics?.downloadsCount || 0), 0);

  const handleOpenNewModal = () => {
    const nextNumber = Math.max(...magazineIssues.map(m => m.issueNumber), 42) + 1;
    setFormData({
      issueNumber: nextNumber,
      title: 'Título da Edição Especial',
      subtitle: 'Subtítulo Editorial e Tema do Mês',
      description: 'Análise detalhada sobre os principais movimentos do mercado, líderes executivos e tendências globais.',
      coverImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      publishDate: toDisplayDate(new Date().toISOString().split('T')[0]),
      status: 'PUBLISHED',
      featured: false,
      downloadAllowed: true,
      clientAccessLink: magazineIssueUrl(nextNumber),
      clientAdvertisersFeatured: 'Vanguardia Partners, Apex Corp'
    });
    setEditingIssue(null);
    setIsNewEditionModalOpen(true);
  };

  const handleOpenEditModal = (issue: MagazineIssue) => {
    setEditingIssue(issue);
    setFormData({
      issueNumber: issue.issueNumber,
      title: issue.title,
      subtitle: issue.subtitle,
      description: issue.description,
      coverImageUrl: issue.coverImageUrl,
      pdfUrl: issue.pdfUrl || '',
      publishDate: toDisplayDate(issue.publishDate),
      status: issue.status,
      featured: issue.featured,
      downloadAllowed: issue.downloadAllowed,
      clientAccessLink: prefersPublicMagazineLink(issue.clientAccessLink || '')
        ? magazineIssueUrl(issue.issueNumber)
        : issue.clientAccessLink || magazineIssueUrl(issue.issueNumber),
      clientAdvertisersFeatured: issue.clientAdvertisersFeatured.join(', ')
    });
    setIsNewEditionModalOpen(true);
  };

  const handleSaveEdition = (e: React.FormEvent) => {
    e.preventDefault();
    const publishDate = toStoredDate(formData.publishDate);
    if (!publishDate) {
      setDateError('Digite a data completa, no formato dd/mm/aaaa. Exemplo: 01/09/2026.');
      return;
    }
    setDateError(null);
    const advertisersArray = formData.clientAdvertisersFeatured
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const clientAccessLink = prefersPublicMagazineLink(formData.clientAccessLink)
      ? magazineIssueUrl(Number(formData.issueNumber))
      : formData.clientAccessLink.trim();

    if (editingIssue) {
      updateMagazineIssue(editingIssue.id, {
        issueNumber: Number(formData.issueNumber),
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        coverImageUrl: formData.coverImageUrl,
        pdfUrl: formData.pdfUrl,
        publishDate,
        status: formData.status,
        featured: formData.featured,
        downloadAllowed: formData.downloadAllowed,
        clientAccessLink,
        clientAdvertisersFeatured: advertisersArray
      });
      if (formData.coverImageUrl !== editingIssue.coverImageUrl) {
        updatePageInIssue(editingIssue.id, 1, { imageUrl: formData.coverImageUrl });
      }
    } else {
      const starterPages: MagazinePage[] = [
        {
          pageNumber: 1,
          imageUrl: formData.coverImageUrl,
          title: `Capa Edição #${formData.issueNumber}`,
          description: formData.title
        },
        {
          pageNumber: 2,
          imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80',
          title: 'Editorial do Conselho Executivo',
          description: 'Visão editorial para líderes corporativos.'
        },
        {
          pageNumber: 3,
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80',
          title: 'Sumário & Matéria Especial de Capa',
          description: 'Índice e destaques da edição.'
        },
        {
          pageNumber: 4,
          imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&auto=format&fit=crop&q=80',
          title: 'Negócios & Mercado Financeiro',
          description: 'Análise de mercado e oportunidades.',
          featuredAdvertiser: advertisersArray[0] || 'Patrocinador Master'
        }
      ];

      addMagazineIssue({
        issueNumber: Number(formData.issueNumber),
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        coverImageUrl: formData.coverImageUrl,
        pdfUrl: formData.pdfUrl,
        publishDate,
        pagesCount: starterPages.length,
        pages: starterPages,
        status: formData.status,
        featured: formData.featured,
        downloadAllowed: formData.downloadAllowed,
        clientAccessLink,
        clientAdvertisersFeatured: advertisersArray
      });
    }

    setIsNewEditionModalOpen(false);
  };

  const handleCopyLink = (issue: MagazineIssue) => {
    const link = magazineIssueUrl(issue.issueNumber);
    navigator.clipboard.writeText(link);
    setCopiedLinkIssueId(issue.id);
    setTimeout(() => setCopiedLinkIssueId(null), 3000);
  };

  const readImageFile = (file: File, onLoaded: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onLoaded(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPageForEdit = (page: MagazinePage) => {
    setEditingPageNumber(page.pageNumber);
    setPageForm({
      imageUrl: page.imageUrl,
      title: page.title || '',
      description: page.description || '',
      featuredAdvertiser: page.featuredAdvertiser || ''
    });
  };

  const handleCancelPageEdit = () => {
    setEditingPageNumber(null);
    setPageForm(emptyPageForm);
  };

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingPagesIssue) return;

    if (editingPageNumber != null) {
      updatePageInIssue(managingPagesIssue.id, editingPageNumber, {
        imageUrl: pageForm.imageUrl,
        title: pageForm.title.trim() || `Página ${editingPageNumber}`,
        description: pageForm.description.trim(),
        featuredAdvertiser: pageForm.featuredAdvertiser.trim()
      });
      setEditingPageNumber(null);
    } else {
      const nextPageNum = (managingPagesIssue.pages.length || 0) + 1;
      addPageToIssue(managingPagesIssue.id, {
        pageNumber: nextPageNum,
        imageUrl: pageForm.imageUrl,
        title: pageForm.title.trim() || `Página ${nextPageNum}`,
        description: pageForm.description.trim(),
        featuredAdvertiser: pageForm.featuredAdvertiser.trim()
      });
    }

    setPageForm({
      ...emptyPageForm,
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80'
    });
  };

  const handleDeletePage = (pageNumber: number) => {
    if (!managingPagesIssue) return;
    if (managingPagesIssue.pages.length <= 1) {
      alert('A edição precisa ter ao menos 1 página (capa).');
      return;
    }
    if (!confirm(`Excluir a página ${pageNumber}? As demais serão renumeradas.`)) return;
    removePageFromIssue(managingPagesIssue.id, pageNumber);
    if (editingPageNumber === pageNumber) {
      handleCancelPageEdit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#061827] border border-[#D9A928]/30 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2 text-[#D9A928] text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            Módulo Exclusivo da Revista Digital 3D
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {t.admin.magazineManager.title}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Gerenciamento completo das edições oficiais, visualizador 3D realista, links para clientes e relatórios analíticos de audiência.
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D9A928] to-[#F3C64B] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D9A928]/20 hover:scale-105 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          {t.admin.magazineManager.addNew}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0A2238] border border-gray-800 rounded-xl p-4">
          <span className="text-xs uppercase text-gray-400">Edições no Ar</span>
          <div className="text-2xl font-bold text-white mt-1">{totalEditions}</div>
          <span className="text-[11px] text-[#D9A928]">Formato 3D ativo</span>
        </div>

        <div className="bg-[#0A2238] border border-gray-800 rounded-xl p-4">
          <span className="text-xs uppercase text-gray-400">Total de Leitores Únicos</span>
          <div className="text-2xl font-bold text-white mt-1">{totalReaders.toLocaleString('pt-BR')}</div>
          <span className="text-[11px] text-emerald-400">Audiência verificada</span>
        </div>

        <div className="bg-[#0A2238] border border-gray-800 rounded-xl p-4">
          <span className="text-xs uppercase text-gray-400">Leituras de Páginas</span>
          <div className="text-2xl font-bold text-white mt-1">{totalPageviews.toLocaleString('pt-BR')}</div>
          <span className="text-[11px] text-gray-400">Folheadas no leitor 3D</span>
        </div>

        <div className="bg-[#0A2238] border border-gray-800 rounded-xl p-4">
          <span className="text-xs uppercase text-gray-400">Downloads em PDF</span>
          <div className="text-2xl font-bold text-white mt-1">{totalDownloads.toLocaleString('pt-BR')}</div>
          <span className="text-[11px] text-blue-400">Exemplares baixados</span>
        </div>
      </div>

      {/* Editions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {magazineIssues.map((issue) => (
          <div 
            key={issue.id}
            className="bg-[#061827] border border-gray-800 hover:border-[#D9A928]/50 rounded-2xl p-5 flex flex-col md:flex-row gap-5 transition group"
          >
            {/* Cover Preview */}
            <div className="w-full md:w-36 h-52 flex-shrink-0 relative rounded-xl overflow-hidden shadow-lg border border-[#D9A928]/30 bg-black">
              <img 
                src={issue.coverImageUrl} 
                alt={issue.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              />
              <span className="absolute top-2 left-2 bg-black/85 text-[#D9A928] font-bold text-[10px] px-2 py-0.5 rounded border border-[#D9A928]/30">
                #{issue.issueNumber}
              </span>
              {issue.featured && (
                <span className="absolute bottom-2 left-2 bg-[#D9A928] text-black font-extrabold text-[9px] uppercase px-2 py-0.5 rounded shadow">
                  Destaque
                </span>
              )}
            </div>

            {/* Details & Actions */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[#D9A928] font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {toDisplayDate(issue.publishDate)}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    issue.status === 'PUBLISHED' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {issue.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-1 line-clamp-1">
                  {issue.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {issue.description}
                </p>

                <div className="flex items-center gap-3 mt-3 text-xs text-gray-300">
                  <span className="flex items-center gap-1 text-gray-400">
                    <Layers className="w-3.5 h-3.5 text-[#D9A928]" />
                    {issue.pagesCount} páginas
                  </span>
                  <span className="text-gray-400">
                    • {issue.analytics.totalReaders.toLocaleString('pt-BR')} leitores
                  </span>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-800 text-xs">
                {/* 3D Reader Test */}
                <button
                  onClick={() => openMagazineReader(issue.id)}
                  className="p-2 rounded-lg bg-[#0A2238] hover:bg-[#D9A928] text-white hover:text-black font-semibold flex items-center justify-center gap-1.5 transition border border-gray-700 hover:border-[#D9A928]"
                  title="Folhear Revista com efeito 3D realista"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ler 3D
                </button>

                {/* Readership Analytics */}
                <button
                  onClick={() => setSelectedIssueForReport(issue)}
                  className="p-2 rounded-lg bg-[#0A2238] hover:bg-[#061827] text-[#D9A928] font-semibold flex items-center justify-center gap-1.5 transition border border-[#D9A928]/40 hover:border-[#D9A928]"
                  title="Ver estatísticas detalhadas de retenção e leitores"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Métricas
                </button>

                {/* Client Direct Link */}
                <button
                  onClick={() => handleCopyLink(issue)}
                  className="p-2 rounded-lg bg-[#0A2238] text-white hover:text-[#D9A928] font-semibold flex items-center justify-center gap-1.5 transition border border-gray-700"
                  title="Copiar Link de Acesso para Painel do Cliente"
                >
                  {copiedLinkIssueId === issue.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#D9A928]" />}
                  {copiedLinkIssueId === issue.id ? 'Copiado!' : 'Link Cliente'}
                </button>

                {/* Manage Pages */}
                <button
                  onClick={() => {
                    setManagingPagesIssueId(issue.id);
                    setEditingPageNumber(null);
                    setPageForm(emptyPageForm);
                  }}
                  className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 flex items-center justify-center gap-1.5 transition"
                  title="Criar, editar e excluir páginas da revista 3D"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Páginas
                </button>

                {/* Edit Metadata */}
                <button
                  onClick={() => handleOpenEditModal(issue)}
                  className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 flex items-center justify-center gap-1.5 transition"
                  title="Editar metadados da edição"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Editar
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja excluir a Edição nº ${issue.issueNumber}?`)) {
                      deleteMagazineIssue(issue.id);
                    }
                  }}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center gap-1.5 transition"
                  title="Excluir edição"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: NEW / EDIT EDITION */}
      {isNewEditionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 bg-[#020B14] flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D9A928]" />
                {editingIssue ? `Editar Edição nº ${editingIssue.issueNumber}` : 'Cadastrar Nova Edição da Revista'}
              </h3>
              <button 
                onClick={() => setIsNewEditionModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdition} className="p-6 overflow-y-auto space-y-4 text-white text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Número da Edição
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.issueNumber}
                    onChange={e => {
                      const issueNumber = parseInt(e.target.value, 10);
                      setFormData(current => ({
                        ...current,
                        issueNumber,
                        clientAccessLink: prefersPublicMagazineLink(current.clientAccessLink)
                          ? magazineIssueUrl(Number.isFinite(issueNumber) ? issueNumber : current.issueNumber)
                          : current.clientAccessLink
                      }));
                    }}
                    className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Data de Publicação
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="dd/mm/aaaa"
                    value={formData.publishDate}
                    onChange={e => {
                      setDateError(null);
                      setFormData({ ...formData, publishDate: maskDate(e.target.value) });
                    }}
                    className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Digite a data inteira, por exemplo 01/09/2026.</p>
                  {dateError && <p className="text-[11px] text-red-300 mt-1">{dateError}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Título Principal da Capa
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: A Revolução da IA nos Negócios 2026"
                  className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Subtítulo Editorial
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Ex: Edição Especial de Líderes Empresariais"
                  className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Descrição & Sinopse
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o conteúdo, entrevistas e matérias principais..."
                  className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Imagem de capa (alta resolução)
                </label>
                <div className="flex gap-3 items-start">
                  <div className="flex-1 min-w-0">
                    <ImageUrlField
                      value={formData.coverImageUrl}
                      onChange={url => setFormData({ ...formData, coverImageUrl: url })}
                      folder="revista/capas"
                      required
                      placeholder="https://..."
                      inputClassName="bg-[#020B14]"
                      hint="Tamanho ideal: 960 × 1360 px, na proporção da página (cerca de A4). JPG, PNG ou WebP, até 5 MB. Na home a capa aparece em até 360 × 480 px."
                    />
                  </div>
                  <div className="w-16 aspect-[12/17] rounded border border-gray-700 overflow-hidden flex-shrink-0 bg-black">
                    {formData.coverImageUrl && (
                      <img src={formData.coverImageUrl} alt="Prévia da capa" className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  URL do Arquivo PDF Completo (Opcional para download)
                </label>
                <input
                  type="url"
                  value={formData.pdfUrl}
                  onChange={e => setFormData({ ...formData, pdfUrl: e.target.value })}
                  className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-[#D9A928]" />
                  Link de Acesso do Cliente / Parceiro
                </label>
                <input
                  type="url"
                  value={formData.clientAccessLink}
                  onChange={e => setFormData({ ...formData, clientAccessLink: e.target.value })}
                  placeholder="https://portalformulabusiness.com/revista/41"
                  className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Endereço público: {magazineIssueUrl(Number(formData.issueNumber) || 0)}. O botão “Link Cliente” copia esse caminho.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Anunciantes em Destaque nesta Edição (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={formData.clientAdvertisersFeatured}
                  onChange={e => setFormData({ ...formData, clientAdvertisersFeatured: e.target.value })}
                  placeholder="Vanguardia M&A, Apex Tech, BioEstética"
                  className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Ao abrir a revista, os nomes aparecem no topo, abaixo do título. Na home, aparecem sob a sinopse da edição em destaque. Também entram no relatório de leitura.
                </p>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                    className="accent-[#D9A928] w-4 h-4"
                  />
                  Destacar na Home Principal
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.downloadAllowed}
                    onChange={e => setFormData({ ...formData, downloadAllowed: e.target.checked })}
                    className="accent-[#D9A928] w-4 h-4"
                  />
                  Permitir Download do PDF pelos Leitores
                </label>
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewEditionModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#D9A928] to-[#F3C64B] text-black font-bold shadow-lg shadow-[#D9A928]/30 hover:scale-105 transition"
                >
                  {editingIssue ? 'Atualizar Edição' : 'Salvar e Publicar Edição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAGE INDIVIDUAL PAGES (CRUD completo) */}
      {managingPagesIssue && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 bg-[#020B14] flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#D9A928]" />
                  Gerenciador de Páginas — Edição #{managingPagesIssue.issueNumber}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Crie, edite e exclua páginas com imagem, título e texto — refletidos no flipbook 3D.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openMagazineReader(managingPagesIssue.id)}
                  className="px-3 py-2 rounded-lg bg-[#0A2238] border border-[#D9A928]/40 text-[#D9A928] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#D9A928] hover:text-black transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview 3D
                </button>
                <button
                  onClick={() => setManagingPagesIssueId(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D9A928] mb-3">
                  Páginas Cadastradas ({managingPagesIssue.pages.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {managingPagesIssue.pages.map((p) => (
                    <div
                      key={`${managingPagesIssue.id}-${p.pageNumber}`}
                      className={`bg-[#020B14] border rounded-xl overflow-hidden group relative flex flex-col transition ${
                        editingPageNumber === p.pageNumber
                          ? 'border-[#D9A928] shadow-lg shadow-[#D9A928]/20'
                          : 'border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="h-36 w-full relative">
                        <img
                          src={p.imageUrl}
                          alt={`Página ${p.pageNumber}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 bg-black/80 text-[#D9A928] font-bold text-[10px] px-1.5 py-0.5 rounded">
                          Pág. {p.pageNumber}
                        </span>
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            type="button"
                            onClick={() => handleSelectPageForEdit(p)}
                            className="p-1 bg-[#D9A928] text-black rounded hover:bg-[#F3C64B]"
                            title="Editar página"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePage(p.pageNumber)}
                            className="p-1 bg-red-600/90 text-white rounded hover:bg-red-500"
                            title="Excluir página"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectPageForEdit(p)}
                        className="p-2 text-left"
                      >
                        <div className="text-[11px] text-white font-semibold truncate">
                          {p.title || `Página ${p.pageNumber}`}
                        </div>
                        {p.description ? (
                          <div className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">
                            {p.description}
                          </div>
                        ) : null}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#020B14] border border-[#D9A928]/30 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    {editingPageNumber != null ? (
                      <>
                        <Edit className="w-4 h-4 text-[#D9A928]" />
                        Editando Página {editingPageNumber}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-[#D9A928]" />
                        Nova Página da Revista
                      </>
                    )}
                  </h4>
                  {editingPageNumber != null && (
                    <button
                      type="button"
                      onClick={handleCancelPageEdit}
                      className="text-[11px] text-gray-400 hover:text-white"
                    >
                      Cancelar edição
                    </button>
                  )}
                </div>

                <form onSubmit={handleSavePage} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-400 mb-1">URL da Imagem da Página</label>
                      <input
                        type="text"
                        required
                        value={pageForm.imageUrl}
                        onChange={(e) => setPageForm({ ...pageForm, imageUrl: e.target.value })}
                        placeholder="https://... ou envie um arquivo abaixo"
                        className="w-full bg-[#061827] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        Enviar imagem do computador
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            readImageFile(file, (dataUrl) =>
                              setPageForm((prev) => ({ ...prev, imageUrl: dataUrl }))
                            );
                          }
                        }}
                        className="w-full text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#D9A928] file:text-black file:font-semibold file:text-xs"
                      />
                    </div>

                    <div className="h-40 rounded-lg border border-gray-700 overflow-hidden bg-black">
                      {pageForm.imageUrl ? (
                        <img
                          src={pageForm.imageUrl}
                          alt="Prévia da página"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          Prévia da imagem
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-400 mb-1">Título da Matéria / Página</label>
                      <input
                        type="text"
                        value={pageForm.title}
                        onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                        placeholder="Ex: Entrevista com CEO — Estratégia 2026"
                        className="w-full bg-[#061827] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1">Texto / Descrição Editorial</label>
                      <textarea
                        rows={5}
                        value={pageForm.description}
                        onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
                        placeholder="Escreva o texto da página, chamada editorial ou legenda que aparece no flipbook..."
                        className="w-full bg-[#061827] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none resize-y"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1">Anunciante / Patrocínio (opcional)</label>
                      <input
                        type="text"
                        value={pageForm.featuredAdvertiser}
                        onChange={(e) =>
                          setPageForm({ ...pageForm, featuredAdvertiser: e.target.value })
                        }
                        placeholder="Ex: Banco Vanguardia"
                        className="w-full bg-[#061827] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-[#D9A928] hover:bg-[#F3C64B] text-black font-bold rounded-lg transition flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {editingPageNumber != null ? 'Salvar Alterações' : 'Adicionar Página'}
                      </button>
                      {editingPageNumber != null && (
                        <button
                          type="button"
                          onClick={() => handleDeletePage(editingPageNumber)}
                          className="px-4 py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-semibold rounded-lg transition flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Excluir esta página
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 bg-[#020B14] flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-gray-500">
                Link cliente:{' '}
                <span className="text-[#D9A928]">
                  {magazineIssueUrl(managingPagesIssue.issueNumber)}
                </span>
              </p>
              <button
                onClick={() => setManagingPagesIssueId(null)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg text-xs"
              >
                Concluir Edição de Páginas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: READERSHIP REPORT */}
      {selectedIssueForReport && (
        <ReadershipReportModal
          issue={selectedIssueForReport}
          onClose={() => setSelectedIssueForReport(null)}
        />
      )}
    </div>
  );
};
