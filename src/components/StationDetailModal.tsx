import React from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Heart, 
  MapPin, 
  Radio, 
  Globe, 
  Share2, 
  Volume2, 
  Tv, 
  User, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useRadioPlayer } from '../context/PlayerContext';

export const StationDetailModal: React.FC = () => {
  const {
    selectedStationForDetail,
    isDetailOpen,
    closeStationDetail,
    currentStation,
    isPlaying,
    isBuffering,
    playStation,
    togglePlayPause,
    isFavorite,
    toggleFavorite,
  } = useRadioPlayer();

  if (!isDetailOpen || !selectedStationForDetail) return null;

  const station = selectedStationForDetail;
  const isCurrent = currentStation?.id === station.id;
  const isThisPlaying = isCurrent && isPlaying;
  const isThisBuffering = isCurrent && isBuffering;
  const favorited = isFavorite(station.id);
  const hasStream = Boolean(station.streamUrl);

  const handlePlayToggle = () => {
    if (!hasStream) return;
    if (isCurrent) {
      togglePlayPause();
    } else {
      playStation(station);
    }
  };

  const handleShare = async () => {
    const text = `Listen live to ${station.name} (${station.frequency}) on Naija Radio!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: station.name,
          text,
          url: window.location.href,
        });
      } catch {
        // share dismissed
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      alert(`Link to ${station.name} copied to clipboard!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#092e1c] to-[#04160d] border border-emerald-700/80 rounded-3xl shadow-2xl text-white p-5 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeStationDetail}
          className="absolute top-4 right-4 p-2 rounded-full bg-emerald-950/80 text-emerald-300 hover:text-white hover:bg-emerald-900 border border-emerald-700/50 transition-colors z-20"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Station Frequency Dial Visual Accent */}
        <div className="bg-[#03150b] rounded-2xl p-3 mb-6 border border-emerald-900 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/60 mb-1">
            FM Broadcast Frequency
          </div>
          
          <div className="flex items-center gap-3 w-full max-w-md px-2">
            <span className="text-[10px] text-emerald-500 font-mono">87.5</span>
            <div className="flex-1 h-3 relative flex items-center">
              {/* Dial tick marks */}
              <div className="w-full flex justify-between items-center opacity-30">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`w-0.5 ${i % 5 === 0 ? 'h-3 bg-white' : 'h-1.5 bg-emerald-400'}`} />
                ))}
              </div>
              {/* Indicator needle */}
              <div className="absolute left-1/2 -translate-x-1/2 w-2 h-4 bg-amber-400 rounded-sm shadow-md shadow-amber-400/50 flex items-center justify-center">
                <div className="w-0.5 h-full bg-emerald-950" />
              </div>
            </div>
            <span className="text-[10px] text-emerald-500 font-mono">108.0</span>
          </div>

          <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1 font-mono tracking-tight">
            {station.frequency}
          </div>
        </div>

        {/* Main Station Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 text-center sm:text-left">
          
          {/* Logo badge */}
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center font-black text-white text-3xl shadow-xl shrink-0 relative overflow-hidden border border-white/20"
            style={{ 
              background: `linear-gradient(135deg, ${station.brandColor || '#008751'}, #01140b)` 
            }}
          >
            <Radio className="w-10 h-10 text-white" />
            {isThisPlaying && (
              <span className="absolute bottom-1 px-2 py-0.5 bg-amber-400 text-emerald-950 text-[9px] font-black rounded-md">
                ON AIR
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white">
                {station.genre}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0d3320] text-emerald-200 border border-emerald-700/60">
                {station.region}
              </span>
              {station.bitrate && (
                <span className="text-xs text-emerald-400/60 font-mono">
                  {station.bitrate}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {station.name}
            </h2>
            <p className="text-sm text-emerald-300 italic mt-0.5">
              "{station.tagline}"
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-emerald-200/80 mt-2 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{station.city}, {station.state} State, Nigeria</span>
            </div>
          </div>
        </div>

        {/* Listen Live & Favorite Actions */}
        <div className="flex items-center gap-3 mb-6">
          {/* 
            CRITICAL REQUIREMENT:
            "Only show a Listen Live button when a working stream URL is available."
          */}
          {hasStream ? (
            <button
              onClick={handlePlayToggle}
              className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg active:scale-98 transition-all cursor-pointer ${
                isThisPlaying
                  ? 'bg-amber-400 hover:bg-amber-300 text-emerald-950 shadow-amber-400/25'
                  : isThisBuffering
                  ? 'bg-emerald-700 text-white cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
              }`}
            >
              {isThisBuffering ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting Stream...</span>
                </>
              ) : isThisPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-emerald-950" />
                  <span>Pause Stream</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>Listen Live Now</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 py-3 px-4 rounded-2xl bg-emerald-950/80 border border-emerald-900 text-emerald-300/60 flex items-center justify-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Stream Currently Offline (Antenna/Tower broadcast only)</span>
            </div>
          )}

          <button
            onClick={() => toggleFavorite(station.id)}
            className={`p-3.5 rounded-2xl border transition-all active:scale-95 ${
              favorited
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-[#0a2c1b] text-emerald-300 border-emerald-800/80 hover:text-white hover:bg-emerald-800/40'
            }`}
            title={favorited ? 'Remove favorite' : 'Add to favorites'}
          >
            <Heart className={`w-5 h-5 ${favorited ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-3.5 rounded-2xl bg-[#0a2c1b] text-emerald-300 border border-emerald-800/80 hover:text-white hover:bg-emerald-800/40 transition-all active:scale-95"
            title="Share station"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Station Details Grid */}
        <div className="space-y-4 text-xs sm:text-sm">
          
          {/* About / Description */}
          {station.description && (
            <div className="bg-[#051c11] p-4 rounded-2xl border border-emerald-900/60">
              <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                About {station.name}
              </h4>
              <p className="text-emerald-200/90 leading-relaxed">
                {station.description}
              </p>
            </div>
          )}

          {/* Current Show / Program */}
          {station.currentShow && (
            <div className="bg-[#051c11] p-4 rounded-2xl border border-emerald-900/60 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-emerald-400/70">
                  Featured / On-Air Program
                </span>
                <p className="font-bold text-white text-sm">
                  {station.currentShow}
                </p>
                {station.hostName && (
                  <p className="text-xs text-emerald-300/80 flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3 text-amber-400" />
                    <span>Hosted by {station.hostName}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Languages & Metadata pills */}
          <div className="bg-[#051c11] p-4 rounded-2xl border border-emerald-900/60">
            <span className="text-[11px] font-bold uppercase text-emerald-400/70 block mb-2">
              Broadcast Languages
            </span>
            <div className="flex flex-wrap gap-2">
              {station.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#0e3722] text-amber-300 border border-amber-400/30 flex items-center gap-1.5"
                >
                  <Globe className="w-3 h-3 text-amber-400" />
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Station Links & Socials */}
          {(station.website || station.twitter) && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {station.website && (
                <a
                  href={station.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b291a] text-emerald-300 hover:text-white border border-emerald-800/60 text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Official Website</span>
                </a>
              )}
              {station.twitter && (
                <span className="text-xs text-emerald-400/80 font-mono">
                  {station.twitter}
                </span>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
