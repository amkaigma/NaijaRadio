import React from 'react';
import { Play, Pause, Heart, Radio, MapPin, Volume2, Info, Share2, AlertCircle } from 'lucide-react';
import { Station } from '../types/radio';
import { useRadioPlayer } from '../context/PlayerContext';

interface StationCardProps {
  station: Station;
  featured?: boolean;
}

export const StationCard: React.FC<StationCardProps> = ({ station, featured = false }) => {
  const {
    currentStation,
    isPlaying,
    isBuffering,
    playStation,
    togglePlayPause,
    isFavorite,
    toggleFavorite,
    openStationDetail,
  } = useRadioPlayer();

  const isCurrent = currentStation?.id === station.id;
  const isThisPlaying = isCurrent && isPlaying;
  const isThisBuffering = isCurrent && isBuffering;
  const favorited = isFavorite(station.id);
  const hasStream = Boolean(station.streamUrl);

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasStream) return;

    if (isCurrent) {
      togglePlayPause();
    } else {
      playStation(station);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(station.id);
  };

  const handleCardClick = () => {
    openStationDetail(station);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Tune in to ${station.name} (${station.frequency} - ${station.city}, ${station.state}) on Naija Radio!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: station.name,
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // Share cancelled or unavailable
      }
    } else {
      await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      alert(`Copied link to ${station.name}!`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-gradient-to-b from-[#092b1b] to-[#051c11] rounded-2xl p-4 sm:p-5 border transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col justify-between ${
        isThisPlaying
          ? 'border-emerald-400 ring-2 ring-emerald-500/30 shadow-emerald-950/70 -translate-y-1'
          : 'border-emerald-800/50 hover:border-emerald-600/60 hover:-translate-y-0.5'
      }`}
    >
      {/* Top Banner Accents */}
      <div>
        {/* Header row: Frequency Dial Badge & Heart Favorite */}
        <div className="flex items-start justify-between gap-2 mb-3">
          
          {/* Station Frequency & Live Status */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span 
              className="px-2.5 py-1 rounded-lg text-xs font-black tracking-wide text-white shadow-sm border border-white/10"
              style={{ backgroundColor: station.brandColor || '#008751' }}
            >
              {station.frequency}
            </span>

            {isThisPlaying && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-emerald-950 animate-pulse">
                <Volume2 className="w-3 h-3" />
                ON AIR
              </span>
            )}

            {station.isCommunitySubmitted && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Community
              </span>
            )}
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full text-emerald-300/50 hover:text-white hover:bg-emerald-800/40 transition-colors"
              title="Share station"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFavoriteClick}
              className={`p-1.5 rounded-full transition-transform active:scale-125 ${
                favorited
                  ? 'text-rose-500 hover:text-rose-400'
                  : 'text-emerald-300/50 hover:text-rose-400 hover:bg-emerald-800/40'
              }`}
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Station Logo & Main Info */}
        <div className="flex items-start gap-3.5 mb-3">
          {/* Logo / Emblem */}
          <div 
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg shrink-0 shadow-md relative overflow-hidden border border-white/10 group-hover:scale-105 transition-transform"
            style={{ 
              background: `linear-gradient(135deg, ${station.brandColor || '#046A38'}, #022013)` 
            }}
          >
            {/* Subtle stylized wave or emblem */}
            <div className="absolute inset-0 bg-black/20" />
            <Radio className="w-6 h-6 text-white/90 relative z-10" />
            
            {/* Playing equalizer bars inside logo */}
            {isThisPlaying && (
              <div className="absolute bottom-1 flex items-end gap-0.5 z-20">
                <span className="w-1 bg-amber-400 h-3 animate-bounce" />
                <span className="w-1 bg-amber-400 h-4 animate-bounce delay-75" />
                <span className="w-1 bg-amber-400 h-2 animate-bounce delay-150" />
              </div>
            )}
          </div>

          {/* Name & Tagline */}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white text-base sm:text-lg leading-tight truncate group-hover:text-amber-300 transition-colors">
              {station.name}
            </h3>
            <p className="text-xs text-emerald-300/80 italic line-clamp-1 mt-0.5">
              "{station.tagline}"
            </p>
            
            {/* Location (City & State & Region) */}
            <div className="flex items-center gap-1 text-xs text-emerald-200/60 mt-1 font-medium">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{station.city}, {station.state}</span>
              <span className="text-emerald-500/50">•</span>
              <span className="text-[11px] text-emerald-400/80">{station.region}</span>
            </div>
          </div>
        </div>

        {/* Languages & Genre Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
            {station.genre}
          </span>
          {station.languages.map((lang) => (
            <span
              key={lang}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#0b2b1a] text-amber-300/90 border border-amber-400/20"
            >
              {lang}
            </span>
          ))}
          {station.bitrate && (
            <span className="text-[10px] text-emerald-400/50 ml-auto hidden sm:inline">
              {station.bitrate}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Action Buttons */}
      <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            openStationDetail(station);
          }}
          className="text-xs text-emerald-300/70 hover:text-white flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-emerald-900/30 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>

        {/* 
          CRITICAL REQUIREMENT FROM PROMPT:
          "Only show a Listen Live button when a working stream URL is available."
        */}
        {hasStream ? (
          <button
            onClick={handlePlayToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
              isThisPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-emerald-950 shadow-amber-500/20'
                : isThisBuffering
                ? 'bg-emerald-700 text-white cursor-wait'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 hover:shadow-emerald-500/20'
            }`}
          >
            {isThisBuffering ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : isThisPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-emerald-950" />
                <span>Playing</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Listen Live</span>
              </>
            )}
          </button>
        ) : (
          /* Stream Offline Indicator when stream URL is unavailable */
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-900 text-emerald-400/50 text-[11px] font-semibold" title="Stream offline or broadcast only">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500/70" />
            <span>Stream Offline</span>
          </div>
        )}
      </div>

    </div>
  );
};
