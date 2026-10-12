import React from 'react';
import { Calendar, MapPin, Tag, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EventsSection: React.FC = () => {
  const { events } = useApp();

  return (
    <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800">
        <div>
          <span className="text-[10px] uppercase font-mono text-[#D9A928] font-bold tracking-widest block">
            Agenda Corporativa & Coberturas Exclusivas
          </span>
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white">
            Grandes Eventos & Congressos
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map(ev => (
          <div 
            key={ev.id}
            className="bg-[#061827] border border-gray-800 hover:border-[#D9A928]/40 rounded-2xl overflow-hidden shadow-xl transition duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="h-44 w-full relative overflow-hidden bg-black">
                <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span className="absolute top-3 left-3 bg-black/80 text-[#D9A928] text-[10px] font-bold uppercase px-2.5 py-1 rounded border border-[#D9A928]/30">
                  {ev.category}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-[11px] text-[#D9A928] font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  <span>{ev.date}</span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#D9A928] transition line-clamp-2">
                  {ev.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {ev.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-2 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1 text-[11px] truncate max-w-[190px]">
                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                {ev.location}
              </span>
              <span className="text-[#D9A928] font-semibold flex items-center gap-1 text-[11px]">
                Detalhes <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
