import React from 'react';
import { Radio, Heart, PlusCircle, Globe, Shield } from 'lucide-react';
import { useRadioPlayer } from '../context/PlayerContext';

export const Footer: React.FC = () => {
  const { openSuggestModal, stations } = useRadioPlayer();
  const liveCount = stations.filter(s => Boolean(s.streamUrl)).length;

  return (
    <footer className="mt-16 bg-[#03140b] border-t border-emerald-900/80 text-emerald-300/80 pb-28 md:pb-12 pt-10">
      
      {/* Nigeria Green-White-Green Top Accent Bar */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#008751]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#008751]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-300">
                <Radio className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white font-['Cabinet_Grotesk',sans-serif]">
                Naija<span className="text-emerald-400">Radio</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-300/70 max-w-md leading-relaxed mb-4">
              Your home for discovering Nigerian radio stations. Tune into live audio streams from Lagos, Abuja, Port Harcourt, Ibadan, Kano, Kaduna, Enugu, and all 36 states across Nigeria and in the diaspora.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-300/90 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{liveCount} Live Working Audio Streams Ready</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore</span>
            </h4>
            <ul className="space-y-2 text-xs text-emerald-300/70">
              <li>Lagos Radio Stations (95.1, 99.3, 96.9)</li>
              <li>Abuja FCT Stations (99.5, 95.1)</li>
              <li>Kano & Northern Streams (Freedom, BBC Hausa)</li>
              <li>Ibadan Cultural Broadcasts (Splash, Fresh)</li>
              <li>Eastern Highlife & Talk (Dream FM, Sapientia)</li>
            </ul>
          </div>

          {/* Community & Suggest */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Broadcasters</span>
            </h4>
            <p className="text-xs text-emerald-300/70 mb-3">
              Are you an FM station owner or DJ? Suggest your station stream to reach millions of listeners worldwide.
            </p>
            <button
              onClick={openSuggestModal}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Submit Station Info</span>
            </button>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-emerald-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-emerald-400/50">
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 mx-0.5" />
            <span>for Naija people everywhere</span>
          </div>

          <div className="text-center sm:text-right">
            All station logos, audio streams, and trademarks belong to their respective copyright holders.
          </div>
        </div>

      </div>
    </footer>
  );
};
