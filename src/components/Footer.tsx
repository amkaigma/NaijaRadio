import React from 'react';
import { Radio, Heart, PlusCircle, Globe, Shield } from 'lucide-react';
import { useRadioPlayer } from '../context/PlayerContext';

export const Footer: React.FC = () => {
  const { openSuggestModal, stations } = useRadioPlayer();
  const liveCount = stations.filter(s => Boolean(s.streamUrl)).length;

  return (
    <footer className="mt-6 sm:mt-12 bg-[#03140b] border-t border-emerald-900/80 text-emerald-300/80 pb-28 md:pb-10 pt-5 sm:pt-8">
      
      {/* Nigeria Green-White-Green Top Accent Bar */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#008751]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#008751]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 sm:gap-8 mb-5 sm:mb-7">
          
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between sm:justify-start gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-300">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <span className="text-base sm:text-xl font-black text-white font-['Cabinet_Grotesk',sans-serif]">
                  Naija<span className="text-emerald-400">Radio</span>
                </span>
              </div>
              <span className="text-[11px] text-amber-300/90 font-semibold tabular-nums sm:hidden">
                {liveCount} Live Streams
              </span>
            </div>
            <p className="text-xs text-emerald-300/70 max-w-md leading-relaxed mb-2 sm:mb-3">
              Discover and listen live to Nigerian radio stations across all 36 states and Abuja (FCT).
            </p>
            <div className="hidden sm:flex items-center gap-2 text-xs text-amber-300/90 font-semibold tabular-nums">
              <span>{liveCount} Live Working Audio Streams Ready</span>
            </div>
          </div>

          {/* Quick Links (Desktop/Tablet) */}
          <div className="hidden sm:block">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-emerald-300/70">
              <li>Lagos & Abuja Top Stations</li>
              <li>Kano & Northern Hausa Streams</li>
              <li>Ibadan & South West Culture</li>
              <li>Port Harcourt & South East Radio</li>
            </ul>
          </div>

          {/* Community & Suggest */}
          <div className="flex sm:block items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1 sm:mb-2 flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Broadcasters</span>
              </h4>
              <p className="text-[11px] sm:text-xs text-emerald-300/70 sm:mb-3">
                Missing a Nigerian FM station?
              </p>
            </div>
            <button
              onClick={openSuggestModal}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Suggest Station</span>
            </button>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-4 border-t border-emerald-950/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-emerald-400/50">
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 mx-0.5" />
            <span>for Naija listeners everywhere</span>
          </div>

          <div className="text-center sm:text-right">
            All station logos and streams belong to their respective broadcasters.
          </div>
        </div>

      </div>
    </footer>
  );
};
