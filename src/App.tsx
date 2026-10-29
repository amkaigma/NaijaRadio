import React, { useState, useMemo } from 'react';
import { PlayerProvider, useRadioPlayer } from './context/PlayerContext';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { HeroBanner } from './components/HeroBanner';
import { SearchBar } from './components/SearchBar';
import { FilterBar } from './components/FilterBar';
import { StationCard } from './components/StationCard';
import { StationDetailModal } from './components/StationDetailModal';
import { SuggestStationModal } from './components/SuggestStationModal';
import { AudioPlayerBottomBar } from './components/AudioPlayerBottomBar';
import { CategoryBrowser } from './components/CategoryBrowser';
import { Footer } from './components/Footer';
import { FilterState, NigerianLanguage, Region, StationGenre, ViewTab, Station } from './types/radio';
import { Radio, Sparkles, Heart, History, Compass, SearchX, RotateCcw, PlusCircle, Volume2 } from 'lucide-react';

const initialFilters: FilterState = {
  searchQuery: '',
  region: 'all',
  state: 'all',
  city: 'all',
  language: 'all',
  genre: 'all',
  onlyLive: false,
};

const MainContent: React.FC = () => {
  const { stations, favorites, recentlyPlayed, openSuggestModal, currentStation } = useRadioPlayer();
  const [currentTab, setCurrentTab] = useState<ViewTab>('discover');
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Filter stations based on state, city, region, language, genre, live status, and search query
  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      // 1. Only live working stream filter
      if (filters.onlyLive && !station.streamUrl) {
        return false;
      }

      // 2. Region filter
      if (filters.region !== 'all' && station.region !== filters.region) {
        return false;
      }

      // 3. State filter
      if (filters.state !== 'all' && station.state !== filters.state) {
        return false;
      }

      // 4. City filter
      if (filters.city !== 'all') {
        const matchesCity = station.city.toLowerCase().includes(filters.city.toLowerCase());
        if (!matchesCity) return false;
      }

      // 5. Language filter
      if (filters.language !== 'all') {
        const hasLanguage = station.languages.includes(filters.language);
        if (!hasLanguage) return false;
      }

      // 6. Genre filter
      if (filters.genre !== 'all' && station.genre !== filters.genre) {
        return false;
      }

      // 7. Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const inName = station.name.toLowerCase().includes(q);
        const inFreq = station.frequency.toLowerCase().includes(q);
        const inTag = station.tagline.toLowerCase().includes(q);
        const inCity = station.city.toLowerCase().includes(q);
        const inState = station.state.toLowerCase().includes(q);
        const inRegion = station.region.toLowerCase().includes(q);
        const inGenre = station.genre.toLowerCase().includes(q);
        const inLang = station.languages.some((l) => l.toLowerCase().includes(q));
        const inHost = station.hostName ? station.hostName.toLowerCase().includes(q) : false;
        const inShow = station.currentShow ? station.currentShow.toLowerCase().includes(q) : false;

        if (!inName && !inFreq && !inTag && !inCity && !inState && !inRegion && !inGenre && !inLang && !inHost && !inShow) {
          return false;
        }
      }

      return true;
    });
  }, [stations, filters]);

  // Featured stations for the home page
  const featuredStations = useMemo(() => {
    return stations.filter((s) => s.featured);
  }, [stations]);

  // Favorite stations
  const favoritedStations = useMemo(() => {
    return stations.filter((s) => favorites.includes(s.id));
  }, [stations, favorites]);

  // Reset all filters
  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  // Direct handlers from categories & pills
  const handleSelectRegion = (region: Region) => {
    setFilters((prev) => ({
      ...prev,
      region: prev.region === region ? 'all' : region,
      state: 'all',
      city: 'all',
    }));
    setCurrentTab('browse');
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleSelectState = (stateName: string) => {
    setFilters((prev) => ({
      ...prev,
      state: stateName,
      city: 'all',
    }));
    setCurrentTab('browse');
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleSelectGenre = (genre: StationGenre) => {
    setFilters((prev) => ({
      ...prev,
      genre: prev.genre === genre ? 'all' : genre,
    }));
    setCurrentTab('browse');
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleSelectLanguage = (lang: NigerianLanguage) => {
    setFilters((prev) => ({
      ...prev,
      language: prev.language === lang ? 'all' : lang,
    }));
    setCurrentTab('browse');
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleSearchChange = (val: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: val }));
  };

  const handleSearchClear = () => {
    setFilters((prev) => ({ ...prev, searchQuery: '' }));
  };

  const handleQuickSuggestion = (tag: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: tag }));
    if (tag) setCurrentTab('browse');
  };

  return (
    <div className="min-h-screen bg-[#03130a] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <Header currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* ===================== TAB: DISCOVER ===================== */}
        {currentTab === 'discover' && (
          <div>
            {/* Hero Banner */}
            <HeroBanner
              onSelectState={handleSelectState}
              onSelectGenre={(genre) => handleSelectGenre(genre as StationGenre)}
            />

            {/* Prominent Search Bar on Home Page */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span>Find Your Station</span>
                </h3>
                <button
                  onClick={() => setCurrentTab('browse')}
                  className="text-xs text-amber-300 font-semibold hover:underline"
                >
                  View All ({stations.length}) →
                </button>
              </div>

              <SearchBar
                value={filters.searchQuery}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
                onSelectQuickSuggestion={handleQuickSuggestion}
              />
            </div>

            {/* Featured Stations Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 font-['Cabinet_Grotesk',sans-serif]">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>Featured Nigerian Stations</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-300/70">
                    Flagship on-air broadcasters loved across Lagos, Abuja, Port Harcourt & Kano
                  </p>
                </div>

                <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-300 text-xs font-semibold border border-emerald-800/60">
                  {featuredStations.length} Featured
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {featuredStations.map((station) => (
                  <StationCard key={station.id} station={station} featured />
                ))}
              </div>
            </section>

            {/* Visual Category & Region Browser */}
            <CategoryBrowser
              onSelectRegion={handleSelectRegion}
              onSelectGenre={handleSelectGenre}
              onSelectLanguage={handleSelectLanguage}
              activeRegion={filters.region}
              activeGenre={filters.genre}
              activeLanguage={filters.language}
            />

            {/* Lagos & Abuja Special Spotlight Showcase */}
            <section className="mb-12 bg-gradient-to-r from-[#062415] to-[#041a0f] p-5 sm:p-7 rounded-3xl border border-emerald-800/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Broadcasting Capital & Mega City
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk',sans-serif]">
                    Lagos & Abuja Top Stations
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, state: 'Lagos' }));
                    setCurrentTab('browse');
                  }}
                  className="text-xs text-emerald-300 hover:text-white font-semibold underline self-start"
                >
                  Browse all Lagos stations →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stations
                  .filter((s) => s.state === 'Lagos' || s.state === 'Abuja (FCT)')
                  .slice(0, 6)
                  .map((station) => (
                    <StationCard key={station.id} station={station} />
                  ))}
              </div>
            </section>

          </div>
        )}

        {/* ===================== TAB: BROWSE ALL STATIONS ===================== */}
        {currentTab === 'browse' && (
          <div>
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Compass className="w-5 h-5 text-amber-400" />
                <h1 className="text-2xl sm:text-3xl font-black text-white font-['Cabinet_Grotesk',sans-serif]">
                  Explore Nigerian Radio Stations
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-emerald-300/70">
                Filter and discover live streams by state, city, region, language, and genre.
              </p>
            </div>

            {/* Search Input */}
            <div className="mb-5">
              <SearchBar
                value={filters.searchQuery}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
                onSelectQuickSuggestion={handleQuickSuggestion}
              />
            </div>

            {/* Filter Bar with State, City, Region, Language, Genre selectors */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              totalFilteredCount={filteredStations.length}
              totalCount={stations.length}
            />

            {/* Station Results Grid */}
            {filteredStations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStations.map((station) => (
                  <StationCard key={station.id} station={station} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16 px-4 bg-[#051c11] rounded-3xl border border-emerald-800/60 max-w-xl mx-auto my-8">
                <div className="w-16 h-16 rounded-full bg-emerald-900/60 text-amber-400 flex items-center justify-center mx-auto mb-4">
                  <SearchX className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No Radio Stations Match Your Search
                </h3>
                <p className="text-xs sm:text-sm text-emerald-300/80 mb-6 max-w-md mx-auto">
                  We couldn't find any station matching "{filters.searchQuery || filters.state || filters.genre}". Try clearing your filters or suggest this station to us!
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                  <button
                    onClick={openSuggestModal}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-950" />
                    <span>Suggest this Station</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: FAVORITES ===================== */}
        {currentTab === 'favorites' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-['Cabinet_Grotesk',sans-serif]">
                    Your Favorite Stations
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-emerald-300/70">
                  Quick access to the stations you love most. Saved locally on your device.
                </p>
              </div>

              {favoritedStations.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                  {favoritedStations.length} Saved
                </span>
              )}
            </div>

            {favoritedStations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {favoritedStations.map((station) => (
                  <StationCard key={station.id} station={station} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-[#051c11] rounded-3xl border border-emerald-800/60 max-w-md mx-auto my-8">
                <div className="w-16 h-16 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-800/50">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  No Favorites Saved Yet
                </h3>
                <p className="text-xs sm:text-sm text-emerald-300/80 mb-6">
                  Tap the heart icon on any radio station card to save it here for instant one-tap listening.
                </p>
                <button
                  onClick={() => setCurrentTab('discover')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Discover Stations
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: RECENTLY PLAYED ===================== */}
        {currentTab === 'recent' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <History className="w-6 h-6 text-amber-400" />
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-['Cabinet_Grotesk',sans-serif]">
                    Recently Played Stations
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-emerald-300/70">
                  Pick up right where you left off from your listening history.
                </p>
              </div>

              {recentlyPlayed.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                  {recentlyPlayed.length} Stations
                </span>
              )}
            </div>

            {recentlyPlayed.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recentlyPlayed.map((station) => (
                  <StationCard key={station.id} station={station} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-[#051c11] rounded-3xl border border-emerald-800/60 max-w-md mx-auto my-8">
                <div className="w-16 h-16 rounded-full bg-emerald-900/60 text-emerald-300 flex items-center justify-center mx-auto mb-4">
                  <Radio className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  No Recent Stations Yet
                </h3>
                <p className="text-xs sm:text-sm text-emerald-300/80 mb-6">
                  When you tap "Listen Live" on any station, it will automatically appear here for quick replay.
                </p>
                <button
                  onClick={() => setCurrentTab('discover')}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  Tune in to Live Radio
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation (Visible on phones) */}
      <MobileNav currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Persistent Audio Player Dock (Fixed at bottom) */}
      <AudioPlayerBottomBar />

      {/* Modals */}
      <StationDetailModal />
      <SuggestStationModal />
    </div>
  );
};

export default function App() {
  return (
    <PlayerProvider>
      <MainContent />
    </PlayerProvider>
  );
}
