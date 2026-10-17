import React, { useState } from 'react';
import { Database, Edit, Pause, Play, Plus, Tag, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Coupon } from '../../types';

type CouponForm = {
  code: string;
  discountMode: 'percent' | 'fixed';
  discountPercent: string;
  discountFixed: string;
  minPurchaseValue: string;
  firstPurchaseOnly: boolean;
  sellerOwnerCode: string;
  active: boolean;
  expiresAt: string;
  maxUses: string;
};

const fieldClass =
  'w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none [color-scheme:dark]';

const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const dateInputValue = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const endOfSelectedDay = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59).toISOString();
};

const defaultExpiry = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return dateInputValue(date.toISOString());
};

const emptyForm = (): CouponForm => ({
  code: '',
  discountMode: 'percent',
  discountPercent: '10',
  discountFixed: '',
  minPurchaseValue: '',
  firstPurchaseOnly: false,
  sellerOwnerCode: '',
  active: true,
  expiresAt: defaultExpiry(),
  maxUses: ''
});

const formFromCoupon = (coupon: Coupon): CouponForm => {
  const fixed = coupon.discountFixed && coupon.discountFixed > 0;
  return {
    code: coupon.code,
    discountMode: fixed && coupon.discountPercent <= 0 ? 'fixed' : 'percent',
    discountPercent: String(coupon.discountPercent || 0),
    discountFixed: fixed ? String(coupon.discountFixed) : '',
    minPurchaseValue: coupon.minPurchaseValue ? String(coupon.minPurchaseValue) : '',
    firstPurchaseOnly: coupon.firstPurchaseOnly,
    sellerOwnerCode: coupon.sellerOwnerCode || '',
    active: coupon.active,
    expiresAt: dateInputValue(coupon.expiresAt),
    maxUses: coupon.maxUses ? String(coupon.maxUses) : ''
  };
};

const formatDay = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Sem validade';
  return date.toLocaleDateString('pt-BR');
};

const couponStatus = (coupon: Coupon) => {
  if (!coupon.active) return { label: 'Pausado', className: 'bg-gray-800 text-gray-400' };
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { label: 'Expirado', className: 'bg-red-500/10 text-red-300' };
  }
  if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
    return { label: 'Esgotado', className: 'bg-amber-500/10 text-amber-300' };
  }
  return { label: 'Ativo', className: 'bg-emerald-500/10 text-emerald-400' };
};

const discountLabel = (coupon: Coupon) => {
  if (coupon.discountFixed && coupon.discountFixed > 0 && coupon.discountPercent <= 0) {
    return `${money(coupon.discountFixed)} OFF`;
  }
  return `${coupon.discountPercent}% OFF`;
};

