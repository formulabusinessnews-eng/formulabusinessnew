import React, { useState } from 'react';
import { Check, Database, Edit, Pause, Play, Plus, Users, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AffiliateSeller, CommissionRecord } from '../../types';

type AffiliateForm = {
  name: string;
  email: string;
  phone: string;
  code: string;
  couponCode: string;
  commissionPercent: string;
  status: AffiliateSeller['status'];
};

const fieldClass =
  'w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none';

const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const emptyForm = (): AffiliateForm => ({
  name: '',
  email: '',
  phone: '',
  code: '',
  couponCode: '',
  commissionPercent: '10',
  status: 'ACTIVE'
});

const formFromSeller = (seller: AffiliateSeller): AffiliateForm => ({
  name: seller.name,
  email: seller.email,
  phone: seller.phone,
  code: seller.code,
  couponCode: seller.couponCode,
  commissionPercent: String(Math.round(seller.commissionRate * 10000) / 100),
  status: seller.status
});

const statusLabel: Record<AffiliateSeller['status'], string> = {
  ACTIVE: 'Ativo',
  PENDING: 'Pendente',
  INACTIVE: 'Inativo'
};

const commissionLabel: Record<CommissionRecord['status'], string> = {
  AVAILABLE: 'Disponível',
  PENDING: 'Em saque',
  PAID: 'Paga'
};

