import React from 'react';
import { Sparkles, Compass, Heart, History, PlusCircle } from 'lucide-react';
import { ViewTab } from '../types/radio';
import { useRadioPlayer } from '../context/PlayerContext';

interface MobileNavProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onTabChange }) => {
  const { favorites, openSuggestModal, currentStation, error, notice } = useRadioPlayer();

  const bottomOffsetClass = !currentStation
    ? 'bottom-0'
    : error || notice
    ? 'bottom-[84px]'
    : 'bottom-[56px]';

  return (
    <nav
      aria-label="Mobile navigation"
      className={`md:hidden fixed z-40 left-0 right-0 ${bottomOffsetClass} bg-[#06180f]/95 backdrop-blur-lg border-t border-emerald-900/60 shadow-2xl px-1.5 py-1 transition-all`}
    >
      <div className="grid grid-cols-5 gap-0.5 items-center max-w-md mx-auto">
        <button
          onClick={() => onTabChange('discover')}
          className={`flex flex-col items-center justify-center min-h-[42px] py-1 rounded-lg transition-colors cursor-pointer ${
            currentTab === 'discover' ? 'text-amber-400 font-bold' : 'text-emerald-400/65 hover:text-emerald-300'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-none">Discover</span>
        </button>

        <button
          onClick={() => onTabChange('browse')}
          className={`flex flex-col items-center justify-center min-h-[42px] py-1 rounded-lg transition-colors cursor-pointer ${
            currentTab === 'browse' ? 'text-amber-400 font-bold' : 'text-emerald-400/65 hover:text-emerald-300'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-none">Stations</span>
        </button>

        <button
          onClick={() => onTabChange('favorites')}
          className={`flex flex-col items-center justify-center min-h-[42px] py-1 rounded-lg relative transition-colors cursor-pointer ${
            currentTab === 'favorites' ? 'text-amber-400 font-bold' : 'text-emerald-400/65 hover:text-emerald-300'
          }`}
        >
          <div className="relative">
            <Heart className={`w-4 h-4 mb-0.5 ${favorites.length > 0 ? 'fill-rose-500/80 text-rose-400' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-0.5 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold tabular-nums">
                {favorites.length}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-none">Saved</span>
        </button>

        <button
          onClick={() => onTabChange('recent')}
          className={`flex flex-col items-center justify-center min-h-[42px] py-1 rounded-lg relative transition-colors cursor-pointer ${
            currentTab === 'recent' ? 'text-amber-400 font-bold' : 'text-emerald-400/65 hover:text-emerald-300'
          }`}
        >
          <History className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-none">Recents</span>
        </button>

        <button
          onClick={openSuggestModal}
          className="flex flex-col items-center justify-center min-h-[42px] py-1 rounded-lg text-emerald-400/85 hover:text-amber-400 active:scale-95 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 mb-0.5 text-amber-400" />
          <span className="text-[10px] leading-none">Suggest</span>
        </button>
      </div>
    </nav>
  );
};
