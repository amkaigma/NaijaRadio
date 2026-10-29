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
    { name: 'Oyo', count: stations.filter(s => s.state === 'Oyo').length },
    { name: 'Kano', count: stations.filter(s => s.state === 'Kano').length },
    { name: 'Rivers', count: stations.filter(s => s.state === 'Rivers').length },
    { name: 'Enugu', count: stations.filter(s => s.state === 'Enugu').length },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#062c19] via-[#041f12] to-[#02130a] border border-emerald-800/60 shadow-2xl p-6 sm:p-10 mb-8">
      
      {/* Background Decorative Nigerian Flag Green Glow and Ankara Motif Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-4 right-6 opacity-10 pointer-events-none text-emerald-400">
        <Radio className="w-64 h-64 -rotate-12" />
      </div>

      <div className="relative z-10 max-w-3xl">
        
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-300 font-semibold mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-amber-300">Naija Live Radio Stream</span>
          <span className="text-emerald-500">•</span>
          <span>From Lagos to Kano & Beyond 🇳🇬</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight font-['Cabinet_Grotesk',sans-serif] mb-3">
          Listen to <span className="text-emerald-400">Nigerian Radio</span> Wherever You Dey.
        </h1>

        <p className="text-sm sm:text-base text-emerald-200/90 leading-relaxed mb-6 max-w-2xl font-normal">
          Tune in live to Nigeria’s favorite radio stations across all 36 states and the FCT. From Afrobeats, Pidgin banter, in-depth political discourse, football sports commentary to indigenous Hausa, Yoruba, and Igbo broadcasts.
        </p>

        {/* Highlight Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 max-w-md">
          <div className="bg-[#051f13]/80 p-3 rounded-2xl border border-emerald-800/60">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {liveCount}+
            </div>
            <div className="text-[11px] sm:text-xs text-emerald-300/80 font-medium">
              Live Streams
            </div>
          </div>

          <div className="bg-[#051f13]/80 p-3 rounded-2xl border border-emerald-800/60">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              36 + FCT
            </div>
            <div className="text-[11px] sm:text-xs text-emerald-300/80 font-medium">
              States Covered
            </div>
          </div>

          <div className="bg-[#051f13]/80 p-3 rounded-2xl border border-emerald-800/60">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              6
            </div>
            <div className="text-[11px] sm:text-xs text-emerald-300/80 font-medium">
              Geo Regions
            </div>
          </div>
        </div>

        {/* State Jump Shortcuts */}
        <div className="pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-300/70 mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick jump to top broadcasting states:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {topStates.map((st) => (
              <button
                key={st.name}
                onClick={() => onSelectState(st.name)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#09301d] text-emerald-200 hover:text-white hover:bg-emerald-700/60 border border-emerald-700/50 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>{st.name}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-950 text-amber-400 text-[10px] font-bold">
                  {st.count}
                </span>
              </button>
            ))}

            <button
              onClick={openSuggestModal}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/30 transition-all ml-1 cursor-pointer"
            >
              + Add Missing Station
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
