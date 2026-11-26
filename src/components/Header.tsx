import React from 'react';
import { Radio, PlusCircle, Sparkles, Heart, Compass, History, Activity } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13 sm:h-18 gap-2">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onTabChange('discover')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-900 p-0.5 shadow-md shadow-emerald-950/60 flex items-center justify-center overflow-hidden border border-emerald-500/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-[6px] sm:rounded-[9px] bg-[#052317] flex items-center justify-center relative">
                  <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-[#008751]" />
                  <div className="absolute top-0 right-0 w-1 sm:w-1.5 h-full bg-[#008751]" />
                  <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:rotate-6 transition-transform" />
                </div>
              </div>

              {isPlaying && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500 border border-[#071d12]"></span>
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-xl font-black tracking-tight text-white font-['Cabinet_Grotesk',sans-serif] whitespace-nowrap">
                  Naija<span className="text-emerald-400">Radio</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 whitespace-nowrap">
                  LIVE 🇳🇬
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-300/75 font-medium truncate tabular-nums">
                {liveCount} On Air
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0a291a] p-1 rounded-full border border-emerald-800/50">
            <button
              onClick={() => onTabChange('discover')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'favorites'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'text-rose-400 fill-rose-400' : ''}`} />
              <span>Favorites</span>
              {favorites.length > 0 && (
                <span className="ml-0.5 text-[10px] text-emerald-300 font-bold tabular-nums">
                  ({favorites.length})
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('recent')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'recent'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Recents</span>
              {recentlyPlayed.length > 0 && (
                <span className="ml-0.5 text-[10px] text-emerald-300 font-bold tabular-nums">
                  ({recentlyPlayed.length})
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('health')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'health'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-md shadow-amber-950/40'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Stream Health</span>
            </button>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => onTabChange('health')}
              className={`md:hidden w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                currentTab === 'health'
                  ? 'bg-amber-400 text-emerald-950 border-amber-300'
                  : 'bg-[#0a291a] text-emerald-300 border-emerald-800/60 hover:text-white'
              }`}
              title="Stream Health Monitor"
              aria-label="Stream Health Monitor"
            >
              <Activity className="w-4 h-4" />
            </button>

            <button
              onClick={openSuggestModal}
              className="flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold text-[11px] sm:text-xs shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-950" />
              <span className="hidden sm:inline">Suggest a Station</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