export const AdminCouponsSection: React.FC = () => {
  const {
    coupons,
    affiliates,
    addCoupon,
    updateCoupon,
    toggleCouponActive,
    deleteCoupon,
    couponsSyncError,
    isPortalAdmin
  } = useApp();

  const canManage = isPortalAdmin;
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);

  const sellerOptions = Array.from(new Set([
    ...affiliates.map(seller => seller.code),
    ...(form.sellerOwnerCode && !affiliates.some(seller => seller.code === form.sellerOwnerCode)
      ? [form.sellerOwnerCode]
      : [])
  ]));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
    setIsOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setForm(formFromCoupon(coupon));
    setFormError(null);
    setIsOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    const percent = form.discountMode === 'percent' ? Number(form.discountPercent) : 0;
    const fixed = form.discountMode === 'fixed' ? Number(form.discountFixed) : 0;
    const payload = {
      code: form.code,
      discountPercent: percent,
      discountFixed: fixed,
      minPurchaseValue: form.minPurchaseValue.trim() ? Number(form.minPurchaseValue) : undefined,
      firstPurchaseOnly: form.firstPurchaseOnly,
      sellerOwnerCode: form.sellerOwnerCode || undefined,
      active: form.active,
      expiresAt: form.expiresAt ? endOfSelectedDay(form.expiresAt) : '',
      maxUses: form.maxUses.trim() ? Number(form.maxUses) : undefined
    };

    const result = editing
      ? await updateCoupon(editing.id, payload)
      : await addCoupon(payload);

    setSaving(false);
    if (!result.success) {
      setFormError(result.error || 'Não foi possível gravar o cupom.');
      return;
    }

    const code = form.code.trim().toUpperCase();
    setNotice({
      tone: 'ok',
      text: editing ? `Cupom "${code}" atualizado.` : `Cupom "${code}" criado.`
    });
    setIsOpen(false);
  };

  const handleToggle = async (coupon: Coupon) => {
    setNotice(null);
    const result = await toggleCouponActive(coupon.id);
    if (!result.success) {
      setNotice({ tone: 'error', text: result.error || 'Não foi possível alterar o cupom.' });
      return;
    }
    setNotice({
      tone: 'ok',
      text: coupon.active ? `"${coupon.code}" pausado.` : `"${coupon.code}" ativado.`
    });
  };

  const handleDelete = async (coupon: Coupon) => {
    const sellerNote = coupon.sellerOwnerCode
      ? `\n\nEle está ligado ao consultor ${coupon.sellerOwnerCode}. As comissões já geradas permanecem.`
      : '';
    if (!confirm(`Excluir o cupom "${coupon.code}"?${sellerNote}`)) return;

    setNotice(null);
    const result = await deleteCoupon(coupon.id);
    if (!result.success) {
      setNotice({ tone: 'error', text: result.error || 'Não foi possível excluir o cupom.' });
      return;
    }
    setNotice({ tone: 'ok', text: `"${coupon.code}" excluído.` });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 bg-[#061827] p-4 rounded-xl border border-gray-800">
        <div>
          <h3 className="text-sm font-bold text-white">Cupons de desconto</h3>
          <p className="text-xs text-gray-400">
            Crie, edite e exclua os códigos usados na contratação de anúncios.
          </p>
          <p className="text-[11px] text-[#D9A928] mt-1 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            {isSupabaseConfigured
              ? 'Os cupons ficam gravados no Supabase e valem no checkout.'
              : 'Supabase não configurado: os cupons ficam só neste navegador.'}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={!canManage}
          className="px-4 py-2 rounded-lg bg-[#D9A928] text-black font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" /> Novo cupom
        </button>
      </div>

      {!canManage && (
        <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          Somente o administrador pode alterar os cupons de desconto.
        </p>
      )}
      {couponsSyncError && (
        <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          {couponsSyncError}
        </p>
      )}
      {notice && (
        <p className={`text-xs rounded-xl px-4 py-3 border ${
          notice.tone === 'error'
            ? 'text-red-300 bg-red-500/10 border-red-500/30'
            : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
        }`}>
          {notice.text}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {coupons.map(coupon => {
          const status = couponStatus(coupon);
          const seller = affiliates.find(item => item.code === coupon.sellerOwnerCode);
          return (
            <article key={coupon.id} className="bg-[#061827] border border-gray-800 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${status.className}`}>
                      {status.label}
                    </span>
                    {coupon.firstPurchaseOnly && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#0A2238] text-[#38BDF8]">
                        1ª compra
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-extrabold text-white mt-2 font-mono tracking-wide">{coupon.code}</h4>
                </div>
                <Tag className="w-5 h-5 text-[#D9A928] flex-shrink-0" />
              </div>

              <div>
                <div className="text-2xl font-extrabold text-[#D9A928]">{discountLabel(coupon)}</div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Válido até {formatDay(coupon.expiresAt)}
                  {coupon.minPurchaseValue ? ` · mínimo ${money(coupon.minPurchaseValue)}` : ''}
                </p>
              </div>

              <p className="text-xs text-gray-300">
                {coupon.usesCount} {coupon.maxUses ? `de ${coupon.maxUses}` : ''} {coupon.usesCount === 1 ? 'uso' : 'usos'}
                {seller ? ` · consultor ${seller.name}` : coupon.sellerOwnerCode ? ` · consultor ${coupon.sellerOwnerCode}` : ' · cupom promocional'}
              </p>

              <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-gray-800 mt-auto">
                <button
                  type="button"
                  onClick={() => handleToggle(coupon)}
                  disabled={!canManage}
                  className="px-3 py-1.5 rounded-lg bg-[#0A2238] border border-gray-700 text-gray-200 text-[11px] font-bold inline-flex items-center gap-1.5 disabled:opacity-40"
                >
                  {coupon.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {coupon.active ? 'Pausar' : 'Ativar'}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(coupon)}
                  disabled={!canManage}
                  className="px-3 py-1.5 rounded-lg bg-[#0A2238] border border-gray-700 text-gray-200 text-[11px] font-bold inline-flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Edit className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(coupon)}
                  disabled={!canManage}
                  className="px-3 py-1.5 rounded-lg text-red-300 hover:bg-red-500/10 text-[11px] font-bold inline-flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {coupons.length === 0 && (
        <div className="bg-[#061827] border border-dashed border-gray-700 rounded-2xl p-8 text-center text-sm text-gray-400">
          Nenhum cupom cadastrado. Crie o primeiro para liberar descontos no checkout.
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 bg-[#020B14] flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#D9A928]" />
                {editing ? 'Editar cupom' : 'Novo cupom'}
              </h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-sm">
              <label className="block">
                <span className="block text-xs font-semibold text-gray-300 mb-1">Código</span>
                <input
                  required
                  value={form.code}
                  onChange={event => setForm({ ...form, code: event.target.value.toUpperCase() })}
                  placeholder="Ex.: BEMVINDO10"
                  className={`${fieldClass} font-mono uppercase`}
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Tipo de desconto</span>
                  <select
                    value={form.discountMode}
                    onChange={event => setForm({ ...form, discountMode: event.target.value as CouponForm['discountMode'] })}
                    className={fieldClass}
                  >
                    <option value="percent">Percentual (%)</option>
                    <option value="fixed">Valor fixo (R$)</option>
                  </select>
                </label>
                {form.discountMode === 'percent' ? (
                  <label className="block">
                    <span className="block text-xs font-semibold text-gray-300 mb-1">Desconto (%)</span>
                    <input
                      required
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      value={form.discountPercent}
                      onChange={event => setForm({ ...form, discountPercent: event.target.value })}
                      className={fieldClass}
                    />
                  </label>
                ) : (
                  <label className="block">
                    <span className="block text-xs font-semibold text-gray-300 mb-1">Desconto (R$)</span>
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.discountFixed}
                      onChange={event => setForm({ ...form, discountFixed: event.target.value })}
                      className={fieldClass}
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Compra mínima (R$)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minPurchaseValue}
                    onChange={event => setForm({ ...form, minPurchaseValue: event.target.value })}
                    placeholder="Opcional"
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Válido até</span>
                  <input
                    required
                    type="date"
                    value={form.expiresAt}
                    onChange={event => setForm({ ...form, expiresAt: event.target.value })}
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Limite de usos</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.maxUses}
                    onChange={event => setForm({ ...form, maxUses: event.target.value })}
                    placeholder="Ilimitado"
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Consultor vinculado</span>
                  <select
                    value={form.sellerOwnerCode}
                    onChange={event => setForm({ ...form, sellerOwnerCode: event.target.value })}
                    className={fieldClass}
                  >
                    <option value="">Nenhum — cupom promocional</option>
                    {sellerOptions.map(code => {
                      const seller = affiliates.find(item => item.code === code);
                      return (
                        <option key={code} value={code}>
                          {seller ? `${seller.name} (${code})` : code}
                        </option>
                      );
                    })}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-200">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={event => setForm({ ...form, active: event.target.checked })}
                    className="accent-[#D9A928]"
                  />
                  Cupom ativo no checkout
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.firstPurchaseOnly}
                    onChange={event => setForm({ ...form, firstPurchaseOnly: event.target.checked })}
                    className="accent-[#D9A928]"
                  />
                  Somente na primeira compra
                </label>
              </div>

              {editing && (
                <p className="text-[11px] text-gray-500">
                  Este cupom já foi usado {editing.usesCount} {editing.usesCount === 1 ? 'vez' : 'vezes'}. O contador não é alterado na edição.
                </p>
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
                  disabled={saving || !canManage}
                  className="px-4 py-2 rounded-lg bg-[#D9A928] text-black text-xs font-bold disabled:opacity-60"
                >
                  {saving ? 'Gravando...' : editing ? 'Salvar alterações' : 'Criar cupom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
