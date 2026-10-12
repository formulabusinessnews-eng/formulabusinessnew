import React, { useState } from 'react';
import { Plus, Trash2, Edit, X, Newspaper, Database } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NewsItem } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';
import { slugifyNewsTitle } from '../../lib/newsStore';
import { ImageUrlField } from './ImageUrlField';

type NewsForm = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  author: string;
  status: NewsItem['status'];
  featured: boolean;
  breakingNews: boolean;
  readTime: string;
  tags: string;
  republishOnTop: boolean;
};

const emptyForm = (category: string): NewsForm => ({
  title: '',
  excerpt: '',
  content: '',
  category,
  imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
  author: 'Redação Fórmula Business',
  status: 'PUBLISHED',
  featured: false,
  breakingNews: false,
  readTime: '4 min',
  tags: '',
  republishOnTop: false
});

const statusLabel: Record<NewsItem['status'], string> = {
  PUBLISHED: 'Publicada',
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendada'
};

export const AdminNewsSection: React.FC = () => {
  const {
    news,
    categories,
    addNews,
    updateNews,
    deleteNews,
    republishEditorialNews,
    newsSyncError
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [form, setForm] = useState<NewsForm>(emptyForm(categories[0]?.name || 'Business'));
  const [saving, setSaving] = useState(false);
  const [republishing, setRepublishing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(categories[0]?.name || 'Business'));
    setFormError(null);
    setIsOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      category: item.category,
      imageUrl: item.imageUrl,
      author: item.author,
      status: item.status,
      featured: Boolean(item.featured),
      breakingNews: Boolean(item.breakingNews),
      readTime: item.readTime,
      tags: item.tags.join(', '),
      republishOnTop: false
    });
    setFormError(null);
    setIsOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    const tags = form.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    let slug = editing?.slug || slugifyNewsTitle(form.title);
    if (!editing && news.some(item => item.slug === slug)) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const payload = {
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      category: form.category,
      imageUrl: form.imageUrl.trim(),
      author: form.author.trim(),
      publishedAt: !editing || form.republishOnTop ? new Date().toISOString() : editing.publishedAt,
      status: form.status,
      featured: form.featured,
      breakingNews: form.breakingNews,
      readTime: form.readTime.trim() || '4 min',
      tags
    };

    try {
      if (editing) {
        await updateNews(editing.id, payload);
        setNotice(`"${payload.title}" atualizada no Supabase.`);
      } else {
        await addNews(payload);
        setNotice(`"${payload.title}" publicada no Supabase e colocada no topo do site.`);
      }
      setIsOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível gravar a notícia.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: NewsItem) => {
    if (!confirm(`Excluir a matéria "${item.title}"?`)) return;
    setFormError(null);
    try {
      await deleteNews(item.id);
      setNotice('Matéria excluída do Supabase.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível excluir a notícia.');
    }
  };

  const handleRepublish = async () => {
    setRepublishing(true);
    setNotice(null);
    try {
      await republishEditorialNews();
      setNotice('Acervo republicado no topo do site e gravado no Supabase.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível republicar o acervo.');
    } finally {
      setRepublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 bg-[#061827] p-4 rounded-xl border border-gray-800">
        <div>
          <h3 className="text-sm font-bold text-white">Acervo Editorial de Notícias</h3>
          <p className="text-xs text-gray-400">Gerencie matérias, destaques, categorias e SEO.</p>
          <p className="text-[11px] text-[#D9A928] mt-1 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            {isSupabaseConfigured
              ? 'Novas publicações e edições ficam gravadas no Supabase.'
              : 'Supabase não configurado: as matérias ficam só neste navegador.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRepublish}
            disabled={republishing || !isSupabaseConfigured}
            className="px-4 py-2 rounded-lg bg-[#0A2238] border border-[#D9A928]/40 text-[#D9A928] font-bold text-xs disabled:opacity-50"
          >
            {republishing ? 'Republicando...' : 'Republicar acervo no topo'}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 rounded-lg bg-[#D9A928] text-black font-bold text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Notícia
          </button>
        </div>
      </div>

      {newsSyncError && (
        <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          {newsSyncError}
        </p>
      )}
      {notice && (
        <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
          {notice}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.map(item => (
          <div key={item.id} className="bg-[#061827] border border-gray-800 rounded-xl p-4 flex gap-4">
            <img src={item.imageUrl} alt="" className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#D9A928] uppercase">{item.category}</span>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    item.status === 'PUBLISHED'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    {statusLabel[item.status]}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-2 mt-0.5">{item.title}</h4>
                <span className="text-[10px] text-gray-400">{item.author} • {item.views} visualizações</span>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="text-gray-300 hover:text-[#D9A928] p-1"
                  title="Editar notícia"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Excluir notícia"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#061827] border border-[#D9A928]/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 bg-[#020B14] flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#D9A928]" />
                {editing ? 'Editar notícia' : 'Nova notícia'}
              </h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-sm">
              <label className="block">
                <span className="block text-xs font-semibold text-gray-300 mb-1">Título</span>
                <input
                  required
                  value={form.title}
                  onChange={event => setForm({ ...form, title: event.target.value })}
                  className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-gray-300 mb-1">Linha fina</span>
                <textarea
                  required
                  rows={2}
                  value={form.excerpt}
                  onChange={event => setForm({ ...form, excerpt: event.target.value })}
                  className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-gray-300 mb-1">Texto da matéria</span>
                <textarea
                  required
                  rows={6}
                  value={form.content}
                  onChange={event => setForm({ ...form, content: event.target.value })}
                  className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Editoria</span>
                  <select
                    value={form.category}
                    onChange={event => setForm({ ...form, category: event.target.value })}
                    className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Autor</span>
                  <input
                    required
                    value={form.author}
                    onChange={event => setForm({ ...form, author: event.target.value })}
                    className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Status</span>
                  <select
                    value={form.status}
                    onChange={event => setForm({ ...form, status: event.target.value as NewsItem['status'] })}
                    className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                  >
                    <option value="PUBLISHED">Publicada</option>
                    <option value="DRAFT">Rascunho</option>
                    <option value="SCHEDULED">Agendada</option>
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-300 mb-1">Tempo de leitura</span>
                  <input
                    required
                    value={form.readTime}
                    onChange={event => setForm({ ...form, readTime: event.target.value })}
                    className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="block text-xs font-semibold text-gray-300 mb-1">Tags (separadas por vírgula)</span>
                <input
                  value={form.tags}
                  onChange={event => setForm({ ...form, tags: event.target.value })}
                  className="w-full bg-[#020B14] border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#D9A928] focus:outline-none"
                />
              </label>

              <div>
                <span className="block text-xs font-semibold text-gray-300 mb-1">Imagem de capa</span>
                <ImageUrlField
                  value={form.imageUrl}
                  onChange={imageUrl => setForm({ ...form, imageUrl })}
                  folder="noticias"
                  inputClassName="bg-[#020B14]"
                />
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-200">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={event => setForm({ ...form, featured: event.target.checked })}
                    className="accent-[#D9A928]"
                  />
                  Destaque
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.breakingNews}
                    onChange={event => setForm({ ...form, breakingNews: event.target.checked })}
                    className="accent-[#D9A928]"
                  />
                  Última hora
                </label>
                {editing && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.republishOnTop}
                      onChange={event => setForm({ ...form, republishOnTop: event.target.checked })}
                      className="accent-[#D9A928]"
                    />
                    Republicar no topo do site
                  </label>
                )}
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
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[#D9A928] text-black text-xs font-bold disabled:opacity-60"
                >
                  {saving ? 'Gravando...' : editing ? 'Salvar alterações' : 'Publicar no Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
