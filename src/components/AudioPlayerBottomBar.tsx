import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Maximize2, 
  Clock, 
  RotateCcw, 
  Heart, 
  Radio, 
  AlertTriangle,
  X
} from 'lucide-react';
import { useRadioPlayer } from '../context/PlayerContext';

export const AudioPlayerBottomBar: React.FC = () => {
  const {
    currentStation,
    isPlaying,
    isBuffering,
    volume,
    isMuted,
    error,
    notice,
    togglePlayPause,
    setVolume,
    toggleMute,
    openStationDetail,
    sleepTimerMinutes,
    sleepTimerRemainingSec,
    setSleepTimer,
    isFavorite,
    toggleFavorite,
    retryPlayback,
    stopPlayback,
  } = useRadioPlayer();

  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);

  if (!currentStation) return null;

  const favorited = isFavorite(currentStation.id);

  // Format sleep timer
  const formatTimer = (sec: number | null) => {
    if (sec === null) return '';
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#041a0f]/98 backdrop-blur-xl border-t border-emerald-700/60 shadow-2xl transition-all">
      
      {/* Stream Error Notification banner if any */}
      {error && (
        <div className="bg-rose-950/95 border-b border-rose-800/80 px-3 sm:px-4 h-7 sm:h-auto sm:py-2 flex items-center justify-between text-[11px] sm:text-xs text-rose-200">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={retryPlayback}
              className="px-2 py-0.5 rounded bg-rose-800 hover:bg-rose-700 text-white font-bold text-[10px] sm:text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
            <button
              onClick={stopPlayback}
              className="p-0.5 sm:p-1 hover:text-white cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Stream Relay Notice banner */}
      {notice && !error && (
        <div className="bg-emerald-950/95 border-b border-emerald-800/80 px-3 sm:px-4 h-7 sm:h-auto sm:py-1.5 flex items-center justify-between text-[11px] text-amber-300">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
            <span className="truncate font-medium">{notice}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-[55px] sm:h-auto sm:py-2.5 flex items-center">
        <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
          
          {/* LEFT: Station Info & Logo */}
          <div 
            onClick={() => openStationDetail(currentStation)}
            className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial sm:max-w-[35%] cursor-pointer group"
          >
            {/* Station Artwork Badge */}
            <div 
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-white shrink-0 relative overflow-hidden border border-white/20 shadow-md group-hover:scale-105 transition-transform"
              style={{ background: `linear-gradient(135deg, ${currentStation.brandColor || '#008751'}, #021a0e)` }}
            >
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              
              {/* Equalizer Wave effect if playing */}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-0.5 px-2">
                  <span className="w-0.5 sm:w-1 bg-amber-400 h-2 animate-pulse" />
                  <span className="w-0.5 sm:w-1 bg-amber-400 h-4 animate-pulse delay-100" />
                  <span className="w-0.5 sm:w-1 bg-amber-400 h-2.5 animate-pulse delay-200" />
                </div>
              )}
            </div>

            {/* Title & Location */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-extrabold text-white truncate group-hover:text-amber-400 transition-colors">
                  {currentStation.name}
                </h4>
                {isPlaying && !isBuffering && !error && (
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-600 text-white">
                    LIVE
                  </span>
                )}
                {isBuffering && !error && (
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    CONNECTING
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-300/75 truncate">
                <span className="font-semibold text-amber-300">{currentStation.frequency}</span>
                <span>·</span>
                <span className="truncate">{currentStation.city}, {currentStation.state}</span>
              </div>
            </div>
          </div>

          {/* CENTER: Main Playback Controls & Waveform */}
          <div className="flex flex-col items-center justify-center sm:flex-1 sm:max-w-[320px] shrink-0">
            <div className="flex items-center gap-1 sm:gap-4">
              
              {/* Favorite Quick Toggle */}
              <button
                onClick={() => toggleFavorite(currentStation.id)}
                className={`p-1.5 sm:p-2 rounded-full transition-transform active:scale-125 cursor-pointer ${
                  favorited ? 'text-rose-500' : 'text-emerald-400/65 hover:text-white'
                }`}
                title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                aria-label="Toggle favorite"
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${favorited ? 'fill-rose-500' : ''}`} />
              </button>

              {/* Main Play/Pause Button */}
              <button
                onClick={togglePlayPause}
                disabled={isBuffering}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'Pause broadcast' : 'Play broadcast'}
                aria-label={isPlaying ? 'Pause broadcast' : 'Play broadcast'}
              >
                {isBuffering ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-emerald-950" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-emerald-950 ml-0.5" />
                )}
              </button>

              {/* Sleep Timer button */}
              <div className="relative">
                <button
                  onClick={() => setShowSleepMenu(!showSleepMenu)}
                  className={`p-1.5 sm:p-2 rounded-full transition-colors relative cursor-pointer ${
                    sleepTimerRemainingSec !== null
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-emerald-400/65 hover:text-white'
                  }`}
                  title="Sleep Timer"
                  aria-label="Sleep Timer"
                >
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  {sleepTimerRemainingSec !== null && (
                    <span className="absolute -top-0.5 -right-1.5 text-[9px] font-bold bg-amber-400 text-emerald-950 px-1 rounded-full tabular-nums">
                      {Math.ceil(sleepTimerRemainingSec / 60)}m
                    </span>
                  )}
                </button>

                {showSleepMenu && (
                  <div className="absolute bottom-11 right-0 w-44 bg-[#082618] border border-emerald-700/80 rounded-xl shadow-2xl p-2 z-50 text-xs">
                    <div className="px-2 py-1 text-[11px] font-bold text-emerald-300/60 uppercase">
                      Sleep Timer
                    </div>
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => {
                          setSleepTimer(mins);
                          setShowSleepMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                          sleepTimerMinutes === mins
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-emerald-200 hover:bg-emerald-900/60'
                        }`}
                      >
                        <span>{mins} minutes</span>
                        {sleepTimerMinutes === mins && <span>✓</span>}
                      </button>
                    ))}
                    {sleepTimerMinutes !== null && (
                      <button
                        onClick={() => {
                          setSleepTimer(null);
                          setShowSleepMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-rose-300 hover:bg-rose-950/40 mt-1 border-t border-emerald-900/60"
                      >
                        Turn Off Timer
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Audio Wave Visualizer Simulation when Playing */}
            <div className="hidden sm:flex items-center gap-0.5 h-2.5 mt-0.5">
              {isPlaying ? (
                <>
                  <span className="w-0.5 bg-emerald-400 rounded-full h-1.5 animate-bounce" />
                  <span className="w-0.5 bg-emerald-400 rounded-full h-2.5 animate-bounce delay-75" />
                  <span className="w-0.5 bg-amber-400 rounded-full h-3 animate-bounce delay-150" />
                  <span className="w-0.5 bg-emerald-400 rounded-full h-2 animate-bounce delay-100" />
                  <span className="w-0.5 bg-emerald-400 rounded-full h-1.5 animate-bounce delay-200" />
                  <span className="w-0.5 bg-amber-400 rounded-full h-2.5 animate-bounce delay-300" />
                </>
              ) : (
                <span className="text-[10px] text-emerald-400/50">Paused</span>
              )}
            </div>
          </div>

          {/* RIGHT: Volume & Expand */}
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            
            {/* Desktop Volume Slider */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-emerald-400 hover:text-white p-1 cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 sm:w-24 h-1.5 bg-emerald-950 accent-amber-400 rounded-lg cursor-pointer"
              />
            </div>

            {/* Mobile Volume Popup trigger */}
            <div className="lg:hidden relative">
              <button
                onClick={() => setShowVolumePopup(!showVolumePopup)}
                className="p-1.5 sm:p-2 text-emerald-400 hover:text-white cursor-pointer"
                title="Volume"
                aria-label="Volume"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {showVolumePopup && (
                <div className="absolute bottom-11 right-0 bg-[#082618] border border-emerald-700 p-3 rounded-xl shadow-xl flex items-center gap-2 z-50">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-28 h-2 bg-emerald-950 accent-amber-400 rounded-lg"
                  />
                  <button
                    onClick={toggleMute}
                    className="text-xs text-amber-300 font-bold ml-1"
                  >
                    {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
                  </button>
                </div>
              )}
            </div>

            {/* Expand / Details modal trigger */}
            <button
              onClick={() => openStationDetail(currentStation)}
              className="p-1.5 sm:p-2 rounded-lg text-emerald-300/70 hover:text-white hover:bg-emerald-800/40 transition-colors cursor-pointer"
              title="Station Details"
              aria-label="Station Details"
            >
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
