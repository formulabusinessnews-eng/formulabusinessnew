import React, { useState } from 'react';
import { 
  X, 
  BarChart3, 
  Users, 
  Clock, 
  Download, 
  Share2, 
  Check, 
  Code, 
  TrendingUp, 
  Smartphone, 
  Monitor, 
  Tablet, 
  MapPin, 
  ExternalLink 
} from 'lucide-react';
import { MagazineIssue } from '../../types';
import { useApp } from '../../context/AppContext';

interface Props {
  issue: MagazineIssue;
  onClose: () => void;
}

export const ReadershipReportModal: React.FC<Props> = ({ issue, onClose }) => {
  const { t } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState<'kpis' | 'pages' | 'devices' | 'embed'>('kpis');

  const analytics = issue.analytics;
  const clientUrl = issue.clientAccessLink || `${window.location.origin}/#magazine-${issue.id}`;
  const embedCode = `<iframe src="${window.location.origin}/revista/embed/${issue.id}" width="100%" height="700px" frameborder="0" allowfullscreen></iframe>`;

  const copyToClipboard = (text: string, isEmbed = false) => {
    navigator.clipboard.writeText(text);
    if (isEmbed) {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 3000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#061827] border border-[#D9A928]/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-[#020B14] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#D9A928]/10 text-[#D9A928] border border-[#D9A928]/30">
              <BarChart3 className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-[#D9A928] font-bold">
                  {t.magazine.readershipReport}
                </span>
                <span className="text-xs text-gray-400">• Edição nº {issue.issueNumber}</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {issue.title}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-gray-800 px-6 bg-[#04101b] text-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`py-3.5 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'kpis'
                ? 'border-[#D9A928] text-[#D9A928]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Visão Geral & KPIs
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`py-3.5 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'pages'
                ? 'border-[#D9A928] text-[#D9A928]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {t.magazine.pageDropoffTitle}
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`py-3.5 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'devices'
                ? 'border-[#D9A928] text-[#D9A928]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            {t.magazine.deviceBreakdown} & Regiões
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`py-3.5 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'embed'
                ? 'border-[#D9A928] text-[#D9A928]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Code className="w-4 h-4" />
            Link para Cliente & Incorporação
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-white">
          {/* TAB 1: OVERVIEW & KPIS */}
          {activeTab === 'kpis' && (
            <div className="space-y-6">
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0A2238] border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs uppercase">{t.magazine.totalReaders}</span>
                    <Users className="w-4 h-4 text-[#D9A928]" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    {analytics.totalReaders.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    ↑ +18.4% vs edição anterior
                  </div>
                </div>

                <div className="bg-[#0A2238] border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs uppercase">Total de Leituras</span>
                    <BarChart3 className="w-4 h-4 text-[#38BDF8]" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    {analytics.totalPageviews.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Páginas visualizadas no 3D
                  </div>
                </div>

                <div className="bg-[#0A2238] border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs uppercase">{t.magazine.avgTime}</span>
                    <Clock className="w-4 h-4 text-[#FBBF24]" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    {analytics.avgReadTimeMinutes} min
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    Tempo médio por leitor ativo
                  </div>
                </div>

                <div className="bg-[#0A2238] border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs uppercase">{t.magazine.completionRate}</span>
                    <TrendingUp className="w-4 h-4 text-[#34D399]" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-400">
                    {analytics.completionRate}%
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Leitores que foram até a contracapa
                  </div>
                </div>
              </div>

              {/* Downloads & Shares */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#020B14] border border-gray-800 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase text-gray-400">Downloads do PDF Oficial</span>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {analytics.downloadsCount.toLocaleString('pt-BR')} downloads
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Leitores baixaram para consulta offline</p>
                  </div>
                  <span className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                    <Download className="w-6 h-6" />
                  </span>
                </div>

                <div className="bg-[#020B14] border border-gray-800 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase text-gray-400">Compartilhamentos Registrados</span>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {analytics.sharesCount.toLocaleString('pt-BR')} shares
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Via WhatsApp, LinkedIn e link direto</p>
                  </div>
                  <span className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                    <Share2 className="w-6 h-6" />
                  </span>
                </div>
              </div>

              {/* Advertisers in this issue */}
              <div className="bg-[#0A2238]/60 border border-[#D9A928]/30 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-[#D9A928] uppercase tracking-wider mb-3">
                  {t.magazine.topAdvertisers}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {issue.clientAdvertisersFeatured.length > 0 ? (
                    issue.clientAdvertisersFeatured.map((adv, idx) => (
                      <span 
                        key={idx}
                        className="bg-[#020B14] border border-[#D9A928]/40 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-[#D9A928]" />
                        {adv}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">Nenhum anunciante cadastrado nos metadados.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAGE RETENTION & DROPOFFS */}
          {activeTab === 'pages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Retenção de Audiência por Página
                  </h3>
                  <p className="text-xs text-gray-400">
                    Volume de leituras e permanência média para cada página da revista.
                  </p>
                </div>
                <span className="text-xs bg-[#D9A928]/10 text-[#D9A928] px-3 py-1 rounded-full border border-[#D9A928]/30 font-semibold">
                  {issue.pagesCount} Páginas Monitoradas
                </span>
              </div>

              <div className="space-y-2.5">
                {analytics.pageDropoffs.map((item) => {
                  const maxViews = analytics.pageDropoffs[0]?.views || 1;
                  const percentage = Math.round((item.views / maxViews) * 100);
                  const pageInfo = issue.pages.find(p => p.pageNumber === item.pageNumber);

                  return (
                    <div key={item.pageNumber} className="bg-[#020B14] border border-gray-800 rounded-xl p-3.5">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-[#0A2238] text-[#D9A928] font-bold flex items-center justify-center text-[11px] border border-[#D9A928]/30">
                            {item.pageNumber}
                          </span>
                          <span className="font-semibold text-white truncate max-w-xs md:max-w-md">
                            {pageInfo?.title || `Página ${item.pageNumber}`}
                          </span>
                          {pageInfo?.featuredAdvertiser && (
                            <span className="bg-[#D9A928]/20 text-[#D9A928] text-[10px] px-2 py-0.5 rounded font-medium">
                              Anúncio: {pageInfo.featuredAdvertiser}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <span className="text-gray-400">
                            {item.avgSecondsSpent}s de leitura
                          </span>
                          <span className="font-mono font-bold text-white w-14">
                            {item.views.toLocaleString('pt-BR')} ({percentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Retention Progress Bar */}
                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#D9A928] to-[#F3C64B] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DEVICES & REGIONS */}
          {activeTab === 'devices' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Devices Card */}
              <div className="bg-[#020B14] border border-gray-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#D9A928]" />
                  Dispositivos de Leitura
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                      <span className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-blue-400" /> Computadores / Desktop</span>
                      <span className="font-bold text-white">{analytics.devices.desktop}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${analytics.devices.desktop}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                      <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Smartphones / Mobile</span>
                      <span className="font-bold text-white">{analytics.devices.mobile}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${analytics.devices.mobile}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                      <span className="flex items-center gap-1.5"><Tablet className="w-3.5 h-3.5 text-purple-400" /> Tablets & iPads</span>
                      <span className="font-bold text-white">{analytics.devices.tablet}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${analytics.devices.tablet}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Reach */}
              <div className="bg-[#020B14] border border-gray-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D9A928]" />
                  Alcance por Região
                </h4>
                <div className="space-y-3">
                  {analytics.regions.map((reg, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs border-b border-gray-800/60 pb-2">
                      <span className="text-gray-300">{reg.region}</span>
                      <span className="font-mono font-bold text-[#D9A928]">{reg.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLIENT PARTNER LINK & EMBED */}
          {activeTab === 'embed' && (
            <div className="space-y-6">
              <div className="bg-[#0A2238]/60 border border-[#D9A928]/30 rounded-xl p-5">
                <h3 className="text-base font-bold text-[#D9A928] mb-1">
                  Link Direto de Acesso para o Negócio do Cliente
                </h3>
                <p className="text-xs text-gray-300 mb-4">
                  Envie este link exclusivo para clientes, patrocinadores e anunciantes visualizarem a revista diretamente em tela cheia sem fricção de login.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={clientUrl}
                    className="flex-1 bg-[#020B14] border border-gray-700 rounded-lg px-3.5 py-2.5 text-xs text-gray-200 font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(clientUrl)}
                    className="px-4 py-2.5 bg-[#D9A928] hover:bg-[#F3C64B] text-black font-semibold rounded-lg text-xs flex items-center gap-1.5 transition"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    {copiedLink ? 'Copiado!' : 'Copiar Link'}
                  </button>
                  <a
                    href={clientUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-[#020B14] border border-gray-700 hover:border-gray-500 rounded-lg text-gray-300 transition"
                    title="Testar Link em nova aba"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Embed Code Snippet for Client Portal */}
              <div className="bg-[#020B14] border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#D9A928]" />
                    Código de Incorporação (iFrame para Painel do Cliente)
                  </h4>
                  <button
                    onClick={() => copyToClipboard(embedCode, true)}
                    className="text-xs text-[#D9A928] hover:underline flex items-center gap-1"
                  >
                    {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
                    {copiedEmbed ? 'Código copiado!' : 'Copiar iFrame'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Permite ao seu cliente de negócios integrar a revista digital diretamente no painel administrativo dele.
                </p>
                <pre className="bg-[#061827] p-3 rounded-lg border border-gray-800 text-[11px] font-mono text-gray-300 overflow-x-auto">
                  {embedCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#020B14] flex justify-between items-center text-xs text-gray-400">
          <span>Última atualização das métricas: {new Date(analytics.lastUpdated).toLocaleString('pt-BR')}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};
