import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Station } from '../types/radio';
import { INITIAL_STATIONS } from '../data/stations';

interface PlayerContextType {
  stations: Station[];
  currentStation: Station | null;
  isPlaying: boolean;
  isBuffering: boolean;
  volume: number;
  isMuted: boolean;
  error: string | null;
  notice: string | null;
  favorites: string[];
  recentlyPlayed: Station[];
  selectedStationForDetail: Station | null;
  isDetailOpen: boolean;
  isSuggestModalOpen: boolean;
  sleepTimerMinutes: number | null;
  sleepTimerRemainingSec: number | null;

  playStation: (station: Station) => void;
  togglePlayPause: () => void;
  stopPlayback: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleFavorite: (stationId: string) => void;
  isFavorite: (stationId: string) => boolean;
  openStationDetail: (station: Station) => void;
  closeStationDetail: () => void;
  openSuggestModal: () => void;
  closeSuggestModal: () => void;
  setSleepTimer: (minutes: number | null) => void;
  suggestStation: (data: Omit<Station, 'id' | 'isCommunitySubmitted'>) => Station;
  retryPlayback: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const STORAGE_FAVORITES_KEY = 'naija_radio_favorites_v1';
const STORAGE_RECENT_KEY = 'naija_radio_recent_v1';
const STORAGE_USER_STATIONS_KEY = 'naija_radio_community_stations_v1';
const STORAGE_VOLUME_KEY = 'naija_radio_volume_v1';

const isHlsUrl = (url: string): boolean => {
  return /\.m3u8(\?.*)?$/i.test(url) || url.toLowerCase().includes('/playlist.m3u8');
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userStations, setUserStations] = useState<Station[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_STATIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const stations: Station[] = [...userStations, ...INITIAL_STATIONS];

  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Stage 0 = station's primary verified streamUrl, Stage 1 = same station's alternate official backupStreamUrl
  const fallbackStageRef = useRef<number>(0);
  const activeStationRef = useRef<Station | null>(null);
  const playbackTokenRef = useRef<number>(0);

  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VOLUME_KEY);
      return saved ? parseFloat(saved) : 0.85;
    } catch {
      return 0.85;
    }
  });
  const initialVolumeRef = useRef<number>(volume);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FAVORITES_KEY);
      return saved ? JSON.parse(saved) : ['wazobia-lagos', 'freedom-radio-kano', 'fresh-fm-ibadan'];
    } catch {
      return ['wazobia-lagos', 'freedom-radio-kano'];
    }
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState<Station[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RECENT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedStationForDetail, setSelectedStationForDetail] = useState<Station | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState<boolean>(false);

  // Sleep timer state
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemainingSec, setSleepTimerRemainingSec] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const cleanupHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const clearNoticeLater = useCallback(() => {
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => setNotice(null), 4000);
  }, []);

  // Attempt stream playback strictly using THIS station's own authentic stream(s)
  const attemptStreamPlayback = useCallback((station: Station, stage: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const token = ++playbackTokenRef.current;
    fallbackStageRef.current = stage;
    activeStationRef.current = station;
    setIsBuffering(true);
    setError(null);

    let targetUrl: string | null = null;
    if (stage === 0) {
      targetUrl = station.streamUrl;
    } else if (stage === 1 && station.backupStreamUrl && station.backupStreamUrl !== station.streamUrl) {
      targetUrl = station.backupStreamUrl;
      setNotice(`Switching to alternate official stream for ${station.name}...`);
    }

    cleanupHls();
    audio.pause();
    audio.removeAttribute('src');
    audio.load();

    if (!targetUrl) {
      setIsBuffering(false);
      setIsPlaying(false);
      setNotice(null);
      setError(`${station.name} live stream is currently offline or unavailable.`);
      return;
    }

    const handleStageFailure = (err?: unknown) => {
      if (playbackTokenRef.current !== token) return;
      console.warn(`Playback stage ${stage} failed for ${station.name}:`, err);

      if (stage === 0 && station.backupStreamUrl && station.backupStreamUrl !== station.streamUrl) {
        attemptStreamPlayback(station, 1);
      } else {
        cleanupHls();
        setIsBuffering(false);
        setIsPlaying(false);
        setNotice(null);
        setError(`Unable to reach ${station.name}'s live broadcast right now. The station may be temporarily off air.`);
      }
    };

    const startAudioPlay = () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (playbackTokenRef.current !== token) return;
            setIsPlaying(true);
            setIsBuffering(false);
            setError(null);
            clearNoticeLater();
          })
          .catch((err) => {
            // AbortError occurs naturally when user switches stations mid-load
            if (err?.name === 'AbortError' && playbackTokenRef.current !== token) return;
            handleStageFailure(err);
          });
      }
    };

    if (isHlsUrl(targetUrl)) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;
        let recoveredNetworkError = false;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (playbackTokenRef.current !== token) return;
          startAudioPlay();
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (playbackTokenRef.current !== token) return;
          if (!data.fatal) return;

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !recoveredNetworkError) {
            recoveredNetworkError = true;
            hls.startLoad();
            return;
          }
          handleStageFailure(data);
        });

        hls.loadSource(targetUrl);
        hls.attachMedia(audio);
      } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari / iOS)
        audio.src = targetUrl;
        audio.load();
        startAudioPlay();
      } else {
        handleStageFailure(new Error('HLS playback is not supported in this browser'));
      }
      return;
    }

    audio.src = targetUrl;
    audio.load();
    startAudioPlay();
  }, [cleanupHls, clearNoticeLater]);

  // Initialize Audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audio.volume = initialVolumeRef.current;
    audioRef.current = audio;

    const handleWaiting = () => {
      if (activeStationRef.current) setIsBuffering(true);
    };
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
      setError(null);
    };
    const handleCanPlay = () => setIsBuffering(false);
    const handlePause = () => setIsPlaying(false);

    const handleError = () => {
      // Ignore errors triggered by intentionally clearing src
      if (!audio.getAttribute('src') && !hlsRef.current) return;

      const station = activeStationRef.current;
      const currentStage = fallbackStageRef.current;
      if (!station) {
        setIsBuffering(false);
        setIsPlaying(false);
        return;
      }

      if (currentStage === 0 && station.backupStreamUrl && station.backupStreamUrl !== station.streamUrl) {
        attemptStreamPlayback(station, 1);
      } else {
        cleanupHls();
        setIsBuffering(false);
        setIsPlaying(false);
        setNotice(null);
        setError(`${station.name} stream is currently unreachable. Tap Retry to try again.`);
      }
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      playbackTokenRef.current += 1;
      cleanupHls();
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [attemptStreamPlayback, cleanupHls]);

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerRemainingSec === null) return;

    if (sleepTimerRemainingSec <= 0) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setSleepTimerMinutes(null);
      setSleepTimerRemainingSec(null);
      return;
    }

    timerIntervalRef.current = window.setInterval(() => {
      setSleepTimerRemainingSec((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [sleepTimerRemainingSec]);

  // Persist volume
  const setVolume = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
    localStorage.setItem(STORAGE_VOLUME_KEY, clamped.toString());
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  // Play a station
  const playStation = useCallback((station: Station) => {
    setError(null);
    setNotice(null);
    setCurrentStation(station);
    activeStationRef.current = station;

    if (!station.streamUrl) {
      cleanupHls();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
      setIsPlaying(false);
      setIsBuffering(false);
      setError(`${station.name} stream is currently offline.`);
      return;
    }

    // Start from primary stage (0)
    attemptStreamPlayback(station, 0);

    // Update Recently Played
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((s) => s.id !== station.id);
      const updated = [station, ...filtered].slice(0, 15);
      localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(updated));
      return updated;
    });

    // Update MediaSession for Lock Screen & Notification Center
    if ('mediaSession' in navigator && station) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: station.name,
        artist: `${station.frequency} • ${station.city}, ${station.state}`,
        album: 'Naija Radio Live',
        artwork: [
          { src: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=512&auto=format&fit=crop&q=80', sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        cleanupHls();
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeAttribute('src');
          audioRef.current.load();
        }
        setIsPlaying(false);
      });
    }
  }, [attemptStreamPlayback, cleanupHls]);

  const togglePlayPause = () => {
    if (!currentStation) return;
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsBuffering(true);
      setError(null);
      const hasActiveSource = Boolean(audioRef.current.getAttribute('src')) || Boolean(hlsRef.current);
      if (!hasActiveSource) {
        attemptStreamPlayback(currentStation, 0);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch(() => {
            attemptStreamPlayback(currentStation, 0);
          });
      }
    }
  };

  const stopPlayback = () => {
    playbackTokenRef.current += 1;
    cleanupHls();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    setIsPlaying(false);
    setIsBuffering(false);
    setError(null);
    setNotice(null);
  };

  const retryPlayback = () => {
    if (currentStation) {
      attemptStreamPlayback(currentStation, 0);
    }
  };

  // Favorites
  const toggleFavorite = (stationId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId];
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (stationId: string) => favorites.includes(stationId);

  // Station Detail modal
  const openStationDetail = (station: Station) => {
    setSelectedStationForDetail(station);
    setIsDetailOpen(true);
  };

  const closeStationDetail = () => {
    setIsDetailOpen(false);
    setSelectedStationForDetail(null);
  };

  // Suggest modal
  const openSuggestModal = () => setIsSuggestModalOpen(true);
  const closeSuggestModal = () => setIsSuggestModalOpen(false);

  // Sleep timer setter
  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (minutes === null) {
      setSleepTimerRemainingSec(null);
    } else {
      setSleepTimerRemainingSec(minutes * 60);
    }
  };

  // User Suggestion handler
  const suggestStation = (data: Omit<Station, 'id' | 'isCommunitySubmitted'>): Station => {
    const newStation: Station = {
      ...data,
      id: `suggested-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      isCommunitySubmitted: true,
      listenersEstimate: 1,
    };

    setUserStations((prev) => {
      const updated = [newStation, ...prev];
      localStorage.setItem(STORAGE_USER_STATIONS_KEY, JSON.stringify(updated));
      return updated;
    });

    return newStation;
  };

  return (
    <PlayerContext.Provider
      value={{
        stations,
        currentStation,
        isPlaying,
        isBuffering,
        volume,
        isMuted,
        error,
        notice,
        favorites,
        recentlyPlayed,
        selectedStationForDetail,
        isDetailOpen,
        isSuggestModalOpen,
        sleepTimerMinutes,
        sleepTimerRemainingSec,
        playStation,
        togglePlayPause,
        stopPlayback,
        setVolume,
        toggleMute,
        toggleFavorite,
        isFavorite,
        openStationDetail,
        closeStationDetail,
        openSuggestModal,
        closeSuggestModal,
        setSleepTimer,
        suggestStation,
        retryPlayback,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const useRadioPlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('useRadioPlayer must be used within a PlayerProvider');
  }
  return context;
};
