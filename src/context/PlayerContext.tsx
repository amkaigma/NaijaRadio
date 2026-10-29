import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
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

  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VOLUME_KEY);
      return saved ? parseFloat(saved) : 0.85;
    } catch {
      return 0.85;
    }
  });

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
  const timerIntervalRef = useRef<number | null>(null);

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audio.volume = volume;
    audioRef.current = audio;

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
      setError(null);
    };
    const handleCanPlay = () => setIsBuffering(false);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setIsBuffering(false);
      setIsPlaying(false);
      setError('Station stream is temporarily unreachable or undergoing maintenance.');
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

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
    if (!station.streamUrl) {
      setError(`Cannot stream ${station.name}: Stream URL is currently offline.`);
      return;
    }

    setError(null);
    setCurrentStation(station);
    setIsBuffering(true);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = station.streamUrl;
      audioRef.current.load();
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch((err) => {
            console.warn('Audio play request failed:', err);
            // If main stream fails and backup exists, try backup
            if (station.backupStreamUrl && audioRef.current) {
              audioRef.current.src = station.backupStreamUrl;
              audioRef.current.load();
              audioRef.current.play().catch(() => {
                setIsBuffering(false);
                setIsPlaying(false);
                setError(`Unable to connect to live broadcast for ${station.name}.`);
              });
            } else {
              setIsBuffering(false);
              setIsPlaying(false);
              setError(`Audio stream connection error for ${station.name}.`);
            }
          });
      }
    }

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
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlayPause = () => {
    if (!currentStation || !currentStation.streamUrl) return;

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsBuffering(true);
      setError(null);
      if (!audioRef.current.src || audioRef.current.src === window.location.href) {
        audioRef.current.src = currentStation.streamUrl;
      }
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch(() => {
          setIsBuffering(false);
          setIsPlaying(false);
          setError('Could not resume playback. Tap play again to reconnect.');
        });
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setIsBuffering(false);
  };

  const retryPlayback = () => {
    if (currentStation) {
      playStation(currentStation);
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
