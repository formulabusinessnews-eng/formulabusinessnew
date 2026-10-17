import React, { useState } from 'react';
import { Briefcase, Edit, Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdCampaign, AdPosition, CampaignStatus } from '../../types';
import { ImageUrlField } from './ImageUrlField';

const POSITIONS: { value: AdPosition; label: string }[] = [
  { value: 'TOP_HEADER', label: 'TOP_HEADER — Topo absoluto do portal' },
  { value: 'BREAKING_NEWS', label: 'BREAKING_NEWS — Faixa de última hora' },
  { value: 'HERO_TOP', label: 'HERO_TOP — Acima do destaque principal' },
  { value: 'HERO_SIDE', label: 'HERO_SIDE — Lateral do vídeo principal' },
  { value: 'CAROUSEL_01', label: 'CAROUSEL_01 — Integrado aos carrosséis' },
  { value: 'BETWEEN_NEWS', label: 'BETWEEN_NEWS — Entre notícias em destaque' },
  { value: 'CONTENT_TOP', label: 'CONTENT_TOP — Topo das matérias' },
  { value: 'CONTENT_MIDDLE', label: 'CONTENT_MIDDLE — Meio das matérias' },
  { value: 'CONTENT_BOTTOM', label: 'CONTENT_BOTTOM — Final das matérias' },
  { value: 'SIDEBAR', label: 'SIDEBAR — Coluna lateral' },
  { value: 'FOOTER', label: 'FOOTER — Rodapé institucional' },
  { value: 'MOBILE_TOP', label: 'MOBILE_TOP — Topo no celular' },
  { value: 'MOBILE_MIDDLE', label: 'MOBILE_MIDDLE — Meio no celular' }
];

const STATUSES: { value: CampaignStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Ativa' },
  { value: 'PAUSED', label: 'Pausada' },
  { value: 'SCHEDULED', label: 'Agendada' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'WAITING_APPROVAL', label: 'Aguardando aprovação' },
  { value: 'EXPIRED', label: 'Expirada' },
  { value: 'CANCELLED', label: 'Cancelada' }
];

type CampaignForm = {
  campaignName: string;
  companyName: string;
  advertiserName: string;
  advertiserEmail: string;
  destinationUrl: string;
  creativeDesktopUrl: string;
  creativeMobileUrl: string;
  position: AdPosition;
  planId: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  originalPrice: string;
  discountAmount: string;
  referredBySellerCode: string;
};

const toDateInput = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const fromDateInput = (value: string, endOfDay: boolean) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1, endOfDay ? 23 : 8, endOfDay ? 59 : 0, endOfDay ? 59 : 0);
  return date.toISOString();
};

const emptyForm = (
  plans: { id: string; price: number; durationDays: number; highlighted?: boolean }[]
): CampaignForm => {
  const plan = plans.find(item => item.highlighted) || plans[0];
  const start = new Date();
  const end = new Date(start.getTime() + (plan?.durationDays || 7) * 24 * 60 * 60 * 1000);
  return {
    campaignName: '',
    companyName: '',
    advertiserName: '',
    advertiserEmail: '',
    destinationUrl: 'https://',
    creativeDesktopUrl: '',
    creativeMobileUrl: '',
    position: 'TOP_HEADER',
    planId: plan?.id || '',
    status: 'ACTIVE',
    startDate: toDateInput(start.toISOString()),
    endDate: toDateInput(end.toISOString()),
    originalPrice: String(plan?.price || 0),
    discountAmount: '0',
    referredBySellerCode: ''
  };
};

const formFromCampaign = (campaign: AdCampaign): CampaignForm => ({
  campaignName: campaign.campaignName,
  companyName: campaign.companyName,
  advertiserName: campaign.advertiserName,
  advertiserEmail: campaign.advertiserEmail,
  destinationUrl: campaign.destinationUrl,
  creativeDesktopUrl: campaign.creativeDesktopUrl,
  creativeMobileUrl: campaign.creativeMobileUrl,
  position: campaign.position,
  planId: campaign.planId,
  status: campaign.status,
  startDate: toDateInput(campaign.startDate),
  endDate: toDateInput(campaign.endDate),
  originalPrice: String(campaign.originalPrice),
  discountAmount: String(campaign.discountAmount),
  referredBySellerCode: campaign.referredBySellerCode || ''
});

