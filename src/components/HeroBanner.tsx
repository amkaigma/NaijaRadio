import React from 'react';
import { Radio, Sparkles, MapPin, Headphones, Music, Flame } from 'lucide-react';
import { useRadioPlayer } from '../context/PlayerContext';

interface HeroBannerProps {
  onSelectState: (state: string) => void;
  onSelectGenre: (genre: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectState, onSelectGenre }) => {
  const { stations, openSuggestModal } = useRadioPlayer();
  const liveCount = stations.filter(s => Boolean(s.streamUrl)).length;

  const topStates = [
    { name: 'Lagos', count: stations.filter(s => s.state === 'Lagos').length },
    { name: 'Abuja (FCT)', count: stations.filter(s => s.state === 'Abuja (FCT)').length },
    { name: 'Kano', count: stations.filter(s => s.state === 'Kano').length },
    { name: 'Oyo', count: stations.filter(s => s.state === 'Oyo').length },
    { name: 'Rivers', count: stations.filter(s => s.state === 'Rivers').length },
    { name: 'Enugu', count: stations.filter(s => s.state === 'Enugu').length },
    { name: 'Kaduna', count: stations.filter(s => s.state === 'Kaduna').length },
    { name: 'Delta', count: stations.filter(s => s.state === 'Delta').length },
    { name: 'Adamawa', count: stations.filter(s => s.state === 'Adamawa').length },
    { name: 'Borno', count: stations.filter(s => s.state === 'Borno').length },
    { name: 'Plateau', count: stations.filter(s => s.state === 'Plateau').length },
    { name: 'Akwa Ibom', count: stations.filter(s => s.state === 'Akwa Ibom').length },
    { name: 'Sokoto', count: stations.filter(s => s.state === 'Sokoto').length },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#062c19] via-[#041f12] to-[#02130a] border border-emerald-800/60 shadow-2xl p-3.5 sm:p-8 mb-4 sm:mb-7">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden sm:block absolute top-4 right-6 opacity-10 pointer-events-none text-emerald-400">
        <Radio className="w-56 h-56 -rotate-12" />
      </div>

      <div className="relative z-10 max-w-3xl">
        
        {/* Clean Eyebrow */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-300/85 font-semibold mb-1.5 sm:mb-3">
          <span className="font-bold text-amber-300">Naija Live Radio</span>
          <span aria-hidden="true" className="text-emerald-500">·</span>
          <span>Lagos to Kano & Beyond 🇳🇬</span>
        </div>

        {/* Main Title */}
        <h1 className="text-xl sm:text-4xl font-black text-white tracking-tight leading-snug font-['Cabinet_Grotesk',sans-serif] mb-1.5 sm:mb-2.5 text-balance">
          Listen to <span className="text-emerald-400">Nigerian Radio</span> Wherever You Dey.
        </h1>

        <p className="text-xs sm:text-sm text-emerald-200/85 leading-relaxed mb-3 sm:mb-5 max-w-2xl line-clamp-2 sm:line-clamp-none">
          Tune in live across all 36 states and the FCT — Afrobeats, Pidgin talk, sports, and Hausa, Yoruba, Igbo & Fulfulde broadcasts.
        </p>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-3 sm:mb-5 max-w-md">
          <div className="bg-[#051f13]/85 px-2.5 py-1.5 sm:p-2.5 rounded-xl border border-emerald-800/60">
            <div className="text-base sm:text-xl font-black text-amber-400 font-mono tabular-nums">
              {liveCount}
            </div>
            <div className="text-[10px] sm:text-xs text-emerald-300/80 font-medium leading-tight">
              Live Streams
            </div>
          </div>

          <div className="bg-[#051f13]/85 px-2.5 py-1.5 sm:p-2.5 rounded-xl border border-emerald-800/60">
            <div className="text-base sm:text-xl font-black text-white font-mono tabular-nums">
              36 + FCT
            </div>
            <div className="text-[10px] sm:text-xs text-emerald-300/80 font-medium leading-tight">
              States
            </div>
          </div>

          <div className="bg-[#051f13]/85 px-2.5 py-1.5 sm:p-2.5 rounded-xl border border-emerald-800/60">
            <div className="text-base sm:text-xl font-black text-emerald-400 font-mono tabular-nums">
              6
            </div>
            <div className="text-[10px] sm:text-xs text-emerald-300/80 font-medium leading-tight">
              Regions
            </div>
          </div>
        </div>

        {/* State Jump Shortcuts (single-row horizontal scroll on mobile, wrap on desktop) */}
        <div>
          <div className="text-[11px] font-semibold text-emerald-300/75 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Quick jump by state:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar sm:flex-wrap pb-0.5">
            {topStates.map((st) => (
              <button
                key={st.name}
                onClick={() => onSelectState(st.name)}
                className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-[#09301d] text-emerald-200 hover:text-white hover:bg-emerald-700/60 border border-emerald-700/50 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <span>{st.name}</span>
                <span className="text-amber-400 text-[10px] font-bold tabular-nums">
                  {st.count}
                </span>
              </button>
            ))}

            <button
              onClick={openSuggestModal}
              className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/30 transition-colors cursor-pointer whitespace-nowrap"
            >
              + Add Station
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
