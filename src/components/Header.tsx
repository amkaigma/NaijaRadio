import React from 'react';
import { Radio, PlusCircle, Sparkles, Heart, Compass, History } from 'lucide-react';
import { ViewTab } from '../types/radio';
import { useRadioPlayer } from '../context/PlayerContext';

interface HeaderProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange }) => {
  const { favorites, recentlyPlayed, openSuggestModal, stations, isPlaying } = useRadioPlayer();
  const liveCount = stations.filter(s => Boolean(s.streamUrl)).length;

  return (
    <header className="sticky top-0 z-40 bg-[#071d12]/95 backdrop-blur-md border-b border-emerald-900/60 shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onTabChange('discover')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              {/* Nigeria Flag Accented Icon Badge */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-900 p-0.5 shadow-md shadow-emerald-950/60 flex items-center justify-center overflow-hidden border border-emerald-500/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-[10px] bg-[#052317] flex items-center justify-center relative">
                  {/* Nigeria Flag Stripe Accents on corners */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#008751]" />
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-[#008751]" />
                  <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:rotate-6 transition-transform" />
                </div>
              </div>

              {/* Pulsing Live indicator if playing */}
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#071d12]"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-['Cabinet_Grotesk',sans-serif]">
                  Naija<span className="text-emerald-400">Radio</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  LIVE 🇳🇬
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-300/70 font-medium">
                {liveCount} Stations On Air
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#0a291a] p-1.5 rounded-full border border-emerald-800/50">
            <button
              onClick={() => onTabChange('discover')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                currentTab === 'discover'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discover</span>
            </button>

            <button
              onClick={() => onTabChange('browse')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                currentTab === 'browse'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>All Stations</span>
            </button>

            <button
              onClick={() => onTabChange('favorites')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                currentTab === 'favorites'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'text-rose-400 fill-rose-400' : ''}`} />
              <span>Favorites</span>
              {favorites.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 font-bold">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('recent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                currentTab === 'recent'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Recently Played</span>
              {recentlyPlayed.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 font-bold">
                  {recentlyPlayed.length}
                </span>
              )}
            </button>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={openSuggestModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-950" />
              <span className="hidden sm:inline">Suggest a Station</span>
              <span className="sm:hidden">Add Station</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
