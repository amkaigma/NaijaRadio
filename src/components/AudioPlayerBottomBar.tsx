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
        <div className="bg-rose-950/90 border-b border-rose-800/80 px-4 py-2 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2 truncate">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={retryPlayback}
              className="px-2.5 py-0.5 rounded bg-rose-800 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
            <button
              onClick={stopPlayback}
              className="p-1 hover:text-white"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* LEFT: Station Info & Logo */}
          <div 
            onClick={() => openStationDetail(currentStation)}
            className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 max-w-[45%] sm:max-w-[35%] cursor-pointer group"
          >
            {/* Station Artwork Badge */}
            <div 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-white shrink-0 relative overflow-hidden border border-white/20 shadow-md group-hover:scale-105 transition-transform"
              style={{ background: `linear-gradient(135deg, ${currentStation.brandColor || '#008751'}, #021a0e)` }}
            >
              <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              
              {/* Equalizer Wave effect if playing */}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-0.5 px-2">
                  <span className="w-1 bg-amber-400 h-2.5 animate-pulse" />
                  <span className="w-1 bg-amber-400 h-5 animate-pulse delay-100" />
                  <span className="w-1 bg-amber-400 h-3 animate-pulse delay-200" />
                </div>
              )}
            </div>

            {/* Title & Location */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm sm:text-base font-extrabold text-white truncate group-hover:text-amber-400 transition-colors">
                  {currentStation.name}
                </h4>
                {isPlaying && (
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-600 text-white animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-emerald-300/70 truncate">
                <span className="font-semibold text-amber-300">{currentStation.frequency}</span>
                <span>•</span>
                <span className="truncate">{currentStation.city}, {currentStation.state}</span>
              </div>
            </div>
          </div>

          {/* CENTER: Main Playback Controls & Waveform */}
          <div className="flex flex-col items-center justify-center flex-1 max-w-[350px]">
            <div className="flex items-center gap-3 sm:gap-5">
              
              {/* Favorite Quick Toggle */}
              <button
                onClick={() => toggleFavorite(currentStation.id)}
                className={`p-2 rounded-full transition-transform active:scale-125 ${
                  favorited ? 'text-rose-500' : 'text-emerald-400/60 hover:text-white'
                }`}
                title={favorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${favorited ? 'fill-rose-500' : ''}`} />
              </button>

              {/* Main Big Play/Pause Button */}
              <button
                onClick={togglePlayPause}
                disabled={isBuffering}
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'Pause broadcast' : 'Play broadcast'}
              >
                {isBuffering ? (
                  <div className="w-5 h-5 border-3 border-emerald-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-emerald-950" />
                ) : (
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-emerald-950 ml-0.5" />
                )}
              </button>

              {/* Sleep Timer button */}
              <div className="relative">
                <button
                  onClick={() => setShowSleepMenu(!showSleepMenu)}
                  className={`p-2 rounded-full transition-colors relative ${
                    sleepTimerRemainingSec !== null
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-emerald-400/60 hover:text-white'
                  }`}
                  title="Sleep Timer"
                >
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  {sleepTimerRemainingSec !== null && (
                    <span className="absolute -top-1 -right-2 text-[9px] font-bold bg-amber-400 text-emerald-950 px-1 rounded-full">
                      {Math.ceil(sleepTimerRemainingSec / 60)}m
                    </span>
                  )}
                </button>

                {/* Sleep Timer Menu */}
                {showSleepMenu && (
                  <div className="absolute bottom-12 right-0 w-44 bg-[#082618] border border-emerald-700/80 rounded-xl shadow-2xl p-2 z-50 text-xs">
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
            <div className="hidden sm:flex items-center gap-0.5 h-3 mt-1">
              {isPlaying ? (
                <>
                  <span className="w-0.5 bg-emerald-400 rounded-full h-2 animate-bounce" />
                  <span className="w-0.5 bg-emerald-400 rounded-full h-3 animate-bounce delay-75" />
                  <span className="w-0.5 bg-amber-400 rounded-full h-4 animate-bounce delay-150" />
                  <span className="w-0.5 bg-emerald-400 rounded-full h-2.5 animate-bounce delay-100" />
                  <span className="w-0.5 bg-emerald-400 rounded-full h-1.5 animate-bounce delay-200" />
                  <span className="w-0.5 bg-amber-400 rounded-full h-3 animate-bounce delay-300" />
                  <span className="w-0.5 bg-emerald-400 rounded-full h-2 animate-bounce delay-75" />
                </>
              ) : (
                <span className="text-[10px] text-emerald-400/50">Paused</span>
              )}
            </div>
          </div>

          {/* RIGHT: Volume & Expand */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Desktop Volume Slider */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-emerald-400 hover:text-white p-1"
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
                className="p-2 text-emerald-400 hover:text-white"
                title="Volume"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {showVolumePopup && (
                <div className="absolute bottom-12 right-0 bg-[#082618] border border-emerald-700 p-3 rounded-xl shadow-xl flex items-center gap-2 z-50">
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
              className="p-2 rounded-xl text-emerald-300/70 hover:text-white hover:bg-emerald-800/40 transition-colors"
              title="Station Details"
            >
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
