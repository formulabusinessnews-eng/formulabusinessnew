import React from 'react';
import { 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Facebook, 
  ArrowUpRight, 
  Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const Footer: React.FC<Props> = ({ onNavigateTab }) => {
  const { t, siteSettings, setIsAdCheckoutOpen } = useApp();

  return (
    <footer className="w-full bg-[#02070D] border-t border-[#0A2238] text-white pt-16 pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Top CTA Banner: "SUA MARCA EM EVIDÊNCIA" */}
        <div className="bg-gradient-to-r from-[#061827] via-[#0A2238] to-[#061827] border border-[#D9A928]/40 rounded-3xl p-8 mb-16 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#D9A928] font-bold">
              Oportunidade Comercial • Audiência Qualificada
            </span>
            <h3 className="text-xl md:text-3xl font-extrabold text-white font-heading">
              {t.ads.evidenceTitle}
            </h3>
            <p className="text-xs md:text-sm text-gray-300 max-w-xl">
              {t.ads.evidenceSubtitle}
            </p>
          </div>

          <button
            onClick={() => setIsAdCheckoutOpen(true)}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D9A928] to-[#F3C64B] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-[#D9A928]/25 hover:scale-105 active:scale-95 transition flex-shrink-0"
          >
            <span>{t.ads.explorePlans}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-900 text-xs">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {siteSettings.logoUrl ? (
                <img src={siteSettings.logoUrl} alt="Logo" className="h-10 object-contain" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-[#D9A928] text-black font-serif font-black flex items-center justify-center text-lg">
                  F
                </div>
              )}
              <span className="font-heading font-extrabold text-base tracking-tight text-white">
                FÓRMULA <span className="text-[#D9A928]">BUSINESS</span>
              </span>
            </div>

            <p className="text-gray-400 leading-relaxed">
              {t.footer.about}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href={siteSettings.instagramUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-[#061827] text-gray-400 hover:text-[#D9A928] border border-gray-800 transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={siteSettings.linkedinUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-[#061827] text-gray-400 hover:text-[#D9A928] border border-gray-800 transition">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href={siteSettings.youtubeUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-[#061827] text-gray-400 hover:text-[#D9A928] border border-gray-800 transition">
                <Youtube className="w-4 h-4" />
              </a>
              <a href={siteSettings.facebookUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-[#061827] text-gray-400 hover:text-[#D9A928] border border-gray-800 transition">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Editorias / Seções */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.footer.sections}
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => onNavigateTab('business')} className="hover:text-[#D9A928] transition">Business & Liderança</button></li>
              <li><button onClick={() => onNavigateTab('empreendedorismo')} className="hover:text-[#D9A928] transition">Empreendedorismo & Startups</button></li>
              <li><button onClick={() => onNavigateTab('tecnologia-inovacao')} className="hover:text-[#D9A928] transition">Tecnologia, IA & Nuvem</button></li>
              <li><button onClick={() => onNavigateTab('beleza-estetica')} className="hover:text-[#D9A928] transition">Beleza, Estética & Longevidade</button></li>
              <li><button onClick={() => onNavigateTab('economia')} className="hover:text-[#D9A928] transition">Economia & Mercado Financeiro</button></li>
              <li><button onClick={() => onNavigateTab('revista')} className="hover:text-[#D9A928] transition text-[#D9A928] font-bold">Revista Digital Oficial 3D</button></li>
            </ul>
          </div>

          {/* Col 3: Institucional & Governança */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.footer.institutional}
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#sobre" className="hover:text-white transition">Quem Somos & Linha Editorial</a></li>
              <li><a href="#politica" className="hover:text-white transition">{t.footer.privacy}</a></li>
              <li><a href="#termos" className="hover:text-white transition">{t.footer.terms}</a></li>
              <li><a href="#ouvidoria" className="hover:text-white transition">{t.footer.ombudsman}</a></li>
              <li><a href="#carreiras" className="hover:text-white transition">{t.footer.careers}</a></li>
              <li><button onClick={() => onNavigateTab('seller')} className="hover:text-[#D9A928] transition text-[#D9A928]">Programa de Consultores & Afiliados (10%)</button></li>
            </ul>
          </div>

          {/* Col 4: Atendimento & Comercial */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.footer.contact}
            </h4>
            <div className="space-y-2.5 text-gray-400">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D9A928]" />
                <span>{siteSettings.contactEmail}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D9A928]" />
                <span>{siteSettings.contactPhone}</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D9A928]" />
                <span>Av. Paulista, 1800 — São Paulo/SP</span>
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsAdCheckoutOpen(true)}
                  className="w-full py-2 bg-[#0A2238] border border-[#D9A928]/40 hover:border-[#D9A928] text-white rounded-lg font-semibold text-center transition"
                >
                  Anunciar Empresa
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} {t.footer.allRights}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#D9A928]">
              <Shield className="w-3.5 h-3.5" /> Métricas e Auditoria Certificada
            </span>
            <span>•</span>
            <span className="text-gray-400">Edições Digitais 3D Interativas</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