const statusClass = (status: CampaignStatus) => {
  if (status === 'ACTIVE') return 'bg-emerald-500/10 text-emerald-400';
  if (status === 'PAUSED' || status === 'SCHEDULED') return 'bg-amber-500/10 text-amber-300';
  if (status === 'EXPIRED' || status === 'CANCELLED') return 'bg-red-500/10 text-red-300';
  return 'bg-gray-800 text-gray-400';
};

const fieldClass = 'w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none';

export const AdminAdsSection: React.FC = () => {
  const {
    adCampaigns,
    adPlans,
    affiliates,
    campaignsSyncError,
    createAdminCampaign,
    updateCampaign,
    updateCampaignStatus,
    addAdvertiserAccount
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<AdCampaign | null>(null);
  const [form, setForm] = useState<CampaignForm>(() => emptyForm(adPlans));
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [advertiserForm, setAdvertiserForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    password: ''
  });
  const [advertiserSaving, setAdvertiserSaving] = useState(false);
  const [advertiserError, setAdvertiserError] = useState<string | null>(null);

  const netAmount = Math.max(
    0,
    (Number(form.originalPrice) || 0) - (Number(form.discountAmount) || 0)
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(adPlans));
    setFormError(null);
    setIsOpen(true);
  };

  const openEdit = (campaign: AdCampaign) => {
    setEditing(campaign);
    setForm(formFromCampaign(campaign));
    setFormError(null);
    setIsOpen(true);
  };

  const handlePlanChange = (planId: string) => {
    const plan = adPlans.find(item => item.id === planId);
    if (!plan) {
      setForm(current => ({ ...current, planId }));
      return;
    }
    setForm(current => {
      const start = current.startDate
        ? new Date(`${current.startDate}T08:00:00`)
        : new Date();
      const end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
      return {
        ...current,
        planId,
        originalPrice: String(plan.price),
        endDate: toDateInput(end.toISOString())
      };
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!form.startDate || !form.endDate) {
      setFormError('Informe a data de início e a data de término.');
      return;
    }

    const payload = {
      campaignName: form.campaignName,
      companyName: form.companyName,
      advertiserName: form.advertiserName,
      advertiserEmail: form.advertiserEmail,
      destinationUrl: form.destinationUrl,
      creativeDesktopUrl: form.creativeDesktopUrl,
      creativeMobileUrl: form.creativeMobileUrl,
      position: form.position,
      planId: form.planId,
      status: form.status,
      startDate: fromDateInput(form.startDate, false),
      endDate: fromDateInput(form.endDate, true),
      originalPrice: Number(form.originalPrice) || 0,
      discountAmount: Number(form.discountAmount) || 0,
      netAmountPaid: netAmount,
      referredBySellerCode: form.referredBySellerCode
    };

    setSaving(true);
    const result = editing
      ? await updateCampaign(editing.id, payload)
      : await createAdminCampaign(payload);
    setSaving(false);

    if (!result.success) {
      setFormError(result.error || 'Não foi possível gravar a campanha.');
      return;
    }

    setNotice(editing
      ? `"${form.campaignName.trim()}" atualizada no Supabase.`
      : `"${form.campaignName.trim()}" gravada em ad_campaigns. O gasto entra no painel do anunciante com este e-mail.`);
    setIsOpen(false);
  };

  const handleAdvertiserAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setAdvertiserSaving(true);
    setAdvertiserError(null);
    const result = await addAdvertiserAccount(advertiserForm);
    setAdvertiserSaving(false);
    if (!result.success) {
      setAdvertiserError(result.error || 'Não foi possível criar o acesso.');
      return;
    }
    setNotice(`Acesso do anunciante ${advertiserForm.email.trim().toLowerCase()} criado em profiles.`);
    setAdvertiserForm({ name: '', email: '', phone: '', companyName: '', password: '' });
  };

  return (
    <div className="bg-[#061827] border border-gray-800 rounded-2xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#D9A928]" />
            Campanhas Publicitárias no Portal
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Campanhas, gasto, impressões e cliques vêm da tabela ad_campaigns. O anunciante acompanha só as campanhas do próprio e-mail.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-[#D9A928] text-black font-bold text-xs flex items-center justify-center gap-1.5 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Nova campanha
        </button>
      </div>

      {campaignsSyncError && (
        <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          {campaignsSyncError}
        </p>
      )}

      <form onSubmit={handleAdvertiserAccount} className="bg-[#020B14] border border-gray-800 rounded-2xl p-4 space-y-3">
        <div>
          <h4 className="text-sm font-bold text-white">Acesso do anunciante</h4>
          <p className="text-xs text-gray-400 mt-1">
            Cria a conta em Authentication e o perfil ADVERTISER. O painel Minha Publicidade mostra o gasto das campanhas deste e-mail.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
          <input className={fieldClass} placeholder="Nome" value={advertiserForm.name} onChange={event => setAdvertiserForm({ ...advertiserForm, name: event.target.value })} required />
          <input type="email" className={fieldClass} placeholder="E-mail" value={advertiserForm.email} onChange={event => setAdvertiserForm({ ...advertiserForm, email: event.target.value })} required />
          <input className={fieldClass} placeholder="Empresa" value={advertiserForm.companyName} onChange={event => setAdvertiserForm({ ...advertiserForm, companyName: event.target.value })} required />
          <input className={fieldClass} placeholder="Telefone" value={advertiserForm.phone} onChange={event => setAdvertiserForm({ ...advertiserForm, phone: event.target.value })} />
          <input type="password" className={fieldClass} placeholder="Senha" value={advertiserForm.password} onChange={event => setAdvertiserForm({ ...advertiserForm, password: event.target.value })} autoComplete="new-password" required />
        </div>
        {advertiserError && <p className="text-xs text-red-300">{advertiserError}</p>}
        <button type="submit" disabled={advertiserSaving} className="px-4 py-2 rounded-lg bg-[#0A2238] border border-[#D9A928]/40 text-[#D9A928] text-xs font-bold disabled:opacity-50">
          {advertiserSaving ? 'Criando acesso...' : 'Cadastrar anunciante'}
        </button>
      </form>

      {notice && (
        <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
          {notice}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#020B14] text-gray-400 uppercase font-semibold border-b border-gray-800">
            <tr>
              <th className="p-3">Campanha</th>
              <th className="p-3">Empresa</th>
              <th className="p-3">Posição</th>
              <th className="p-3">Status</th>
              <th className="p-3">Valor Líquido</th>
              <th className="p-3">Consultor</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {adCampaigns.map(camp => (
              <tr key={camp.id} className="hover:bg-[#0A2238]/40">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {camp.creativeDesktopUrl && (
                      <img
                        src={camp.creativeDesktopUrl}
                        alt=""
                        className="w-16 h-10 object-cover rounded-md border border-gray-800 flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <strong className="text-white block truncate max-w-xs">{camp.campaignName}</strong>
                      <span className="text-[10px] text-gray-400 font-mono">{camp.campaignCode}</span>
                    </div>
                  </div>
                </td>
                <td className="p-3">{camp.companyName}</td>
                <td className="p-3 font-mono text-[#D9A928]">{camp.position}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusClass(camp.status)}`}>
                    {camp.status}
                  </span>
                </td>
                <td className="p-3 font-mono font-bold text-white">R$ {camp.netAmountPaid.toFixed(2)}</td>
                <td className="p-3 font-mono text-cyan-400">{camp.referredBySellerCode || '—'}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(camp)}
                      className="px-2.5 py-1 rounded bg-[#0A2238] border border-[#D9A928]/40 text-[#D9A928] hover:border-[#D9A928] text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => updateCampaignStatus(camp.id, camp.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')}
                      className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-[11px]"
                    >
                      {camp.status === 'ACTIVE' ? 'Pausar' : 'Ativar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {adCampaigns.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  Nenhuma campanha cadastrada. Use “Nova campanha” para publicar o primeiro banner.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 bg-[#020B14] flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#D9A928]" />
                {editing ? `Editar ${editing.campaignCode}` : 'Nova campanha'}
              </h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-sm">
              <label className="block">
                <span className="block text-xs font-semibold text-gray-300 mb-1">Nome da campanha</span>
                <input
                  required
                  value={form.campaignName}
                  onChange={event => setForm({ ...form, campaignName: event.target.value })}
                  className={fieldClass}
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Empresa</span>
                  <input
                    required
                    value={form.companyName}
                    onChange={event => setForm({ ...form, companyName: event.target.value })}
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Responsável</span>
                  <input
                    value={form.advertiserName}
                    onChange={event => setForm({ ...form, advertiserName: event.target.value })}
                    className={fieldClass}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">E-mail para relatórios</span>
                  <input
                    type="email"
                    value={form.advertiserEmail}
                    onChange={event => setForm({ ...form, advertiserEmail: event.target.value })}
                    className={fieldClass}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Link de destino do clique</span>
                  <input
                    required
                    type="url"
                    value={form.destinationUrl}
                    onChange={event => setForm({ ...form, destinationUrl: event.target.value })}
                    placeholder="https://"
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Posição no portal</span>
                  <select
                    value={form.position}
                    onChange={event => setForm({ ...form, position: event.target.value as AdPosition })}
                    className={fieldClass}
                  >
                    {POSITIONS.map(position => (
                      <option key={position.value} value={position.value}>{position.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Status</span>
                  <select
                    value={form.status}
                    onChange={event => setForm({ ...form, status: event.target.value as CampaignStatus })}
                    className={fieldClass}
                  >
                    {STATUSES.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Plano</span>
                  <select
                    value={form.planId}
                    onChange={event => handlePlanChange(event.target.value)}
                    className={fieldClass}
                  >
                    {adPlans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — R$ {plan.price.toLocaleString('pt-BR')}{plan.active ? '' : ' (inativo)'}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Consultor (código)</span>
                  <input
                    list="admin-seller-codes"
                    value={form.referredBySellerCode}
                    onChange={event => setForm({ ...form, referredBySellerCode: event.target.value.toUpperCase() })}
                    placeholder="Opcional"
                    className={`${fieldClass} font-mono uppercase`}
                  />
                  <datalist id="admin-seller-codes">
                    {affiliates.map(seller => (
                      <option key={seller.id} value={seller.code}>{seller.name}</option>
                    ))}
                  </datalist>
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Início</span>
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={event => setForm({ ...form, startDate: event.target.value })}
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Término</span>
                  <input
                    required
                    type="date"
                    value={form.endDate}
                    onChange={event => setForm({ ...form, endDate: event.target.value })}
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Valor bruto (R$)</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.originalPrice}
                    onChange={event => setForm({ ...form, originalPrice: event.target.value })}
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Desconto (R$)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discountAmount}
                    onChange={event => setForm({ ...form, discountAmount: event.target.value })}
                    className={fieldClass}
                  />
                </label>
              </div>

              <p className="text-xs text-[#D9A928] font-semibold">
                Valor líquido: R$ {netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>

              <div>
                <span className="block text-xs font-semibold text-gray-300 mb-1">Arte desktop (1200×300 ou similar)</span>
                <ImageUrlField
                  value={form.creativeDesktopUrl}
                  onChange={creativeDesktopUrl => setForm({ ...form, creativeDesktopUrl })}
                  folder="campanhas"
                  placeholder="URL da arte desktop"
                  inputClassName="bg-[#020B14]"
                />
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-300 mb-1">Arte mobile (opcional, usa a desktop se ficar vazia)</span>
                <ImageUrlField
                  value={form.creativeMobileUrl}
                  onChange={creativeMobileUrl => setForm({ ...form, creativeMobileUrl })}
                  folder="campanhas"
                  placeholder="URL da arte mobile"
                  inputClassName="bg-[#020B14]"
                />
              </div>

              {form.creativeDesktopUrl && (
                <img
                  src={form.creativeDesktopUrl}
                  alt="Prévia do banner"
                  className="w-full max-h-32 object-cover rounded-xl border border-gray-800"
                />
              )}

              {formError && <p className="text-xs text-red-300">{formError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[#D9A928] text-black text-xs font-bold disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Publicar campanha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
