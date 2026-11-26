import React from 'react';
import { Play, Pause, Heart, Radio, MapPin, Volume2, Info, Share2, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { Station } from '../types/radio';
import { useRadioPlayer } from '../context/PlayerContext';

interface StationCardProps {
  station: Station;
  featured?: boolean;
}

export const StationCard: React.FC<StationCardProps> = ({ station }) => {
  const {
    currentStation,
    isPlaying,
    isBuffering,
    playStation,
    togglePlayPause,
    isFavorite,
    toggleFavorite,
    openStationDetail,
    retryOfflineStation,
    verifyingStationIds,
  } = useRadioPlayer();

  const [copied, setCopied] = React.useState(false);

  const isCurrent = currentStation?.id === station.id;
  const isThisPlaying = isCurrent && isPlaying;
  const isThisBuffering = isCurrent && isBuffering;
  const favorited = isFavorite(station.id);
  const hasStream = Boolean(station.streamUrl);
  const isVerifying = verifyingStationIds.includes(station.id);

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasStream) return;

    if (isCurrent) {
      togglePlayPause();
    } else {
      playStation(station);
    }
  };

  const handleRetryOffline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await retryOfflineStation(station);
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
    } else if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard unavailable
      }
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-gradient-to-b from-[#092b1b] to-[#051c11] rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border transition-all duration-200 hover:shadow-xl cursor-pointer flex flex-col justify-between ${
        isThisPlaying
          ? 'border-emerald-400 ring-1 sm:ring-2 ring-emerald-500/30 shadow-emerald-950/70'
          : 'border-emerald-800/50 hover:border-emerald-600/60'
      }`}
    >
      {/* Top Content: Compact Row on Mobile & Desktop */}
      <div className="flex items-start gap-2.5 sm:gap-3">
        {/* Logo / Emblem */}
        <div 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-md relative overflow-hidden border border-white/10 group-hover:scale-105 transition-transform"
          style={{ 
            background: `linear-gradient(135deg, ${station.brandColor || '#046A38'}, #022013)` 
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <Radio className="w-5 h-5 text-white/90 relative z-10" />
          
          {isThisPlaying && (
            <div className="absolute bottom-0.5 flex items-end gap-0.5 z-20">
              <span className="w-0.5 bg-amber-400 h-2 animate-bounce" />
              <span className="w-0.5 bg-amber-400 h-3 animate-bounce delay-75" />
              <span className="w-0.5 bg-amber-400 h-1.5 animate-bounce delay-150" />
            </div>
          )}
        </div>

        {/* Main Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-sm sm:text-base leading-tight truncate group-hover:text-amber-300 transition-colors">
                  {station.name}
                </h3>
                {isThisPlaying && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-emerald-950 shrink-0">
                    <Volume2 className="w-2.5 h-2.5" />
                    ON AIR
                  </span>
                )}
              </div>

              {/* Frequency & Location compact line */}
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-emerald-200/75 mt-0.5 font-medium truncate">
                <span className="font-bold text-amber-300 shrink-0 tabular-nums">{station.frequency}</span>
                <span aria-hidden="true" className="text-emerald-500/60">·</span>
                <MapPin className="w-3 h-3 text-amber-400/80 shrink-0 hidden sm:inline" />
                <span className="truncate">{station.city}, {station.state}</span>
              </div>
            </div>

            {/* Quick Action Icons */}
            <div className="flex items-center gap-0.5 shrink-0 -mr-1 -mt-0.5">
              <button
                onClick={handleShare}
                className="p-1.5 rounded-full text-emerald-300/50 hover:text-white hover:bg-emerald-800/40 transition-colors cursor-pointer"
                title={copied ? 'Link copied!' : 'Share station'}
                aria-label="Share station"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleFavoriteClick}
                className={`p-1.5 rounded-full transition-transform active:scale-125 cursor-pointer ${
                  favorited
                    ? 'text-rose-500 hover:text-rose-400'
                    : 'text-emerald-300/50 hover:text-rose-400 hover:bg-emerald-800/40'
                }`}
                title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Unboxed clean Genre & Languages metadata */}
          <div className="flex items-center gap-1 text-[11px] text-emerald-300/70 mt-1 truncate">
            <span className="text-emerald-300 font-semibold shrink-0">{station.genre}</span>
            <span aria-hidden="true" className="text-emerald-600">·</span>
            <span className="truncate text-amber-200/80">{station.languages.join(', ')}</span>
            {station.isCommunitySubmitted && (
              <>
                <span aria-hidden="true" className="text-emerald-600">·</span>
                <span className="text-amber-300 shrink-0">Community</span>
              </>
            )}
          </div>

          {/* Tagline visible cleanly on larger screens */}
          <p className="hidden sm:block text-[11px] text-emerald-300/65 italic line-clamp-1 mt-1">
            "{station.tagline}"
          </p>
        </div>
      </div>

      {/* Card Footer: Action Buttons */}
      <div className="mt-2 sm:mt-3 pt-2 border-t border-emerald-900/40 flex items-center justify-between gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            openStationDetail(station);
          }}
          className="text-[11px] sm:text-xs text-emerald-300/75 hover:text-white flex items-center gap-1 py-1 px-1.5 rounded-lg hover:bg-emerald-900/30 transition-colors shrink-0 cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Details</span>
          {station.region && (
            <span className="hidden sm:inline text-emerald-400/50 ml-0.5">· {station.region}</span>
          )}
        </button>

        {/* Listen Live button ONLY when a working stream URL is available */}
        {hasStream ? (
          <button
            onClick={handlePlayToggle}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap ${
              isThisPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-emerald-950 shadow-amber-500/20'
                : isThisBuffering
                ? 'bg-emerald-700 text-white cursor-wait'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
            }`}
          >
            {isThisBuffering ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : isThisPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-emerald-950" />
                <span>Playing</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Listen Live</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1 min-w-0">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-900 text-emerald-300/70 text-[10px] sm:text-[11px] font-medium min-w-0"
              title="Live stream currently unavailable."
            >
              <AlertCircle className="w-3 h-3 text-amber-500/80 shrink-0" />
              <span className="truncate">Live stream currently unavailable.</span>
            </div>
            <button
              onClick={handleRetryOffline}
              disabled={isVerifying}
              className="p-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/70 text-emerald-300 hover:text-white border border-emerald-800/70 transition-colors shrink-0 cursor-pointer disabled:opacity-60"
              title="Retry checking stream availability"
              aria-label="Retry checking stream availability"
            >
              <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
