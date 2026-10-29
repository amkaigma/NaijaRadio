import React, { useState } from 'react';
import { Filter, X, ChevronDown, Radio, Globe, Layers, MapPin, SlidersHorizontal, Check } from 'lucide-react';
import { FilterState, NigerianLanguage, Region, StationGenre } from '../types/radio';
import { ALL_GENRES, ALL_LANGUAGES, NIGERIAN_REGIONS, NIGERIAN_STATES } from '../data/nigeriaGeo';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalFilteredCount,
  totalCount,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Collect available cities based on selected state or all states
  const availableCities = React.useMemo(() => {
    if (filters.state !== 'all') {
      const stateObj = NIGERIAN_STATES.find(s => s.name === filters.state);
      return stateObj ? stateObj.majorCities : [];
    }
    // Return all prominent Nigerian cities
    const set = new Set<string>();
    NIGERIAN_STATES.forEach(s => s.majorCities.forEach(c => set.add(c)));
    return Array.from(set).sort();
  }, [filters.state]);

  const activeFilterCount = [
    filters.region !== 'all',
    filters.state !== 'all',
    filters.city !== 'all',
    filters.language !== 'all',
    filters.genre !== 'all',
    filters.onlyLive,
    Boolean(filters.searchQuery),
  ].filter(Boolean).length;

  const handleStateChange = (stateName: string) => {
    const nextState = stateName;
    let nextRegion = filters.region;

    if (nextState !== 'all') {
      const stateData = NIGERIAN_STATES.find(s => s.name === nextState);
      if (stateData) {
        nextRegion = stateData.region;
      }
    }

    onFilterChange({
      ...filters,
      state: nextState,
      city: 'all', // reset city when state changes
      region: nextRegion,
    });
  };

  return (
    <div className="w-full bg-[#072014]/90 border border-emerald-800/60 rounded-2xl p-4 sm:p-5 shadow-lg mb-6 backdrop-blur-sm">
      
      {/* Top summary row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-800/50 flex items-center justify-center text-amber-400">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Browse by Category</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-emerald-950">
                  {activeFilterCount} active
                </span>
              )}
            </h3>
            <p className="text-xs text-emerald-300/70">
              Showing <span className="font-semibold text-white">{totalFilteredCount}</span> of {totalCount} stations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live only switch */}
          <button
            onClick={() => onFilterChange({ ...filters, onlyLive: !filters.onlyLive })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filters.onlyLive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-sm'
                : 'bg-[#0a2719] text-emerald-400/60 border-emerald-800/40 hover:text-emerald-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filters.onlyLive ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-700'}`} />
            <span>Working Stream Only</span>
          </button>

          {/* Reset Filters button if any are active */}
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Mobile expand / collapse filters */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:hidden p-2 rounded-xl bg-emerald-900/40 text-emerald-300 border border-emerald-800/50"
            title="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary quick Region pills (always accessible) */}
      <div className="mt-4 pt-3 border-t border-emerald-900/50">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 shrink-0 mr-1 flex items-center gap-1">
            <Globe className="w-3 h-3 text-amber-400" />
            Region:
          </span>
          <button
            onClick={() => onFilterChange({ ...filters, region: 'all' })}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filters.region === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#0b291a] text-emerald-300/80 hover:bg-emerald-800/50 hover:text-white border border-emerald-800/40'
            }`}
          >
            All Regions
          </button>
          {NIGERIAN_REGIONS.map((region) => {
            const isSelected = filters.region === region;
            return (
              <button
                key={region}
                onClick={() => onFilterChange({ ...filters, region: isSelected ? 'all' : region })}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-emerald-950 font-bold shadow-md'
                    : 'bg-[#0b291a] text-emerald-300/80 hover:bg-emerald-800/50 hover:text-white border border-emerald-800/40'
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded / Full Selectors Grid (Desktop always, mobile conditionally) */}
      <div className={`${isExpanded ? 'block' : 'hidden sm:block'} mt-4 pt-3 border-t border-emerald-900/50`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* 1. State Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-300/80 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              State:
            </label>
            <div className="relative">
              <select
                value={filters.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full appearance-none bg-[#0a2b1c] border border-emerald-700/60 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 cursor-pointer"
              >
                <option value="all">All States (36 + FCT)</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.region})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 2. City Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-300/80 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              City:
            </label>
            <div className="relative">
              <select
                value={filters.city}
                onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
                className="w-full appearance-none bg-[#0a2b1c] border border-emerald-700/60 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 cursor-pointer"
              >
                <option value="all">
                  {filters.state === 'all' ? 'All Cities' : `All Cities in ${filters.state}`}
                </option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 3. Language Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-300/80 mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-400" />
              Language:
            </label>
            <div className="relative">
              <select
                value={filters.language}
                onChange={(e) => onFilterChange({ ...filters, language: e.target.value as NigerianLanguage | 'all' })}
                className="w-full appearance-none bg-[#0a2b1c] border border-emerald-700/60 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 cursor-pointer"
              >
                <option value="all">All Languages</option>
                {ALL_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 4. Genre Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-300/80 mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-400" />
              Genre:
            </label>
            <div className="relative">
              <select
                value={filters.genre}
                onChange={(e) => onFilterChange({ ...filters, genre: e.target.value as StationGenre | 'all' })}
                className="w-full appearance-none bg-[#0a2b1c] border border-emerald-700/60 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 cursor-pointer"
              >
                <option value="all">All Genres</option>
                {ALL_GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Quick Genre Chips for rapid clicking */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-medium text-emerald-400/60 shrink-0">
            Quick Genre:
          </span>
          {ALL_GENRES.slice(0, 5).map((genre) => {
            const isSelected = filters.genre === genre;
            return (
              <button
                key={genre}
                onClick={() => onFilterChange({ ...filters, genre: isSelected ? 'all' : genre })}
                className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-amber-400 text-emerald-950 font-bold'
                    : 'bg-[#082216] text-emerald-300/70 hover:text-white border border-emerald-800/40'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
