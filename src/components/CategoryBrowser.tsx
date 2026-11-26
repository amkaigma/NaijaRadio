import React, { useState } from 'react';
import { Globe, Music, Radio, MessageSquare, Compass, Shield, Mic, Headphones, MapPin, Search, ChevronRight } from 'lucide-react';
import { NIGERIAN_REGIONS, ALL_GENRES, ALL_LANGUAGES, NIGERIAN_STATES } from '../data/nigeriaGeo';
import { NigerianLanguage, Region, StationGenre } from '../types/radio';
import { useRadioPlayer } from '../context/PlayerContext';

interface CategoryBrowserProps {
  onSelectRegion: (region: Region) => void;
  onSelectState: (state: string) => void;
  onSelectGenre: (genre: StationGenre) => void;
  onSelectLanguage: (lang: NigerianLanguage) => void;
  activeRegion: Region | 'all';
  activeState: string | 'all';
  activeGenre: StationGenre | 'all';
  activeLanguage: NigerianLanguage | 'all';
}

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  onSelectRegion,
  onSelectState,
  onSelectGenre,
  onSelectLanguage,
  activeRegion,
  activeState,
  activeGenre,
  activeLanguage,
}) => {
  const { stations } = useRadioPlayer();
  const [stateSearch, setStateSearch] = useState('');
  const [showAllStates, setShowAllStates] = useState(false);

  const regionDescriptions: Record<Region, string> = {
    'South West': 'Lagos, Ibadan, Ogun, Osun, Ondo, Ekiti',
    'South South': 'Port Harcourt, Warri, Benin, Calabar, Uyo, Yenagoa',
    'South East': 'Enugu, Onitsha, Owerri, Aba, Abakaliki',
    'North Central': 'Abuja FCT, Jos, Ilorin, Makurdi, Minna, Lafia, Lokoja',
    'North West': 'Kano, Kaduna, Katsina, Sokoto, Birnin Kebbi, Gusau, Dutse',
    'North East': 'Maiduguri, Bauchi, Gombe, Yola, Jalingo, Damaturu',
    'National / Online': 'Nationwide networks & digital stations',
  };

  const genreIcons: Record<StationGenre, React.ElementType> = {
    'Afrobeats & Hits': Music,
    'News & Talk': MessageSquare,
    'Sports Radio': Headphones,
    'Pidgin & Comedy': Mic,
    'Gospel & Christian': Shield,
    'Classic & Highlife': Music,
    'Youth & Urban Pop': Radio,
    'Cultural & Community': Globe,
    'Islamic & Talk': Compass,
  };

  // Compute station counts per state
  const stateStationCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    stations.forEach(s => {
      counts[s.state] = (counts[s.state] || 0) + 1;
    });
    return counts;
  }, [stations]);

  // Filtered states by quick search
  const filteredStates = React.useMemo(() => {
    return NIGERIAN_STATES.filter(s => 
      s.name.toLowerCase().includes(stateSearch.toLowerCase().trim()) ||
      s.region.toLowerCase().includes(stateSearch.toLowerCase().trim()) ||
      s.capital.toLowerCase().includes(stateSearch.toLowerCase().trim())
    );
  }, [stateSearch]);

  const displayedStates = showAllStates || stateSearch.trim() ? filteredStates : filteredStates.slice(0, 9);

  return (
    <div className="mb-6 sm:mb-10 space-y-5 sm:space-y-7">
      
      {/* 1. All 36 States + FCT Complete Directory */}
      <div className="bg-gradient-to-br from-[#062416] via-[#041a10] to-[#02130a] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-emerald-800/70 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div>
            <h3 className="text-base sm:text-xl font-black text-white flex items-center gap-1.5 font-['Cabinet_Grotesk',sans-serif]">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span>Browse by State</span>
              <span className="text-[11px] text-emerald-400 font-semibold ml-1">36 + FCT</span>
            </h3>
            <p className="hidden sm:block text-xs text-emerald-300/80 mt-0.5">
              Every Nigerian state is represented with live radio stations and FM frequencies
            </p>
          </div>

          {/* Quick Search input for states */}
          <div className="relative sm:min-w-[230px]">
            <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={stateSearch}
              onChange={(e) => setStateSearch(e.target.value)}
              placeholder="Filter state (e.g. Borno, Kano)..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#092e1d] border border-emerald-700/60 text-xs text-white placeholder-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* States Grid (3 compact columns on mobile, up to 6 on desktop) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2">
          {displayedStates.map((st) => {
            const count = stateStationCounts[st.name] || 0;
            const isSelected = activeState === st.name;
            return (
              <button
                key={st.name}
                onClick={() => onSelectState(st.name)}
                className={`p-2 sm:p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-amber-400 text-emerald-950 border-amber-300 font-bold shadow-md'
                    : 'bg-[#082b1b] text-emerald-100 border-emerald-800/50 hover:border-emerald-500 hover:bg-[#0c3924]'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[11px] sm:text-xs font-bold truncate ${isSelected ? 'text-emerald-950' : 'text-white group-hover:text-amber-300'}`}>
                    {st.name}
                  </span>
                  <span className={`text-[10px] font-mono font-bold tabular-nums shrink-0 ${
                    isSelected ? 'text-emerald-900' : 'text-amber-400/90'
                  }`}>
                    {count}
                  </span>
                </div>
                <div className={`text-[10px] mt-0.5 flex items-center justify-between truncate ${isSelected ? 'text-emerald-900' : 'text-emerald-300/60'}`}>
                  <span className="truncate">{st.capital}</span>
                  <ChevronRight className="w-3 h-3 opacity-50 shrink-0 hidden sm:inline" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Show More / Show All States Toggle */}
        {!stateSearch && (
          <div className="mt-3 pt-2.5 border-t border-emerald-800/50 flex justify-center">
            <button
              onClick={() => setShowAllStates(!showAllStates)}
              className="px-4 py-1.5 rounded-xl bg-emerald-800/70 hover:bg-emerald-700 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{showAllStates ? 'Show Fewer States' : `All 36 States + FCT (${NIGERIAN_STATES.length})`}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllStates ? '-rotate-90' : 'rotate-90'}`} />
            </button>
          </div>
        )}
      </div>

      {/* 2. Explore by Geopolitical Region */}
      <div>
        <div className="mb-2 sm:mb-3">
          <h3 className="text-sm sm:text-lg font-bold text-white flex items-center gap-1.5 font-['Cabinet_Grotesk',sans-serif]">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Geopolitical Zones</span>
          </h3>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-2.5 sm:overflow-visible">
          {NIGERIAN_REGIONS.map((region) => {
            const isSelected = activeRegion === region;
            return (
              <button
                key={region}
                onClick={() => onSelectRegion(region)}
                className={`shrink-0 min-w-[138px] sm:min-w-0 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border transition-colors cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                    : 'bg-[#062114] text-emerald-200 border-emerald-800/60 hover:border-emerald-600/70 hover:bg-[#092d1c]'
                }`}
              >
                <div className="text-xs sm:text-sm font-bold leading-snug whitespace-nowrap sm:whitespace-normal">
                  {region}
                </div>
                <p className="text-[10px] mt-1 opacity-70 line-clamp-1 sm:line-clamp-2">
                  {regionDescriptions[region]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Explore by Language */}
      <div>
        <div className="mb-2 sm:mb-3">
          <h3 className="text-sm sm:text-lg font-bold text-white flex items-center gap-1.5 font-['Cabinet_Grotesk',sans-serif]">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Broadcast Languages</span>
          </h3>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-2.5 sm:overflow-visible">
          {ALL_LANGUAGES.map((lang) => {
            const isSelected = activeLanguage === lang;
            const descriptions: Record<NigerianLanguage, string> = {
              Pidgin: 'Street talk & comedy',
              English: 'News & contemporary',
              Yoruba: 'Culture, Fuji & news',
              Hausa: 'Muryar Arewa & news',
              Igbo: 'Highlife & market gist',
              Fulfulde: 'Fulbe heritage',
              Kanuri: 'Borno & Sahel voice',
              Nupe: 'Bida kingdom news',
              Igala: 'Confluence tradition',
              Ebira: 'Okene community',
              Multilingual: 'Unity broadcasts',
            };

            return (
              <button
                key={lang}
                onClick={() => onSelectLanguage(lang)}
                className={`shrink-0 min-w-[116px] sm:min-w-0 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-emerald-950 font-bold border-amber-300 shadow-md'
                    : 'bg-[#062114] text-emerald-200 border-emerald-800/60 hover:bg-[#092d1c]'
                }`}
              >
                <div className="text-xs sm:text-sm font-black whitespace-nowrap">{lang}</div>
                <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-emerald-900' : 'text-emerald-400/60'}`}>
                  {descriptions[lang]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Explore by Genre */}
      <div>
        <div className="mb-2 sm:mb-3">
          <h3 className="text-sm sm:text-lg font-bold text-white flex items-center gap-1.5 font-['Cabinet_Grotesk',sans-serif]">
            <Music className="w-4 h-4 text-amber-400" />
            <span>Station Genres</span>
          </h3>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-2.5 sm:overflow-visible">
          {ALL_GENRES.slice(0, 8).map((genre) => {
            const Icon = genreIcons[genre] || Radio;
            const isSelected = activeGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => onSelectGenre(genre)}
                className={`shrink-0 sm:shrink px-3 py-2 sm:p-2.5 rounded-xl sm:rounded-2xl flex items-center gap-2 border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-bold'
                    : 'bg-[#062114] text-emerald-200 border-emerald-800/60 hover:bg-[#092d1c]'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20' : 'bg-emerald-900/60 text-amber-400'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold whitespace-nowrap truncate">
                  {genre}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
