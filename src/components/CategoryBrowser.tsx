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

  const displayedStates = showAllStates || stateSearch.trim() ? filteredStates : filteredStates.slice(0, 12);

  return (
    <div className="mb-12 space-y-8">
      
      {/* 1. All 36 States + FCT Complete Directory */}
      <div className="bg-gradient-to-br from-[#062416] via-[#041a10] to-[#02130a] rounded-3xl p-5 sm:p-7 border border-emerald-800/70 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-emerald-950 uppercase tracking-wider">
                Full Coverage 🇳🇬
              </span>
              <span className="text-xs text-emerald-400 font-bold">36 States + Abuja (FCT)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 font-['Cabinet_Grotesk',sans-serif] mt-1">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>Browse by State</span>
            </h3>
            <p className="text-xs text-emerald-300/80">
              Every Nigerian state is represented with live radio stations and FM frequencies
            </p>
          </div>

          {/* Quick Search input for states */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={stateSearch}
              onChange={(e) => setStateSearch(e.target.value)}
              placeholder="Filter state (e.g. Borno, Rivers, Kano)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#092e1d] border border-emerald-700/60 text-xs text-white placeholder-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* States Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {displayedStates.map((st) => {
            const count = stateStationCounts[st.name] || 0;
            const isSelected = activeState === st.name;
            return (
              <button
                key={st.name}
                onClick={() => onSelectState(st.name)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-amber-400 text-emerald-950 border-amber-300 font-bold shadow-lg scale-102'
                    : 'bg-[#082b1b] text-emerald-100 border-emerald-800/50 hover:border-emerald-500 hover:bg-[#0c3924]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider truncate ${isSelected ? 'text-emerald-900' : 'text-emerald-400/70'}`}>
                      {st.region.replace('South', 'S.').replace('North', 'N.')}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      isSelected ? 'bg-emerald-950 text-amber-300' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    }`}>
                      {count} {count === 1 ? 'stn' : 'stns'}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-black truncate group-hover:text-amber-300 transition-colors">
                    {st.name}
                  </div>
                </div>
                <div className={`text-[10px] mt-1.5 flex items-center justify-between ${isSelected ? 'text-emerald-900' : 'text-emerald-300/60'}`}>
                  <span>Cap: {st.capital}</span>
                  <ChevronRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Show More / Show All States Toggle */}
        {!stateSearch && (
          <div className="mt-4 pt-3 border-t border-emerald-800/50 flex justify-center">
            <button
              onClick={() => setShowAllStates(!showAllStates)}
              className="px-5 py-2 rounded-xl bg-emerald-800/70 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{showAllStates ? 'Show Fewer States' : `Show All 36 States + FCT (${NIGERIAN_STATES.length})`}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllStates ? '-rotate-90' : 'rotate-90'}`} />
            </button>
          </div>
        )}
      </div>

      {/* 2. Explore by Geopolitical Region */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 font-['Cabinet_Grotesk',sans-serif]">
              <Globe className="w-5 h-5 text-amber-400" />
              <span>Browse by Nigerian Geopolitical Zone</span>
            </h3>
            <p className="text-xs text-emerald-300/70">
              Discover radio stations broadcasting from Nigeria's 6 geopolitical zones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {NIGERIAN_REGIONS.map((region) => {
            const isSelected = activeRegion === region;
            return (
              <button
                key={region}
                onClick={() => onSelectRegion(region)}
                className={`p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-500/40 shadow-lg scale-102'
                    : 'bg-[#062114] text-emerald-200 border-emerald-800/60 hover:border-emerald-600/70 hover:bg-[#092d1c]'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70 mb-1 text-amber-300">
                    Zone
                  </span>
                  <div className="text-sm font-extrabold leading-snug">
                    {region}
                  </div>
                </div>
                <p className="text-[10px] mt-2 opacity-70 line-clamp-2">
                  {regionDescriptions[region]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Explore by Language */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-['Cabinet_Grotesk',sans-serif]">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Broadcast Languages</span>
            </h3>
            <p className="text-xs text-emerald-300/70">
              Tune into your mother tongue or street lingua
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {ALL_LANGUAGES.map((lang) => {
            const isSelected = activeLanguage === lang;
            const descriptions: Record<NigerianLanguage, string> = {
              Pidgin: 'Ogbonge street talk & comedy',
              English: 'National news, contemporary & global',
              Yoruba: 'Omoluabi culture, Fuji, news & drama',
              Hausa: 'Muryar Arewa, labaru & al’ada',
              Igbo: 'Okwu Igbo, highlife & market gist',
              Fulfulde: 'Habbirde Fulbe, labari & al’ada',
              Kanuri: 'Borno & Sahel cultural heritage',
              Nupe: 'Etsu Bida kingdom news & arts',
              Igala: 'Confluence tradition & local news',
              Ebira: 'Okene & Confluence community radio',
              Multilingual: 'Unity broadcasts across tongues',
            };

            return (
              <button
                key={lang}
                onClick={() => onSelectLanguage(lang)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-emerald-950 font-bold border-amber-300 shadow-md'
                    : 'bg-[#062114] text-emerald-200 border-emerald-800/60 hover:bg-[#092d1c]'
                }`}
              >
                <div className="text-sm font-black">{lang}</div>
                <div className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-emerald-900' : 'text-emerald-400/60'}`}>
                  {descriptions[lang]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Explore by Genre */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-['Cabinet_Grotesk',sans-serif]">
              <Music className="w-4 h-4 text-amber-400" />
              <span>Popular Station Genres</span>
            </h3>
            <p className="text-xs text-emerald-300/70">
              From continuous Afrobeats to in-depth news & football commentaries
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {ALL_GENRES.slice(0, 8).map((genre) => {
            const Icon = genreIcons[genre] || Radio;
            const isSelected = activeGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => onSelectGenre(genre)}
                className={`p-3 rounded-2xl flex items-center gap-2.5 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-bold'
                    : 'bg-[#062114] text-emerald-200 border-emerald-800/60 hover:bg-[#092d1c]'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20' : 'bg-emerald-900/60 text-amber-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold truncate">
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
