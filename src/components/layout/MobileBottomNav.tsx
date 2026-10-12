import React from 'react';
import { 
  Home, 
  BookOpen, 
  Sparkles, 
  Calendar, 
  Menu 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Props {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const MobileBottomNav: React.FC<Props> = ({ 
  activeTab, 
  onNavigateTab, 
  onToggleMobileMenu,
  isMobileMenuOpen
}) => {
  const { setIsAdCheckoutOpen } = useApp();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#020B14]/95 backdrop-blur-xl border-t border-[#D9A928]/30 shadow-[0_-8px_25px_rgba(0,0,0,0.8)]">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        
        {/* 1. Início */}
        <button
          onClick={() => onNavigateTab('home')}
          className={`flex flex-col items-center justify-center h-full transition relative ${
            activeTab === 'home' && !isMobileMenuOpen ? 'text-[#D9A928]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Início</span>
          {activeTab === 'home' && !isMobileMenuOpen && (
            <span className="w-8 h-1 bg-[#D9A928] rounded-full absolute top-0" />
          )}
        </button>

        {/* 2. Revista 3D (Priority Feature) */}
        <button
          onClick={() => onNavigateTab('revista')}
          className={`flex flex-col items-center justify-center h-full transition relative ${
            activeTab === 'revista' ? 'text-[#D9A928]' : 'text-gray-300 hover:text-[#D9A928]'
          }`}
        >
          <div className="relative">
            <BookOpen className="w-5 h-5 text-[#D9A928]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D9A928] animate-ping" />
          </div>
          <span className="text-[10px] font-extrabold text-[#D9A928] mt-1 tracking-tight">Revista 3D</span>
          {activeTab === 'revista' && (
            <span className="w-8 h-1 bg-[#D9A928] rounded-full absolute top-0" />
          )}
        </button>

        {/* 3. Anuncie */}
        <button
          onClick={() => {
            setIsAdCheckoutOpen(true);
            onNavigateTab('anuncie');
          }}
          className={`flex flex-col items-center justify-center h-full transition relative ${
            activeTab === 'anuncie' ? 'text-[#D9A928]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Anuncie</span>
          {activeTab === 'anuncie' && (
            <span className="w-8 h-1 bg-[#D9A928] rounded-full absolute top-0" />
          )}
        </button>

        {/* 4. Eventos (Substituindo Painel) */}
        <button
          onClick={() => onNavigateTab('eventos')}
          className={`flex flex-col items-center justify-center h-full transition relative ${
            activeTab === 'eventos' ? 'text-[#D9A928]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calendar className="w-5 h-5 text-[#38BDF8]" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Eventos</span>
          {activeTab === 'eventos' && (
            <span className="w-8 h-1 bg-[#D9A928] rounded-full absolute top-0" />
          )}
        </button>

        {/* 5. Menu Completo Drawer */}
        <button
          onClick={onToggleMobileMenu}
          className={`flex flex-col items-center justify-center h-full transition relative ${
            isMobileMenuOpen ? 'text-[#D9A928]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="p-1 rounded-lg bg-[#061827] border border-[#D9A928]/40">
            <Menu className="w-4 h-4 text-[#D9A928]" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight text-[#D9A928]">Menu</span>
          {isMobileMenuOpen && (
            <span className="w-8 h-1 bg-[#D9A928] rounded-full absolute top-0" />
          )}
        </button>

      </div>
    </nav>
  );
};
