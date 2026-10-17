import React, { useState } from 'react';
import { Database, DollarSign, Edit, Plus, Star, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AdPlan } from '../../types';

type PlanForm = {
  name: string;
  durationDays: string;
  price: string;
  discountPercentage: string;
  description: string;
  active: boolean;
  highlighted: boolean;
};

const emptyForm = (): PlanForm => ({
  name: '',
  durationDays: '7',
  price: '',
  discountPercentage: '0',
  description: '',
  active: true,
  highlighted: false
});

const formFromPlan = (plan: AdPlan): PlanForm => ({
  name: plan.name,
  durationDays: String(plan.durationDays),
  price: String(plan.price),
  discountPercentage: String(plan.discountPercentage),
  description: plan.description,
  active: plan.active,
  highlighted: Boolean(plan.highlighted)
});

const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fieldClass =
  'w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none';

export const AdminPlansSection: React.FC = () => {
  const {
    adPlans,
    adCampaigns,
    addAdPlan,
    updateAdPlan,
    deleteAdPlan,
    adPlansSyncError,
    isPortalAdmin
  } = useApp();

  const canManage = isPortalAdmin;
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<AdPlan | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
    setIsOpen(true);
  };

  const openEdit = (plan: AdPlan) => {
    setEditing(plan);
    setForm(formFromPlan(plan));
    setFormError(null);
    setIsOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    const payload = {
      name: form.name,
      durationDays: Number(form.durationDays),
      price: Number(form.price),
      discountPercentage: Number(form.discountPercentage),
      description: form.description,
      active: form.active,
      highlighted: form.highlighted
    };

    const result = editing
      ? await updateAdPlan(editing.id, payload)
      : await addAdPlan(payload);

    setSaving(false);
    if (!result.success) {
      setFormError(result.error || 'Não foi possível gravar o pacote.');
      return;
    }

    setNotice(editing ? `"${form.name.trim()}" atualizado.` : `"${form.name.trim()}" criado.`);
    setIsOpen(false);
  };

  const handleDelete = async (plan: AdPlan) => {
    const linked = adCampaigns.filter(campaign => campaign.planId === plan.id).length;
    const warning = linked
      ? `\n\n${linked} campanha(s) já contratada(s) neste pacote continuam com o valor que foi cobrado.`
      : '';
    if (!confirm(`Excluir o pacote "${plan.name}"?${warning}`)) return;

    setNotice(null);
    const result = await deleteAdPlan(plan.id);
    if (!result.success) {
      setNotice(result.error || 'Não foi possível excluir o pacote.');
      return;
    }
    setNotice(`"${plan.name}" excluído.`);
  };

  const previewPrice = Number(form.price);
  const previewDays = Number(form.durationDays);
  const daily = previewDays > 0 && Number.isFinite(previewPrice) ? previewPrice / previewDays : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 bg-[#061827] p-4 rounded-xl border border-gray-800">
        <div>
          <h3 className="text-sm font-bold text-white">Pacotes de anúncio</h3>
          <p className="text-xs text-gray-400">
            Crie, altere o valor e exclua os pacotes que o anunciante contrata no portal.
          </p>
          <p className="text-[11px] text-[#D9A928] mt-1 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            {isSupabaseConfigured
              ? 'Os valores ficam gravados no Supabase e valem para quem anuncia.'
              : 'Supabase não configurado: os pacotes ficam só neste navegador.'}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={!canManage}
          className="px-4 py-2 rounded-lg bg-[#D9A928] text-black font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" /> Novo pacote
        </button>
      </div>

      {!canManage && (
        <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          Somente o administrador pode alterar os pacotes de anúncio.
        </p>
      )}
      {adPlansSyncError && (
        <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          {adPlansSyncError}
        </p>
      )}
      {notice && (
        <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
          {notice}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {adPlans.map(plan => {
          const linked = adCampaigns.filter(campaign => campaign.planId === plan.id).length;
          const perDay = plan.durationDays > 0 ? plan.price / plan.durationDays : plan.price;
          return (
            <article key={plan.id} className="bg-[#061827] border border-gray-800 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      plan.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {plan.active ? 'Ativo' : 'Inativo'}
                    </span>
                    {plan.highlighted && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#D9A928] text-black inline-flex items-center gap-1">
                        <Star className="w-3 h-3" /> Destaque
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">{plan.name}</h4>
                </div>
                <DollarSign className="w-5 h-5 text-[#D9A928] flex-shrink-0" />
              </div>

              <div>
                <div className="text-2xl font-extrabold text-[#D9A928]">{money(plan.price)}</div>
                <p className="text-[11px] text-gray-400 mt-1">
                  {plan.durationDays} {plan.durationDays === 1 ? 'dia' : 'dias'} · {money(perDay)} / dia
                  {plan.discountPercentage > 0 ? ` · ${plan.discountPercentage}% de economia` : ''}
                </p>
              </div>

              <p className="text-xs text-gray-300 line-clamp-3 flex-1">{plan.description}</p>
              <p className="text-[11px] text-gray-500">
                {linked === 0 ? 'Nenhuma campanha vinculada' : `${linked} campanha(s) já usaram este pacote`}
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => openEdit(plan)}
                  disabled={!canManage}
                  className="px-3 py-1.5 rounded-lg bg-[#0A2238] border border-gray-700 text-gray-200 text-[11px] font-bold inline-flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Edit className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(plan)}
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

      {adPlans.length === 0 && (
        <div className="bg-[#061827] border border-dashed border-gray-700 rounded-2xl p-8 text-center text-sm text-gray-400">
          Nenhum pacote cadastrado. Crie o primeiro para liberar a contratação de anúncios.
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 bg-[#020B14] flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#D9A928]" />
                {editing ? 'Editar pacote' : 'Novo pacote'}
              </h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-sm">
              <label className="block">
                <span className="block text-xs font-semibold text-gray-300 mb-1">Nome do pacote</span>
                <input
                  required
                  value={form.name}
                  onChange={event => setForm({ ...form, name: event.target.value })}
                  placeholder="Ex.: 7 Dias — Semana Executiva"
                  className={fieldClass}
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Duração (dias)</span>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={form.durationDays}
                    onChange={event => setForm({ ...form, durationDays: event.target.value })}
                    className={fieldClass}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Valor cobrado (R$)</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={event => setForm({ ...form, price: event.target.value })}
                    className={fieldClass}
                  />
                </label>
              </div>

              <label className="block">
                <span className="block text-xs font-semibold text-gray-300 mb-1">Economia exibida (%)</span>
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={form.discountPercentage}
                  onChange={event => setForm({ ...form, discountPercentage: event.target.value })}
                  className={fieldClass}
                />
                <span className="block text-[11px] text-gray-500 mt-1">
                  O anunciante paga o valor cobrado. Este percentual só aparece como economia do pacote.
                </span>
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-gray-300 mb-1">Descrição</span>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={event => setForm({ ...form, description: event.target.value })}
                  className={fieldClass}
                />
              </label>

              {form.price.trim() !== '' && Number.isFinite(previewPrice) && previewPrice >= 0 && previewDays > 0 && (
                <p className="text-xs text-[#D9A928] bg-[#D9A928]/10 border border-[#D9A928]/30 rounded-lg px-3 py-2">
                  O anunciante verá {money(previewPrice)} por {previewDays} {previewDays === 1 ? 'dia' : 'dias'} ({money(daily)} por dia).
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-gray-200">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={event => setForm({ ...form, active: event.target.checked })}
                    className="accent-[#D9A928]"
                  />
                  Disponível para contratação
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.highlighted}
                    onChange={event => setForm({ ...form, highlighted: event.target.checked })}
                    className="accent-[#D9A928]"
                  />
                  Marcar como destaque
                </label>
              </div>

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
                  {saving ? 'Gravando...' : editing ? 'Salvar alterações' : 'Criar pacote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
