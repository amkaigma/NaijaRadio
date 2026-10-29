import React from 'react';
import { Globe, Music, Radio, MessageSquare, Compass, Shield, Mic, Headphones } from 'lucide-react';
import { NIGERIAN_REGIONS, ALL_GENRES, ALL_LANGUAGES } from '../data/nigeriaGeo';
import { NigerianLanguage, Region, StationGenre } from '../types/radio';

interface CategoryBrowserProps {
  onSelectRegion: (region: Region) => void;
  onSelectGenre: (genre: StationGenre) => void;
  onSelectLanguage: (lang: NigerianLanguage) => void;
  activeRegion: Region | 'all';
  activeGenre: StationGenre | 'all';
  activeLanguage: NigerianLanguage | 'all';
}

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  onSelectRegion,
  onSelectGenre,
  onSelectLanguage,
  activeRegion,
  activeGenre,
  activeLanguage,
}) => {
  const regionDescriptions: Record<Region, string> = {
    'South West': 'Lagos, Ibadan, Ogun, Osun, Ondo, Ekiti',
    'South South': 'Port Harcourt, Warri, Benin, Calabar, Uyo',
    'South East': 'Enugu, Onitsha, Owerri, Aba, Abakaliki',
    'North Central': 'Abuja FCT, Jos, Ilorin, Makurdi, Minna',
    'North West': 'Kano, Kaduna, Katsina, Sokoto, Zaria',
    'North East': 'Maiduguri, Bauchi, Gombe, Yola, Jalingo',
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

  return (
    <div className="mb-10 space-y-6">
      
      {/* 1. Explore by Geopolitical Region */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-400" />
              <span>Browse by Nigerian Region</span>
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

      {/* 2. Explore by Language */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
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

      {/* 3. Explore by Genre */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
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
