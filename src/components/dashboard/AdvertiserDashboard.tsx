import React from 'react';
import { 
  Briefcase, 
  Plus, 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  Percent, 
  Calendar, 
  ExternalLink, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdvertiserDashboard: React.FC = () => {
  const { 
    t, 
    adCampaigns, 
    currentUser, 
    setIsAdCheckoutOpen 
  } = useApp();

  // If logged in as advertiser or showing their company campaigns
  const myCampaigns = currentUser.role === 'ADVERTISER'
    ? adCampaigns.filter(c => c.advertiserId === currentUser.id || c.referredBySellerCode === currentUser.referredBy || true)
    : adCampaigns;

  const totalSpent = myCampaigns.reduce((acc, c) => acc + c.netAmountPaid, 0);
  const activeCount = myCampaigns.filter(c => c.status === 'ACTIVE').length;
  const expiredCount = myCampaigns.filter(c => c.status === 'EXPIRED').length;
  const totalImpressions = myCampaigns.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = myCampaigns.reduce((acc, c) => acc + c.clicks, 0);
  const averageCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const mockRegions = [
    { name: 'São Paulo (SP)', percent: 38 },
    { name: 'Rio de Janeiro (RJ)', percent: 18 },
    { name: 'Minas Gerais (MG)', percent: 12 },
    { name: 'Alagoas & Nordeste', percent: 14 },
    { name: 'Sul & Centro-Oeste', percent: 18 }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-[#061827] border border-[#D9A928]/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D9A928] to-[#B8860B] text-black flex items-center justify-center font-bold shadow-lg flex-shrink-0">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#D9A928] font-bold tracking-widest">
                {t.advertiserDashboard.title}
              </span>
              <span className="text-xs text-gray-400">• Painel Executivo</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
              {currentUser.companyName || 'Painel da Minha Empresa'}
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              {t.advertiserDashboard.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdCheckoutOpen(true)}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D9A928] to-[#F3C64B] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#D9A928]/25 hover:scale-105 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          {t.advertiserDashboard.newCampaign}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
          <span className="text-[11px] uppercase text-gray-400 font-semibold">{t.advertiserDashboard.totalInvested}</span>
          <div className="text-xl font-bold text-[#D9A928] mt-1">R$ {totalSpent.toLocaleString('pt-BR')}</div>
          <span className="text-[10px] text-gray-400">Total faturado líquido</span>
        </div>

        <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
          <span className="text-[11px] uppercase text-gray-400 font-semibold">{t.advertiserDashboard.activeCampaigns}</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">{activeCount}</div>
          <span className="text-[10px] text-gray-400">Veiculando agora</span>
        </div>

        <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
          <span className="text-[11px] uppercase text-gray-400 font-semibold">{t.advertiserDashboard.totalImpressions}</span>
          <div className="text-xl font-bold text-white mt-1">{totalImpressions.toLocaleString('pt-BR')}</div>
          <span className="text-[10px] text-[#38BDF8]">Visualizações reais</span>
        </div>

        <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
          <span className="text-[11px] uppercase text-gray-400 font-semibold">{t.advertiserDashboard.totalClicks}</span>
          <div className="text-xl font-bold text-white mt-1">{totalClicks.toLocaleString('pt-BR')}</div>
          <span className="text-[10px] text-[#D9A928]">Cliques válidos</span>
        </div>

        <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
          <span className="text-[11px] uppercase text-gray-400 font-semibold">{t.advertiserDashboard.averageCtr}</span>
          <div className="text-xl font-bold text-purple-400 mt-1">{averageCtr}%</div>
          <span className="text-[10px] text-gray-400">Taxa média de clique</span>
        </div>

        <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
          <span className="text-[11px] uppercase text-gray-400 font-semibold">Campanhas Encerradas</span>
          <div className="text-xl font-bold text-gray-400 mt-1">{expiredCount}</div>
          <span className="text-[10px] text-gray-500">Histórico completo</span>
        </div>
      </div>

      {/* Middle Grid: Daily Performance & Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Performance Bars (8 cols) */}
        <div className="lg:col-span-8 bg-[#061827] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D9A928]" />
              {t.advertiserDashboard.impressionsVsClicks}
            </h3>
            <span className="text-xs text-gray-400 font-mono">Últimos 7 dias auditados</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-gray-800">
            {[
              { day: 'Seg', imp: 8400, clk: 240 },
              { day: 'Ter', imp: 11200, clk: 350 },
              { day: 'Qua', imp: 14800, clk: 490 },
              { day: 'Qui', imp: 16200, clk: 580 },
              { day: 'Sex', imp: 18900, clk: 640 },
              { day: 'Sáb', imp: 9800, clk: 310 },
              { day: 'Dom', imp: 8100, clk: 270 }
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  {/* Impressions bar */}
                  <div
                    className="w-4 bg-[#38BDF8] rounded-t transition-all hover:bg-[#7dd3fc]"
                    style={{ height: `${(d.imp / 20000) * 100}%` }}
                    title={`Impressões: ${d.imp}`}
                  />
                  {/* Clicks bar */}
                  <div
                    className="w-4 bg-[#D9A928] rounded-t transition-all hover:bg-[#F3C64B]"
                    style={{ height: `${(d.clk / 700) * 100}%` }}
                    title={`Cliques: ${d.clk}`}
                  />
                </div>
                <span className="text-[11px] text-gray-400 font-mono">{d.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <span className="flex items-center gap-2 text-gray-300">
              <span className="w-3 h-3 rounded bg-[#38BDF8]" /> Impressões
            </span>
            <span className="flex items-center gap-2 text-gray-300">
              <span className="w-3 h-3 rounded bg-[#D9A928]" /> Cliques Válidos
            </span>
          </div>
        </div>

        {/* Geographic Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-[#061827] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#D9A928]" />
              {t.advertiserDashboard.geographicReach}
            </h3>
            <div className="space-y-3.5">
              {mockRegions.map((reg, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-medium">{reg.name}</span>
                    <span className="text-[#D9A928] font-bold font-mono">{reg.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#D9A928] to-[#F3C64B] rounded-full" 
                      style={{ width: `${reg.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#020B14] rounded-xl border border-gray-800/80 mt-6 text-[11px] text-gray-400">
            ✓ Tráfego segmentado em tomadores de decisão corporativos de capitais e polos industriais.
          </div>
        </div>

      </div>

      {/* Campaigns List Table */}
      <div className="bg-[#061827] border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#D9A928]" />
          {t.advertiserDashboard.campaignsList}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#020B14] text-gray-400 uppercase font-semibold border-b border-gray-800">
              <tr>
                <th className="p-3">Campanha</th>
                <th className="p-3">Posição</th>
                <th className="p-3">Plano</th>
                <th className="p-3">Status</th>
                <th className="p-3">Impressões</th>
                <th className="p-3">Cliques</th>
                <th className="p-3">CTR</th>
                <th className="p-3">Valor Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {myCampaigns.map(camp => (
                <tr key={camp.id} className="hover:bg-[#0A2238]/40 transition">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={camp.creativeDesktopUrl} 
                        alt="Criativo" 
                        className="w-16 h-8 object-cover rounded border border-gray-700 flex-shrink-0"
                      />
                      <div>
                        <strong className="text-white font-bold block max-w-xs truncate">{camp.campaignName}</strong>
                        <span className="text-[10px] text-gray-400 font-mono">{camp.campaignCode}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[#D9A928]">{camp.position}</td>
                  <td className="p-3">{camp.planName.split('—')[0]}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      camp.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : camp.status === 'EXPIRED'
                        ? 'bg-gray-800 text-gray-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-white">{camp.impressions.toLocaleString('pt-BR')}</td>
                  <td className="p-3 font-mono font-bold text-[#D9A928]">{camp.clicks.toLocaleString('pt-BR')}</td>
                  <td className="p-3 font-mono">
                    {camp.impressions > 0 ? ((camp.clicks / camp.impressions) * 100).toFixed(2) : 0}%
                  </td>
                  <td className="p-3 font-mono font-bold text-white">
                    R$ {camp.netAmountPaid.toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
