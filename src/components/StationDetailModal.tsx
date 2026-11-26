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
  Tv, 
  User, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Check,
  RefreshCw,
  CheckCircle2
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
    retryOfflineStation,
    verifyingStationIds,
  } = useRadioPlayer();

  const [copied, setCopied] = React.useState(false);
  const [retryFeedback, setRetryFeedback] = React.useState<string | null>(null);

  if (!isDetailOpen || !selectedStationForDetail) return null;

  const station = selectedStationForDetail;
  const isCurrent = currentStation?.id === station.id;
  const isThisPlaying = isCurrent && isPlaying;
  const isThisBuffering = isCurrent && isBuffering;
  const favorited = isFavorite(station.id);
  const hasStream = Boolean(station.streamUrl);
  const isVerifying = verifyingStationIds.includes(station.id);

  const handlePlayToggle = () => {
    if (!hasStream) return;
    setRetryFeedback(null);
    if (isCurrent) {
      togglePlayPause();
    } else {
      playStation(station);
    }
  };

  const handleRetryOffline = async () => {
    setRetryFeedback(null);
    const live = await retryOfflineStation(station);
    if (!live) {
      setRetryFeedback('Live stream currently unavailable. No active online broadcast was detected.');
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
    } else if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard unavailable
      }
    }
  };

  return (
    <div
      onClick={closeStationDetail}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div 
        className="relative w-full max-w-xl max-h-[88vh] overflow-y-auto bg-gradient-to-b from-[#092e1c] to-[#04160d] border border-emerald-700/80 rounded-2xl sm:rounded-3xl shadow-2xl text-white p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeStationDetail}
          className="absolute top-3 right-3 p-1.5 sm:p-2 rounded-full bg-emerald-950/80 text-emerald-300 hover:text-white hover:bg-emerald-900 border border-emerald-700/50 transition-colors z-20 cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Station Frequency Dial Visual Accent */}
        <div className="bg-[#03150b] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 mb-3.5 sm:mb-5 border border-emerald-900 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="flex items-center gap-2.5 w-full max-w-md px-1">
            <span className="text-[10px] text-emerald-500 font-mono">87.5</span>
            <div className="flex-1 h-2.5 relative flex items-center">
              <div className="w-full flex justify-between items-center opacity-30">
                {Array.from({ length: 21 }).map((_, i) => (
                  <div key={i} className={`w-0.5 ${i % 5 === 0 ? 'h-2.5 bg-white' : 'h-1.5 bg-emerald-400'}`} />
                ))}
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-3.5 bg-amber-400 rounded-sm shadow-md shadow-amber-400/50 flex items-center justify-center">
                <div className="w-0.5 h-full bg-emerald-950" />
              </div>
            </div>
            <span className="text-[10px] text-emerald-500 font-mono">108.0</span>
          </div>

          <div className="text-lg sm:text-2xl font-black text-amber-300 mt-1 font-mono tracking-tight tabular-nums">
            {station.frequency}
          </div>
        </div>

        {/* Main Station Header */}
        <div className="flex items-center sm:items-start gap-3 sm:gap-4 mb-4 text-left">
          <div 
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-white shadow-xl shrink-0 relative overflow-hidden border border-white/20"
            style={{ 
              background: `linear-gradient(135deg, ${station.brandColor || '#008751'}, #01140b)` 
            }}
          >
            <Radio className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
            {isThisPlaying && (
              <span className="absolute bottom-0.5 px-1.5 py-0.5 bg-amber-400 text-emerald-950 text-[8px] font-black rounded">
                ON AIR
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-6 sm:pr-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-emerald-300/80 mb-0.5">
              <span className="font-bold text-emerald-300">{station.genre}</span>
              <span aria-hidden="true" className="text-emerald-600">·</span>
              <span>{station.region}</span>
              {station.streamFormat && station.streamFormat !== 'Offline' && (
                <>
                  <span aria-hidden="true" className="text-emerald-600">·</span>
                  <span className="font-bold text-amber-300">{station.streamFormat}</span>
                </>
              )}
              {station.verificationStatus === 'VERIFIED' && (
                <>
                  <span aria-hidden="true" className="text-emerald-600">·</span>
                  <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight">
              {station.name}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-300/85 italic mt-0.5 line-clamp-1">
              "{station.tagline}"
            </p>

            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-emerald-200/80 mt-1 font-medium">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{station.city}, {station.state} State, Nigeria</span>
            </div>
          </div>
        </div>

        {/* Listen Live & Favorite Actions */}
        <div className="flex items-center gap-2 mb-3.5">
          {hasStream ? (
            <button
              onClick={handlePlayToggle}
              className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer ${
                isThisPlaying
                  ? 'bg-amber-400 hover:bg-amber-300 text-emerald-950 shadow-amber-400/25'
                  : isThisBuffering
                  ? 'bg-emerald-700 text-white cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
              }`}
            >
              {isThisBuffering ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : isThisPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-emerald-950" />
                  <span>Pause Stream</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Listen Live Now</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-between gap-2 py-2 px-3 rounded-xl sm:rounded-2xl bg-emerald-950/80 border border-emerald-900 text-emerald-200/80 text-xs font-semibold min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">Live stream currently unavailable.</span>
              </div>
              <button
                onClick={handleRetryOffline}
                disabled={isVerifying}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-800/70 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? 'Checking...' : 'Retry'}</span>
              </button>
            </div>
          )}

          <button
            onClick={() => toggleFavorite(station.id)}
            className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all active:scale-95 cursor-pointer ${
              favorited
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-[#0a2c1b] text-emerald-300 border-emerald-800/80 hover:text-white hover:bg-emerald-800/40'
            }`}
            title={favorited ? 'Remove favorite' : 'Add to favorites'}
            aria-label={favorited ? 'Remove favorite' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${favorited ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#0a2c1b] text-emerald-300 border border-emerald-800/80 hover:text-white hover:bg-emerald-800/40 transition-all active:scale-95 cursor-pointer"
            title={copied ? 'Link copied!' : 'Share station'}
            aria-label="Share station"
          >
            {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        {retryFeedback && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
            {retryFeedback}
          </div>
        )}

        {/* Station Details Grid */}
        <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
          {station.description && (
            <div className="bg-[#051c11] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-900/60">
              <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                About {station.name}
              </h4>
              <p className="text-emerald-200/90 leading-relaxed text-xs sm:text-sm">
                {station.description}
              </p>
              {station.verificationNotes && (
                <p className="text-[11px] text-emerald-300/60 mt-2 pt-1.5 border-t border-emerald-900/60">
                  Stream note: {station.verificationNotes}
                </p>
              )}
            </div>
          )}

          {station.currentShow && (
            <div className="bg-[#051c11] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-900/60 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <Tv className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase text-emerald-400/70">
                  On-Air Program
                </span>
                <p className="font-bold text-white text-xs sm:text-sm truncate">
                  {station.currentShow}
                </p>
                {station.hostName && (
                  <p className="text-[11px] text-emerald-300/80 flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3 text-amber-400" />
                    <span>Hosted by {station.hostName}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-[#051c11] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-900/60">
            <span className="text-[10px] font-bold uppercase text-emerald-400/70 block mb-1">
              Broadcast Languages
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-amber-300">
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{station.languages.join(' · ')}</span>
            </div>
          </div>

          {(station.website || station.twitter) && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
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