export const AdminAffiliatesSection: React.FC = () => {
  const {
    affiliates,
    commissions,
    affiliatesSyncError,
    affiliatesReady,
    addAffiliate,
    updateAffiliate,
    setAffiliateStatus,
    approveCommissionPayout,
    isPortalAdmin
  } = useApp();

  const canManage = isPortalAdmin;
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<AffiliateSeller | null>(null);
  const [form, setForm] = useState<AffiliateForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
    setIsOpen(true);
  };

  const openEdit = (seller: AffiliateSeller) => {
    setEditing(seller);
    setForm(formFromSeller(seller));
    setFormError(null);
    setIsOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      code: form.code,
      couponCode: form.couponCode || form.code,
      commissionRate: Number(form.commissionPercent) / 100,
      status: form.status
    };

    const result = editing
      ? await updateAffiliate(editing.id, payload)
      : await addAffiliate(payload);

    setSaving(false);
    if (!result.success) {
      setFormError(result.error || 'Não foi possível gravar o consultor.');
      return;
    }

    setNotice({
      tone: 'ok',
      text: editing ? `Consultor "${payload.name.trim()}" atualizado.` : `Consultor "${payload.name.trim()}" cadastrado.`
    });
    setIsOpen(false);
  };

  const handleStatus = async (seller: AffiliateSeller) => {
    const next = seller.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setNotice(null);
    const result = await setAffiliateStatus(seller.id, next);
    if (!result.success) {
      setNotice({ tone: 'error', text: result.error || 'Não foi possível alterar o status.' });
      return;
    }
    setNotice({ tone: 'ok', text: `${seller.name} ficou ${statusLabel[next].toLowerCase()}.` });
  };

  const handlePay = async (record: CommissionRecord) => {
    if (!confirm(`Registrar o pagamento de ${money(record.commissionAmount)} para ${record.sellerCode}?`)) return;
    setPayingId(record.id);
    setNotice(null);
    const result = await approveCommissionPayout(record.id);
    setPayingId(null);
    if (!result.success) {
      setNotice({ tone: 'error', text: result.error || 'Não foi possível registrar o pagamento.' });
      return;
    }
    setNotice({ tone: 'ok', text: `Comissão de ${record.sellerCode} marcada como paga.` });
  };

  const volume = affiliates.reduce((sum, seller) => sum + seller.totalSalesVolume, 0);
  const available = affiliates.reduce((sum, seller) => sum + seller.availableCommission, 0);
  const pending = affiliates.reduce((sum, seller) => sum + seller.pendingCommission, 0);
  const paid = affiliates.reduce((sum, seller) => sum + seller.paidCommission, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 bg-[#061827] p-4 rounded-xl border border-gray-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D9A928]" />
            Afiliados e comissões
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Consultores e comissões gravados nas tabelas do Supabase. A lista só mostra o que está no banco.
          </p>
          <p className="text-[11px] text-[#D9A928] mt-1 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            {isSupabaseConfigured
              ? 'Fonte: affiliate_sellers e commissions.'
              : 'Supabase não configurado: os dados ficam só neste navegador.'}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={!canManage}
          className="px-4 py-2 rounded-lg bg-[#D9A928] text-black font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" /> Novo consultor
        </button>
      </div>

      {!canManage && (
        <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          Somente o administrador pode alterar afiliados e registrar pagamentos.
        </p>
      )}
      {affiliatesSyncError && (
        <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          {affiliatesSyncError}
        </p>
      )}
      {notice && (
        <p className={`text-xs rounded-xl px-4 py-3 border ${
          notice.tone === 'ok'
            ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
            : 'text-red-300 bg-red-500/10 border-red-500/30'
        }`}>
          {notice.text}
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          ['Consultores', String(affiliates.length), 'text-white'],
          ['Volume vendido', money(volume), 'text-[#38BDF8]'],
          ['Disponível', money(available), 'text-emerald-400'],
          ['Em saque', money(pending), 'text-amber-400'],
          ['Pago', money(paid), 'text-white']
        ].map(([label, value, color]) => (
          <div key={label} className="bg-[#061827] border border-gray-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase text-gray-400 font-semibold">{label}</span>
            <div className={`text-lg font-bold mt-1 ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#061827] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Consultores</h4>
        </div>
        {!affiliatesReady ? (
          <p className="p-6 text-xs text-gray-400">Carregando consultores do Supabase...</p>
        ) : affiliates.length === 0 ? (
          <p className="p-6 text-xs text-gray-400">
            Nenhum consultor em affiliate_sellers. Cadastre o primeiro para ele aparecer aqui e no painel do afiliado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#020B14] text-gray-400 uppercase">
                <tr>
                  <th className="p-3">Consultor</th>
                  <th className="p-3">Código</th>
                  <th className="p-3">Cupom</th>
                  <th className="p-3">Taxa</th>
                  <th className="p-3">Clientes</th>
                  <th className="p-3">Volume</th>
                  <th className="p-3">Disponível</th>
                  <th className="p-3">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {affiliates.map(seller => (
                  <tr key={seller.id}>
                    <td className="p-3">
                      <div className="text-white font-semibold">{seller.name}</div>
                      <div className="text-[11px] text-gray-500">{seller.email}</div>
                    </td>
                    <td className="p-3 font-mono text-[#D9A928]">{seller.code}</td>
                    <td className="p-3 font-mono">{seller.couponCode}</td>
                    <td className="p-3">{Math.round(seller.commissionRate * 100)}%</td>
                    <td className="p-3">{seller.totalReferredClients}</td>
                    <td className="p-3">{money(seller.totalSalesVolume)}</td>
                    <td className="p-3 text-emerald-400">{money(seller.availableCommission)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        seller.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : seller.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'bg-gray-800 text-gray-400'
                      }`}>
                        {statusLabel[seller.status]}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(seller)}
                          disabled={!canManage}
                          className="p-1.5 rounded text-gray-300 hover:bg-gray-800 disabled:opacity-40"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatus(seller)}
                          disabled={!canManage}
                          className="p-1.5 rounded text-gray-300 hover:bg-gray-800 disabled:opacity-40"
                          title={seller.status === 'ACTIVE' ? 'Inativar' : 'Ativar'}
                        >
                          {seller.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-[#061827] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Comissões</h4>
        </div>
        {!affiliatesReady ? (
          <p className="p-6 text-xs text-gray-400">Carregando comissões do Supabase...</p>
        ) : commissions.length === 0 ? (
          <p className="p-6 text-xs text-gray-400">
            Nenhuma comissão em commissions. Elas entram quando um anunciante paga com o cupom de um consultor.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#020B14] text-gray-400 uppercase">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Consultor</th>
                  <th className="p-3">Campanha</th>
                  <th className="p-3">Anunciante</th>
                  <th className="p-3">Líquido pago</th>
                  <th className="p-3">Comissão</th>
                  <th className="p-3">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {commissions.map(record => (
                  <tr key={record.id}>
                    <td className="p-3 font-mono text-gray-400">
                      {new Date(record.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 font-mono text-[#D9A928]">{record.sellerCode}</td>
                    <td className="p-3 font-mono">{record.campaignCode}</td>
                    <td className="p-3 text-white">{record.advertiserName}</td>
                    <td className="p-3">{money(record.netPaidAmount)}</td>
                    <td className="p-3 font-bold text-[#D9A928]">{money(record.commissionAmount)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        record.status === 'PAID'
                          ? 'bg-blue-500/10 text-blue-300'
                          : record.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {commissionLabel[record.status]}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {record.status !== 'PAID' && (
                        <button
                          type="button"
                          onClick={() => handlePay(record)}
                          disabled={!canManage || payingId === record.id}
                          className="px-2.5 py-1 rounded-lg bg-[#0A2238] border border-[#D9A928]/40 text-[#D9A928] font-bold text-[11px] inline-flex items-center gap-1 disabled:opacity-40"
                        >
                          <Check className="w-3 h-3" />
                          {payingId === record.id ? 'Salvando' : 'Marcar paga'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-[#061827] border border-gray-700 rounded-2xl w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">
                {editing ? 'Editar consultor' : 'Novo consultor'}
              </h4>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="space-y-1 sm:col-span-2">
                <span className="text-gray-400">Nome</span>
                <input className={fieldClass} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} required />
              </label>
              <label className="space-y-1">
                <span className="text-gray-400">E-mail</span>
                <input type="email" className={fieldClass} value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} required />
              </label>
              <label className="space-y-1">
                <span className="text-gray-400">Telefone</span>
                <input className={fieldClass} value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} />
              </label>
              <label className="space-y-1">
                <span className="text-gray-400">Código de indicação</span>
                <input className={fieldClass} value={form.code} onChange={event => setForm({ ...form, code: event.target.value.toUpperCase() })} required />
              </label>
              <label className="space-y-1">
                <span className="text-gray-400">Cupom</span>
                <input className={fieldClass} value={form.couponCode} onChange={event => setForm({ ...form, couponCode: event.target.value.toUpperCase() })} placeholder="Igual ao código, se vazio" />
              </label>
              <label className="space-y-1">
                <span className="text-gray-400">Comissão (%)</span>
                <input type="number" min="0" max="100" step="0.01" className={fieldClass} value={form.commissionPercent} onChange={event => setForm({ ...form, commissionPercent: event.target.value })} required />
              </label>
              <label className="space-y-1">
                <span className="text-gray-400">Status</span>
                <select className={fieldClass} value={form.status} onChange={event => setForm({ ...form, status: event.target.value as AffiliateSeller['status'] })}>
                  <option value="ACTIVE">Ativo</option>
                  <option value="PENDING">Pendente</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </label>
            </div>

            {formError && <p className="text-xs text-red-300">{formError}</p>}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-lg text-xs text-gray-300">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[#D9A928] text-black text-xs font-bold disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar no Supabase'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
