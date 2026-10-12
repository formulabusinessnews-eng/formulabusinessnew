import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowUpRight, 
  CreditCard, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SellerDashboard: React.FC = () => {
  const { 
    t, 
    affiliates, 
    commissions, 
    currentUser, 
    requestSellerPayout 
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutPixKey, setPayoutPixKey] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // Active seller profile
  const currentSeller = affiliates.find(s => s.code === (currentUser.affiliateCode || 'JOAO10')) || affiliates[0];

  if (!currentSeller) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 lg:px-8 py-16">
        <div className="bg-[#061827] border border-gray-800 rounded-2xl p-8 text-center space-y-2">
          <h1 className="text-xl font-bold text-white">Nenhum consultor cadastrado</h1>
          <p className="text-sm text-gray-400">
            O painel do afiliado aparece quando existe um consultor na tabela affiliate_sellers do Supabase.
          </p>
        </div>
      </div>
    );
  }

  const sellerCommissions = commissions.filter(c => c.sellerCode === currentSeller.code);
  const referralLink = `${window.location.origin}/?ref=${currentSeller.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(currentSeller.couponCode);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentSeller.availableCommission <= 0) return;
    requestSellerPayout(currentSeller.code, currentSeller.availableCommission);
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setIsPayoutModalOpen(false);
    }, 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner with Referral Link and Coupon */}
      <div className="bg-[#061827] border border-[#D9A928]/40 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#0284c7] text-white flex items-center justify-center font-bold shadow-lg flex-shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#38BDF8] font-bold tracking-widest">
                Programa de Consultores & Afiliados
              </span>
              <span className="text-xs text-[#D9A928] font-bold bg-[#D9A928]/10 px-2 py-0.5 rounded border border-[#D9A928]/30">
                10% Recorrente Vitalício
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
              {currentSeller.name}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Código de Indicação: <strong className="text-[#D9A928] font-mono">{currentSeller.code}</strong> • Status: <span className="text-emerald-400">{currentSeller.status}</span>
            </p>
          </div>
        </div>

        {/* Action Share Cards */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Coupon Button */}
          <button
            onClick={handleCopyCoupon}
            className="px-4 py-3 bg-[#0A2238] border border-[#D9A928]/40 hover:border-[#D9A928] rounded-xl text-left transition"
          >
            <span className="text-[10px] uppercase text-gray-400 font-semibold block">Seu Cupom (10% OFF p/ o cliente)</span>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <span className="font-mono font-bold text-sm text-[#D9A928]">{currentSeller.couponCode}</span>
              {copiedCoupon ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </div>
          </button>

          {/* Referral Link */}
          <button
            onClick={handleCopyLink}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D9A928] to-[#F3C64B] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#D9A928]/25 hover:scale-105 active:scale-95 transition"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? t.sellerDashboard.linkCopied : t.sellerDashboard.copyLink}</span>
          </button>
        </div>
      </div>

      {/* Critical Rule Highlight Card */}
      <div className="bg-[#020B14] border border-[#D9A928]/30 rounded-2xl p-4 flex items-center gap-3 text-xs text-gray-300">
        <Sparkles className="w-5 h-5 text-[#D9A928] flex-shrink-0" />
        <div>
          <strong className="text-[#D9A928] font-bold">Regra de Transparência e Recorrência:</strong> {t.sellerDashboard.commissionRule}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
          <span className="text-[11px] uppercase text-gray-400 font-semibold">{t.sellerDashboard.teamTotal}</span>
          <div className="text-2xl font-bold text-white mt-1">{currentSeller.totalReferredClients}</div>
          <span className="text-[10px] text-emerald-400">Anunciantes vinculados</span>
        </div>

        <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
          <span className="text-[11px] uppercase text-gray-400 font-semibold">{t.sellerDashboard.totalSalesVolume}</span>
          <div className="text-2xl font-bold text-[#38BDF8] mt-1">
            R$ {currentSeller.totalSalesVolume.toLocaleString('pt-BR')}
          </div>
          <span className="text-[10px] text-gray-400">Venda total em publicidade</span>
        </div>

        <div className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
          <span className="text-[11px] uppercase text-gray-400 font-semibold">{t.sellerDashboard.accumulatedCommission}</span>
          <div className="text-2xl font-bold text-white mt-1">
            R$ {currentSeller.accumulatedCommission.toLocaleString('pt-BR')}
          </div>
          <span className="text-[10px] text-[#D9A928]">10% sobre vendas líquidas</span>
        </div>

        <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase text-emerald-400 font-bold">{t.sellerDashboard.availableCommission}</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              R$ {currentSeller.availableCommission.toLocaleString('pt-BR')}
            </div>
          </div>
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            disabled={currentSeller.availableCommission <= 0}
            className="mt-3 w-full py-1.5 rounded-lg bg-[#D9A928] hover:bg-[#F3C64B] text-black font-bold text-xs transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t.sellerDashboard.requestPayout}
          </button>
        </div>
      </div>

      {/* Commission Breakdown Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#020B14] border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase text-gray-400">{t.sellerDashboard.paidCommission}</span>
            <div className="text-xl font-bold text-white mt-1">
              R$ {currentSeller.paidCommission.toLocaleString('pt-BR')}
            </div>
            <p className="text-[11px] text-gray-400">Transferências PIX realizadas</p>
          </div>
          <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Check className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-[#020B14] border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase text-gray-400">{t.sellerDashboard.pendingCommission}</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              R$ {currentSeller.pendingCommission.toLocaleString('pt-BR')}
            </div>
            <p className="text-[11px] text-gray-400">Em processamento pelo setor financeiro</p>
          </div>
          <span className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Commissions History Table */}
      <div className="bg-[#061827] border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#D9A928]" />
          Extrato Detalhado de Comissões por Compra
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#020B14] text-gray-400 uppercase font-semibold border-b border-gray-800">
              <tr>
                <th className="p-3">Campanha</th>
                <th className="p-3">Cliente Anunciante</th>
                <th className="p-3">Valor Bruto</th>
                <th className="p-3">Desconto Cupom</th>
                <th className="p-3">Valor Líquido Pago</th>
                <th className="p-3">Sua Comissão (10%)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {sellerCommissions.map(comm => (
                <tr key={comm.id} className="hover:bg-[#0A2238]/40 transition">
                  <td className="p-3 font-mono font-bold text-[#D9A928]">{comm.campaignCode}</td>
                  <td className="p-3 font-semibold text-white">{comm.advertiserName}</td>
                  <td className="p-3 font-mono">R$ {comm.originalGrossAmount.toFixed(2)}</td>
                  <td className="p-3 font-mono text-emerald-400">- R$ {comm.discountAmount.toFixed(2)}</td>
                  <td className="p-3 font-mono font-bold text-white">R$ {comm.netPaidAmount.toFixed(2)}</td>
                  <td className="p-3 font-mono font-extrabold text-[#D9A928] text-sm">
                    R$ {comm.commissionAmount.toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      comm.status === 'AVAILABLE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : comm.status === 'PAID'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {comm.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400 font-mono">
                    {new Date(comm.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYOUT REQUEST MODAL */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl w-full max-w-md p-6 shadow-2xl text-xs text-white space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#D9A928]" />
                Solicitar Resgate de Comissão via PIX
              </h4>
              <button onClick={() => setIsPayoutModalOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            {payoutSuccess ? (
              <div className="p-4 text-center space-y-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <Check className="w-8 h-8 mx-auto" />
                <p className="font-bold">Solicitação de resgate enviada com sucesso!</p>
                <p className="text-[11px] text-gray-300">O valor será transferido para sua chave PIX em até 24 horas úteis.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div className="p-3 bg-[#020B14] rounded-xl border border-gray-800">
                  <span className="text-gray-400 block">Valor Disponível para Saque:</span>
                  <span className="text-xl font-bold text-emerald-400">
                    R$ {currentSeller.availableCommission.toFixed(2)}
                  </span>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    Informe sua Chave PIX (CPF, CNPJ, E-mail ou Telefone)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Chave PIX..."
                    value={payoutPixKey}
                    onChange={e => setPayoutPixKey(e.target.value)}
                    className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-[#D9A928] to-[#F3C64B] text-black font-bold rounded-lg shadow"
                  >
                    Confirmar Solicitação
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
