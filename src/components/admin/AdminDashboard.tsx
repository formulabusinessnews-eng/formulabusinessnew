import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BarChart3, 
  BookOpen, 
  Newspaper, 
  Flame, 
  Briefcase, 
  DollarSign, 
  Tag, 
  Users, 
  Settings, 
  FileText, 
  Plus, 
  Trash2, 
  Upload, 
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminMagazineSection } from './AdminMagazineSection';
import { AdminFormulaDaBelezaSection } from './AdminFormulaDaBelezaSection';
import { AdminNewsSection } from './AdminNewsSection';
import { AdminAdsSection } from './AdminAdsSection';
import { AdminPlansSection } from './AdminPlansSection';
import { AdminCouponsSection } from './AdminCouponsSection';
import { AdminAffiliatesSection } from './AdminAffiliatesSection';

export const AdminDashboard: React.FC = () => {
  const { 
    t, 
    tickerItems, 
    addTickerItem, 
    updateTickerItem, 
    deleteTickerItem, 
    adCampaigns, 
    commissions, 
    siteSettings, 
    updateSiteSettings, 
    auditLogs 
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('magazine'); // Default to the primary requested Magazine admin!

  // New Ticker item
  const [newTickerText, setNewTickerText] = useState('');

  // Logo upload preview
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSiteSettings({ logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Global KPIs calculation
  const totalRevenue = adCampaigns.reduce((acc, c) => acc + c.netAmountPaid, 0);
  const totalImpressions = adCampaigns.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = adCampaigns.reduce((acc, c) => acc + c.clicks, 0);
  const totalCommissionsPaid = commissions.filter(c => c.status === 'PAID').reduce((acc, c) => acc + c.commissionAmount, 0);
  const totalCommissionsPending = commissions.filter(c => c.status === 'AVAILABLE' || c.status === 'PENDING').reduce((acc, c) => acc + c.commissionAmount, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      
      {/* Admin Master Header */}
      <div className="bg-[#061827] border border-[#D9A928]/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D9A928] to-[#996515] text-black flex items-center justify-center font-bold shadow-lg flex-shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#D9A928] font-bold tracking-widest">
                Painel Master de Governança
              </span>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Sistema Operacional
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
              {t.admin.title}
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              {t.admin.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Horizontal Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-gray-800 pb-2">
        {[
          { id: 'magazine', label: t.admin.tabs.magazine, icon: BookOpen, badge: 'Destaque' },
          { id: 'formula-beleza', label: 'Fórmula da Beleza', icon: Sparkles, badge: 'TV' },
          { id: 'dashboard', label: t.admin.tabs.dashboard, icon: BarChart3 },
          { id: 'news', label: t.admin.tabs.news, icon: Newspaper },
          { id: 'ticker', label: t.admin.tabs.ticker, icon: Flame },
          { id: 'ads', label: t.admin.tabs.ads, icon: Briefcase },
          { id: 'plans', label: t.admin.tabs.plans, icon: DollarSign },
          { id: 'coupons', label: t.admin.tabs.coupons, icon: Tag },
          { id: 'affiliates', label: t.admin.tabs.affiliates, icon: Users },
          { id: 'settings', label: t.admin.tabs.settings, icon: Settings },
          { id: 'audit', label: t.admin.tabs.audit, icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition flex-shrink-0 ${
                isActive
                  ? 'bg-[#D9A928] text-black shadow-lg shadow-[#D9A928]/20'
                  : 'bg-[#061827] text-gray-300 hover:text-white border border-gray-800 hover:border-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${isActive ? 'bg-black text-[#D9A928]' : 'bg-[#D9A928] text-black'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DIGITAL MAGAZINE 3D (PRIMARY REQUIREMENT) */}
      {activeTab === 'magazine' && (
        <AdminMagazineSection />
      )}

      {/* TAB: PROGRAMA FÓRMULA DA BELEZA */}
      {activeTab === 'formula-beleza' && (
        <AdminFormulaDaBelezaSection />
      )}

      {/* TAB 2: EXECUTIVE DASHBOARD KPIS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
              <span className="text-[10px] uppercase text-gray-400 font-semibold">Receita Publicitária</span>
              <div className="text-xl font-bold text-[#D9A928] mt-1">R$ {totalRevenue.toLocaleString('pt-BR')}</div>
              <span className="text-[10px] text-emerald-400">Total líquido faturado</span>
            </div>

            <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
              <span className="text-[10px] uppercase text-gray-400 font-semibold">Campanhas Ativas</span>
              <div className="text-xl font-bold text-white mt-1">
                {adCampaigns.filter(c => c.status === 'ACTIVE').length}
              </div>
              <span className="text-[10px] text-[#38BDF8]">Veiculando hoje</span>
            </div>

            <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
              <span className="text-[10px] uppercase text-gray-400 font-semibold">Impressões Totais</span>
              <div className="text-xl font-bold text-white mt-1">{totalImpressions.toLocaleString('pt-BR')}</div>
              <span className="text-[10px] text-gray-400">Exibições auditadas</span>
            </div>

            <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
              <span className="text-[10px] uppercase text-gray-400 font-semibold">Cliques Válidos</span>
              <div className="text-xl font-bold text-white mt-1">{totalClicks.toLocaleString('pt-BR')}</div>
              <span className="text-[10px] text-[#D9A928]">Com antifraude</span>
            </div>

            <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
              <span className="text-[10px] uppercase text-gray-400 font-semibold">Comissões Pagas</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">R$ {totalCommissionsPaid.toLocaleString('pt-BR')}</div>
              <span className="text-[10px] text-gray-400">Para consultores</span>
            </div>

            <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
              <span className="text-[10px] uppercase text-gray-400 font-semibold">Comissões Pendentes</span>
              <div className="text-xl font-bold text-amber-400 mt-1">R$ {totalCommissionsPending.toLocaleString('pt-BR')}</div>
              <span className="text-[10px] text-gray-400">Aguardando saque</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NEWS & EDITORIAL */}
      {activeTab === 'news' && (
        <AdminNewsSection />
      )}

      {/* TAB 4: BREAKING NEWS TICKER */}
      {activeTab === 'ticker' && (
        <div className="bg-[#061827] border border-gray-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#D9A928]" />
              Gestão do Letreiro de Última Hora (Breaking News Ticker)
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Controle total sobre as manchetes urgentes que rolam horizontalmente no topo do portal.
            </p>
          </div>

          {/* Add Ticker Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite a notícia urgente..."
              value={newTickerText}
              onChange={e => setNewTickerText(e.target.value)}
              className="flex-1 bg-[#020B14] border border-gray-700 rounded-xl p-3 text-xs text-white focus:border-[#D9A928] focus:outline-none"
            />
            <button
              onClick={() => {
                if (newTickerText.trim()) {
                  addTickerItem(newTickerText.trim());
                  setNewTickerText('');
                }
              }}
              className="px-5 bg-[#D9A928] text-black font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>

          {/* Ticker List */}
          <div className="space-y-2">
            {tickerItems.map(item => (
              <div key={item.id} className="p-3 bg-[#020B14] border border-gray-800 rounded-xl flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                    {item.active ? 'Ativo' : 'Pausado'}
                  </span>
                  <span className="text-gray-200 truncate">{item.text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateTickerItem(item.id, { active: !item.active })}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-[11px]"
                  >
                    {item.active ? 'Pausar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => deleteTickerItem(item.id)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ADS & CAMPAIGNS */}
      {activeTab === 'ads' && (
        <AdminAdsSection />
      )}

      {activeTab === 'plans' && (
        <AdminPlansSection />
      )}

      {activeTab === 'coupons' && (
        <AdminCouponsSection />
      )}

      {activeTab === 'affiliates' && (
        <AdminAffiliatesSection />
      )}

      {/* TAB 6: SITE SETTINGS & LOGO UPLOAD (CRITICAL REQUIREMENT) */}
      {activeTab === 'settings' && (
        <div className="bg-[#061827] border border-gray-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#D9A928]" />
              Identidade Visual & Configurações do Portal
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Substitua a logo oficial, edite telefones de contato, WhatsApp, transmissão ao vivo e tags de rastreamento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload Box */}
            <div className="bg-[#020B14] border border-[#D9A928]/30 rounded-xl p-5 space-y-4">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Logo Oficial do Portal
              </label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-16 rounded-xl bg-black border border-gray-700 flex items-center justify-center p-2 overflow-hidden">
                  <img src={siteSettings.logoUrl} alt="Logo Atual" className="max-w-full max-h-full object-contain" />
                </div>
                <label className="px-4 py-2.5 rounded-xl bg-[#0A2238] border border-[#D9A928]/40 hover:border-[#D9A928] text-white text-xs font-semibold cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#D9A928]" />
                  <span>Substituir Logo (Upload)</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
              <p className="text-[11px] text-gray-400">
                A logo deve respeitar sua identidade visual original com transparência (PNG ou SVG recomendado).
              </p>
            </div>

            {/* Live Streaming Setup */}
            <div className="bg-[#020B14] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
              <label className="block font-bold text-white uppercase tracking-wider">
                Transmissão Ao Vivo (Botão e Player)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={siteSettings.isLive}
                  onChange={e => updateSiteSettings({ isLive: e.target.checked })}
                  className="accent-[#D9A928] w-4 h-4"
                />
                <span className="text-white font-medium">Exibir status "AO VIVO" no cabeçalho</span>
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Título da Transmissão</label>
                <input
                  type="text"
                  value={siteSettings.liveTitle}
                  onChange={e => updateSiteSettings({ liveTitle: e.target.value })}
                  className="w-full bg-[#061827] border border-gray-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-[#061827] border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D9A928]" />
            Logs de Auditoria Administrativa
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="p-2.5 bg-[#020B14] rounded-lg border border-gray-800 text-gray-300 flex justify-between gap-4">
                <div>
                  <span className="text-[#D9A928] font-bold">[{log.module}]</span> {log.action}: {log.details}
                </div>
                <div className="text-gray-500 text-[10px] flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
