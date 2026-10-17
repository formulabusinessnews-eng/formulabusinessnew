import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Tag, 
  Calendar, 
  Building2, 
  Globe, 
  Image as ImageIcon, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdPosition } from '../../types';

export const AdCheckoutModal: React.FC = () => {
  const { 
    t, 
    adPlans, 
    createCampaign, 
    validateCoupon, 
    currentUser, 
    isAdCheckoutOpen, 
    setIsAdCheckoutOpen, 
    preselectedAdPosition, 
    setPreselectedAdPosition 
  } = useApp();

  const [position, setPosition] = useState<AdPosition>(preselectedAdPosition || 'HERO_SIDE');
  const availablePlans = adPlans.filter(plan => plan.active);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    availablePlans.find(plan => plan.highlighted)?.id || availablePlans[0]?.id || ''
  );
  const [advertiserName, setAdvertiserName] = useState(currentUser.name || '');
  const [advertiserEmail, setAdvertiserEmail] = useState(currentUser.email || '');
  const [companyName, setCompanyName] = useState(currentUser.companyName || 'Empresa Patrocinadora');
  const [campaignName, setCampaignName] = useState('Campanha Institucional & Geração de Leads');
  const [destinationUrl, setDestinationUrl] = useState('https://minhaempresa.com.br');
  const [creativeDesktopUrl, setCreativeDesktopUrl] = useState('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=300&fit=crop&q=80');
  const [creativeMobileUrl, setCreativeMobileUrl] = useState('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&q=80');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; message: string; seller?: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Completed step
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdCampaignCode, setCreatedCampaignCode] = useState<string | null>(null);

  if (!isAdCheckoutOpen) return null;

  const selectedPlan = availablePlans.find(plan => plan.id === selectedPlanId) || availablePlans[0];
  const grossPrice = selectedPlan?.price || 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const netTotal = Math.max(0, grossPrice - discountAmount);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponError(null);
    const result = validateCoupon(couponCode, grossPrice);
    if (result.valid) {
      setAppliedCoupon({
        code: couponCode.trim().toUpperCase(),
        discount: result.discountAmount,
        message: result.message || 'Desconto aplicado!',
        seller: result.sellerOwnerCode
      });
    } else {
      setAppliedCoupon(null);
      setCouponError(result.message || 'Cupom inválido.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    const res = await createCampaign({
      advertiserName,
      advertiserEmail,
      companyName,
      campaignName,
      destinationUrl,
      creativeDesktopUrl,
      creativeMobileUrl,
      position,
      planId: selectedPlan.id,
      couponCode: appliedCoupon?.code
    });
    setSubmitting(false);

    if (res.success && res.campaign) {
      setCreatedCampaignCode(res.campaign.campaignCode);
      setIsSuccess(true);
      return;
    }
    setSubmitError(res.error || 'Não foi possível gravar a campanha.');
  };

  const handleClose = () => {
    setIsAdCheckoutOpen(false);
    setIsSuccess(false);
    setPreselectedAdPosition(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-800 bg-[#020B14] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-[#D9A928]/10 text-[#D9A928] rounded-xl border border-[#D9A928]/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-mono text-[#D9A928] uppercase tracking-wider block">
                Autoatendimento de Mídia • Fórmula Business News
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Contratação de Publicidade & Banners
              </h3>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Campanha Confirmada com Sucesso!</h4>
            <p className="text-sm text-gray-300 max-w-md mx-auto">
              Seu anúncio foi ativado no portal sob o código <strong className="text-[#D9A928] font-mono">{createdCampaignCode}</strong>.
              Você já pode acompanhar cliques e impressões em tempo real no seu painel.
            </p>
            {appliedCoupon?.seller && (
              <div className="p-3 bg-[#020B14] border border-[#D9A928]/30 rounded-xl text-xs text-[#D9A928] max-w-md mx-auto">
                ✓ Comissão de 10% (R$ {(netTotal * 0.1).toFixed(2)}) creditada com sucesso ao consultor {appliedCoupon.seller}.
              </div>
            )}
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D9A928] to-[#F3C64B] text-black font-bold text-xs uppercase"
              >
                Concluir e Ir para Minha Publicidade
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs text-white">
            
            {/* Step 1: Position */}
            <div>
              <label className="block font-bold text-white mb-2 uppercase tracking-wider text-[11px]">
                1. Selecione a Posição do Anúncio no Portal
              </label>
              <select
                value={position}
                onChange={e => setPosition(e.target.value as AdPosition)}
                className="w-full bg-[#020B14] border border-gray-700 rounded-xl p-3 text-white focus:border-[#D9A928] focus:outline-none font-medium"
              >
                <option value="TOP_HEADER">TOP_HEADER — Topo Absoluto do Portal (Máximo Alcance)</option>
                <option value="HERO_SIDE">HERO_SIDE — Lateral do Vídeo Principal</option>
                <option value="BETWEEN_NEWS">BETWEEN_NEWS — Entre Notícias em Destaque</option>
                <option value="CAROUSEL_01">CAROUSEL_01 — Integrado aos Carrosséis</option>
                <option value="CONTENT_MIDDLE">CONTENT_MIDDLE — Meio das Matérias</option>
                <option value="FOOTER">FOOTER — Rodapé Institucional</option>
              </select>
            </div>

            {/* Step 2: Plan Selection */}
            <div>
              <label className="block font-bold text-white mb-2 uppercase tracking-wider text-[11px]">
                2. Selecione o Plano / Duração da Campanha
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availablePlans.length === 0 && (
                  <p className="col-span-full text-gray-400">Nenhum pacote disponível no momento.</p>
                )}
                {availablePlans.map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      if (appliedCoupon) {
                        const rec = validateCoupon(appliedCoupon.code, plan.price);
                        if (rec.valid) {
                          setAppliedCoupon({ ...appliedCoupon, discount: rec.discountAmount });
                        }
                      }
                    }}
                    className={`cursor-pointer rounded-xl p-3.5 border transition ${
                      selectedPlanId === plan.id
                        ? 'border-[#D9A928] bg-[#0A2238] shadow-md shadow-[#D9A928]/20'
                        : 'border-gray-800 bg-[#020B14] hover:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white text-xs">{plan.name.split('—')[0]}</span>
                      {plan.highlighted && (
                        <span className="text-[9px] bg-[#D9A928] text-black font-extrabold px-1.5 py-0.5 rounded">
                          Mais Popular
                        </span>
                      )}
                    </div>
                    <div className="text-base font-extrabold text-[#D9A928]">
                      R$ {plan.price.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                      {plan.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Company & Creative */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">E-mail para Relatórios</label>
                <input
                  type="email"
                  required
                  value={advertiserEmail}
                  onChange={e => setAdvertiserEmail(e.target.value)}
                  className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-400 mb-1 font-semibold">URL de Destino do Clique (Link ou WhatsApp)</label>
                <input
                  type="url"
                  required
                  value={destinationUrl}
                  onChange={e => setDestinationUrl(e.target.value)}
                  className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-400 mb-1 font-semibold">URL da Arte do Banner Desktop (1200x300 ou similar)</label>
                <input
                  type="url"
                  required
                  value={creativeDesktopUrl}
                  onChange={e => setCreativeDesktopUrl(e.target.value)}
                  className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                />
              </div>
            </div>

            {/* Step 4: Coupon & Discounts */}
            <div className="p-4 bg-[#020B14] border border-gray-800 rounded-xl space-y-3">
              <label className="block font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#D9A928]" />
                Cupom de Desconto ou Código do Consultor
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="Ex: JOAO10 ou FORMULA20"
                  className="flex-1 bg-[#061827] border border-gray-700 rounded-lg p-2.5 text-white uppercase font-mono tracking-wider focus:border-[#D9A928] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 bg-[#0A2238] border border-[#D9A928]/40 hover:border-[#D9A928] text-[#D9A928] font-bold rounded-lg transition"
                >
                  Aplicar
                </button>
              </div>

              {appliedCoupon && (
                <div className="text-emerald-400 text-xs flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  <Check className="w-3.5 h-3.5" />
                  {appliedCoupon.message} (- R$ {appliedCoupon.discount.toFixed(2)})
                </div>
              )}

              {couponError && (
                <div className="text-red-400 text-xs flex items-center gap-1.5 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {couponError}
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-[#0A2238] border border-[#D9A928]/30 rounded-xl space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>{t.ads.subtotal} ({selectedPlan?.name.split('—')[0] || 'pacote'}):</span>
                <span>R$ {grossPrice.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>{t.ads.discount} ({appliedCoupon?.code}):</span>
                  <span>- R$ {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-700 flex justify-between items-center text-sm font-bold text-white">
                <span>{t.ads.totalToPay}:</span>
                <span className="text-xl font-extrabold text-[#D9A928]">
                  R$ {netTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {submitError && <p className="text-xs text-red-300">{submitError}</p>}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D9A928] to-[#F3C64B] text-black font-extrabold shadow-lg shadow-[#D9A928]/25 hover:scale-105 active:scale-95 transition flex items-center gap-2 disabled:opacity-60"
              >
                <ShieldCheck className="w-4 h-4" />
                {submitting ? 'Gravando...' : t.ads.submitCampaign}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
