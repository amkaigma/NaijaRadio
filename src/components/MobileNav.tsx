import React from 'react';
import { Sparkles, Compass, Heart, History, PlusCircle } from 'lucide-react';
import { ViewTab } from '../types/radio';
import { useRadioPlayer } from '../context/PlayerContext';

interface MobileNavProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onTabChange }) => {
  const { favorites, recentlyPlayed, openSuggestModal, currentStation } = useRadioPlayer();

  // If there's an active station player, we position the mobile nav directly beneath or above it.
  return (
    <div className={`md:hidden fixed z-40 left-0 right-0 ${currentStation ? 'bottom-[76px]' : 'bottom-0'} bg-[#06180f]/95 backdrop-blur-lg border-t border-emerald-900/60 shadow-2xl px-2 py-2 transition-all`}>
      <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
        <button
          onClick={() => onTabChange('discover')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            currentTab === 'discover' ? 'text-amber-400 font-bold' : 'text-emerald-400/60 hover:text-emerald-300'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Discover</span>
        </button>

        <button
          onClick={() => onTabChange('browse')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            currentTab === 'browse' ? 'text-amber-400 font-bold' : 'text-emerald-400/60 hover:text-emerald-300'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Stations</span>
        </button>

        <button
          onClick={() => onTabChange('favorites')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl relative transition-all ${
            currentTab === 'favorites' ? 'text-amber-400 font-bold' : 'text-emerald-400/60 hover:text-emerald-300'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 mb-0.5 ${favorites.length > 0 ? 'fill-rose-500/80 text-rose-400' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {favorites.length}
              </span>
            )}
          </div>
          <span className="text-[10px]">Favorites</span>
        </button>

        <button
          onClick={() => onTabChange('recent')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl relative transition-all ${
            currentTab === 'recent' ? 'text-amber-400 font-bold' : 'text-emerald-400/60 hover:text-emerald-300'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Recents</span>
        </button>

        <button
          onClick={openSuggestModal}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-emerald-400/80 hover:text-amber-400 active:scale-95 transition-all"
        >
          <PlusCircle className="w-5 h-5 mb-0.5 text-amber-400" />
          <span className="text-[10px]">Suggest</span>
        </button>
      </div>
    </div>
  );
};
