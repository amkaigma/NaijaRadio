import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Hls from 'hls.js';
import { Station, StreamVerificationStatus } from '../types/radio';
import { INITIAL_STATIONS } from '../data/stations';

export interface StationOverride {
  streamUrl?: string | null;
  backupStreamUrl?: string;
  streamFormat?: string;
  verificationStatus?: StreamVerificationStatus;
  lastCheckedAt?: string;
  verificationError?: string;
  verificationNotes?: string;
}

export interface BatchVerificationProgress {
  isRunning: boolean;
  completed: number;
  total: number;
  lastCompletedAt: string | null;
}

interface VerifyApiResponse {
  ok: boolean;
  url: string;
  finalUrl: string;
  httpStatus: number;
  contentType: string;
  icyName: string | null;
  streamFormat: string;
  bytesRead: number;
  latencyMs: number;
  verificationStatus: StreamVerificationStatus;
  error: string | null;
  notes: string;
  checkedAt: string;
}

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
  verifyingStationIds: string[];
  batchVerificationProgress: BatchVerificationProgress;

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
  verifyStation: (stationId: string) => Promise<Station | null>;
  verifyAllStations: () => Promise<void>;
  cancelBatchVerification: () => void;
  updateStationStreams: (
    stationId: string,
    updates: { streamUrl: string | null; backupStreamUrl?: string; notes?: string },
  ) => void;
  resetStationOverride: (stationId: string) => void;
  resetAllOverrides: () => void;
  hasStationOverride: (stationId: string) => boolean;
  retryOfflineStation: (station: Station) => Promise<boolean>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const STORAGE_FAVORITES_KEY = 'naija_radio_favorites_v1';
const STORAGE_RECENT_KEY = 'naija_radio_recent_v1';
const STORAGE_USER_STATIONS_KEY = 'naija_radio_community_stations_v1';
const STORAGE_VOLUME_KEY = 'naija_radio_volume_v1';
const STORAGE_OVERRIDES_KEY = 'naija_radio_station_overrides_v1';

const isHlsUrl = (url: string): boolean => {
  return /\.m3u8(\?.*)?$/i.test(url) || url.toLowerCase().includes('/playlist.m3u8');
};

const inferFormatFromUrl = (url: string | null | undefined): string => {
  if (!url) return 'Offline';
  const lower = url.toLowerCase();
  if (lower.includes('.m3u8')) return 'HLS';
  if (lower.endsWith('.aac') || lower.includes('.aac?')) return 'AAC';
  if (lower.includes('ogg') || lower.includes('opus')) return 'OGG';
  return 'MP3 / Audio';
};

async function verifyUrlViaServer(
  url: string | null,
  stationName: string,
  stationCity: string,
): Promise<VerifyApiResponse> {
  const checkedAt = new Date().toISOString();
  if (!url || !url.trim()) {
    return {
      ok: false,
      url: '',
      finalUrl: '',
      httpStatus: 0,
      contentType: '',
      icyName: null,
      streamFormat: 'Offline',
      bytesRead: 0,
      latencyMs: 0,
      verificationStatus: 'OFFLINE',
      error: 'Live stream currently unavailable.',
      notes: 'No working official stream URL published.',
      checkedAt,
    };
  }

  try {
    const res = await fetch('/api/verify-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, stationName, stationCity }),
    });
    if (!res.ok) {
      return {
        ok: false,
        url,
        finalUrl: url,
        httpStatus: res.status,
        contentType: '',
        icyName: null,
        streamFormat: inferFormatFromUrl(url),
        bytesRead: 0,
        latencyMs: 0,
        verificationStatus: 'NEEDS REVIEW',
        error: `Verification API returned HTTP ${res.status}`,
        notes: 'Unable to complete server-side stream probe.',
        checkedAt,
      };
    }
    return (await res.json()) as VerifyApiResponse;
  } catch (err) {
    return {
      ok: false,
      url,
      finalUrl: url,
      httpStatus: 0,
      contentType: '',
      icyName: null,
      streamFormat: inferFormatFromUrl(url),
      bytesRead: 0,
      latencyMs: 0,
      verificationStatus: 'NEEDS REVIEW',
      error: err instanceof Error ? err.message : 'Verification request failed',
      notes: 'Verification endpoint unavailable in current environment.',
      checkedAt,
    };
  }
}

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userStations, setUserStations] = useState<Station[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_STATIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [stationOverrides, setStationOverrides] = useState<Record<string, StationOverride>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_OVERRIDES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const stations: Station[] = useMemo(() => {
    return [...userStations, ...INITIAL_STATIONS].map((s) => {
      const override = stationOverrides[s.id];
      if (!override) return s;
      return {
        ...s,
        ...override,
      };
    });
  }, [userStations, stationOverrides]);

  const stationsRef = useRef<Station[]>(stations);
  stationsRef.current = stations;

  const [currentStationId, setCurrentStationId] = useState<string | null>(null);
  const [fallbackCurrentStation, setFallbackCurrentStation] = useState<Station | null>(null);
  const currentStation = useMemo(() => {
    if (!currentStationId) return null;
    return stations.find((s) => s.id === currentStationId) || fallbackCurrentStation;
  }, [currentStationId, stations, fallbackCurrentStation]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [verifyingStationIds, setVerifyingStationIds] = useState<string[]>([]);
  const [batchVerificationProgress, setBatchVerificationProgress] = useState<BatchVerificationProgress>({
    isRunning: false,
    completed: 0,
    total: 0,
    lastCompletedAt: null,
  });
  const batchCancelRef = useRef<boolean>(false);

  // Stage 0 = station's primary verified streamUrl, Stage 1 = same station's alternate official backupStreamUrl
  const fallbackStageRef = useRef<number>(0);
  const activeStationRef = useRef<Station | null>(null);
  const playbackTokenRef = useRef<number>(0);
  const connectTimeoutRef = useRef<number | null>(null);

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

  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RECENT_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => (typeof item === 'string' ? item : item?.id)).filter(Boolean);
      }
      return [];
    } catch {
      return [];
    }
  });

  const recentlyPlayed: Station[] = useMemo(() => {
    return recentlyPlayedIds
      .map((id) => stations.find((s) => s.id === id))
      .filter((s): s is Station => Boolean(s));
  }, [recentlyPlayedIds, stations]);

  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const selectedStationForDetail = useMemo(() => {
    if (!selectedDetailId) return null;
    return stations.find((s) => s.id === selectedDetailId) || null;
  }, [selectedDetailId, stations]);

  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState<boolean>(false);

  // Sleep timer state
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemainingSec, setSleepTimerRemainingSec] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const persistOverrides = useCallback((updater: (prev: Record<string, StationOverride>) => Record<string, StationOverride>) => {
    setStationOverrides((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_OVERRIDES_KEY, JSON.stringify(next));
      } catch {
        // storage full or unavailable
      }
      return next;
    });
  }, []);

  const clearConnectTimeout = useCallback(() => {
    if (connectTimeoutRef.current !== null) {
      window.clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
    }
  }, []);

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
    clearConnectTimeout();
    setIsPlaying(false);
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
      setError(`${station.name}: Live stream currently unavailable.`);
      return;
    }

    const handleStageFailure = (err?: unknown) => {
      if (playbackTokenRef.current !== token) return;
      clearConnectTimeout();
      console.warn(`Playback stage ${stage} failed for ${station.name}:`, err);

      if (stage === 0 && station.backupStreamUrl && station.backupStreamUrl !== station.streamUrl) {
        attemptStreamPlayback(station, 1);
      } else {
        cleanupHls();
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        setIsBuffering(false);
        setIsPlaying(false);
        setNotice(null);
        setError(`Unable to reach ${station.name}'s live broadcast right now. Live stream currently unavailable.`);
      }
    };

    // Timeout guard prevents endless buffering freeze on stalled/broken remote sockets
    connectTimeoutRef.current = window.setTimeout(() => {
      if (playbackTokenRef.current === token && (audio.paused || audio.readyState < 2)) {
        handleStageFailure(new Error('Stream connection timed out'));
      }
    }, 15000);

    const startAudioPlay = () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (playbackTokenRef.current !== token) return;
            clearConnectTimeout();
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

    const resolvePlayableUrl = (raw: string): string => {
      if (
        typeof window !== 'undefined' &&
        window.location.protocol === 'https:' &&
        raw.startsWith('http://') &&
        !isHlsUrl(raw)
      ) {
        return `/api/stream-proxy?url=${encodeURIComponent(raw)}`;
      }
      return raw;
    };

    const playbackUrl = resolvePlayableUrl(targetUrl);

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
        audio.src = targetUrl;
        audio.load();
        startAudioPlay();
      } else {
        handleStageFailure(new Error('HLS playback is not supported in this browser'));
      }
      return;
    }

    audio.src = playbackUrl;
    audio.load();
    startAudioPlay();
  }, [cleanupHls, clearConnectTimeout, clearNoticeLater]);

  // Initialize single Audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audio.volume = initialVolumeRef.current;
    audioRef.current = audio;

    const handleWaiting = () => {
      if (activeStationRef.current) setIsBuffering(true);
    };
    const handlePlaying = () => {
      clearConnectTimeout();
      setIsBuffering(false);
      setIsPlaying(true);
      setError(null);
    };
    const handleCanPlay = () => setIsBuffering(false);
    const handlePause = () => setIsPlaying(false);

    const handleError = () => {
      if (!audio.getAttribute('src') && !hlsRef.current) return;

      const station = activeStationRef.current;
      const currentStage = fallbackStageRef.current;
      clearConnectTimeout();
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
      clearConnectTimeout();
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
  }, [attemptStreamPlayback, cleanupHls, clearConnectTimeout]);

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

  // Play a station cleanly (stops any previous stream before launching new one)
  const playStation = useCallback((station: Station) => {
    setError(null);
    setNotice(null);
    setCurrentStationId(station.id);
    setFallbackCurrentStation(station);
    activeStationRef.current = station;

    if (!station.streamUrl) {
      playbackTokenRef.current += 1;
      clearConnectTimeout();
      cleanupHls();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
      setIsPlaying(false);
      setIsBuffering(false);
      setError(`${station.name}: Live stream currently unavailable.`);
      return;
    }

    attemptStreamPlayback(station, 0);

    // Update Recently Played
    setRecentlyPlayedIds((prev) => {
      const updated = [station.id, ...prev.filter((id) => id !== station.id)].slice(0, 15);
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
        clearConnectTimeout();
        cleanupHls();
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeAttribute('src');
          audioRef.current.load();
        }
        setIsPlaying(false);
        setIsBuffering(false);
      });
    }
  }, [attemptStreamPlayback, cleanupHls, clearConnectTimeout]);

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
    clearConnectTimeout();
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

  // Verify a single station against /api/verify-stream
  const verifyStation = useCallback(async (stationId: string): Promise<Station | null> => {
    const target = stationsRef.current.find((s) => s.id === stationId);
    if (!target) return null;

    setVerifyingStationIds((prev) => (prev.includes(stationId) ? prev : [...prev, stationId]));
    try {
      const primaryResult = await verifyUrlViaServer(target.streamUrl, target.name, target.city);
      let finalResult = primaryResult;
      let usedBackup = false;

      if (!primaryResult.ok && target.backupStreamUrl && target.backupStreamUrl !== target.streamUrl) {
        const backupResult = await verifyUrlViaServer(target.backupStreamUrl, target.name, target.city);
        if (backupResult.ok) {
          finalResult = backupResult;
          usedBackup = true;
        }
      }

      const override: StationOverride = {
        streamFormat: finalResult.streamFormat,
        verificationStatus: finalResult.verificationStatus,
        lastCheckedAt: finalResult.checkedAt,
        verificationError: finalResult.error || undefined,
        verificationNotes: usedBackup
          ? `Primary unreachable; backup stream ${finalResult.notes}`
          : finalResult.notes,
      };

      persistOverrides((prev) => ({
        ...prev,
        [stationId]: {
          ...prev[stationId],
          ...override,
        },
      }));

      return { ...target, ...override };
    } finally {
      setVerifyingStationIds((prev) => prev.filter((id) => id !== stationId));
    }
  }, [persistOverrides]);

  const cancelBatchVerification = useCallback(() => {
    batchCancelRef.current = true;
  }, []);

  const verifyAllStations = useCallback(async () => {
    const snapshot = [...stationsRef.current];
    if (snapshot.length === 0) return;

    batchCancelRef.current = false;
    setBatchVerificationProgress({
      isRunning: true,
      completed: 0,
      total: snapshot.length,
      lastCompletedAt: null,
    });

    const chunkSize = 8;
    let completed = 0;

    for (let i = 0; i < snapshot.length; i += chunkSize) {
      if (batchCancelRef.current) break;
      const chunk = snapshot.slice(i, i + chunkSize);
      const ids = chunk.map((s) => s.id);
      setVerifyingStationIds((prev) => [...new Set([...prev, ...ids])]);

      try {
        const withUrls = chunk.filter((s) => Boolean(s.streamUrl));
        const withoutUrls = chunk.filter((s) => !s.streamUrl);

        if (withoutUrls.length > 0) {
          const nowIso = new Date().toISOString();
          persistOverrides((prev) => {
            const next = { ...prev };
            for (const s of withoutUrls) {
              next[s.id] = {
                ...next[s.id],
                streamFormat: 'Offline',
                verificationStatus: s.verificationStatus === 'NEEDS REVIEW' ? 'NEEDS REVIEW' : 'OFFLINE',
                lastCheckedAt: nowIso,
                verificationError: 'Live stream currently unavailable.',
                verificationNotes: s.verificationNotes || 'No verified public live stream endpoint found.',
              };
            }
            return next;
          });
        }

        if (withUrls.length > 0) {
          const res = await fetch('/api/verify-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: withUrls.map((s) => ({
                id: s.id,
                url: s.streamUrl,
                stationName: s.name,
                stationCity: s.city,
              })),
            }),
          });

          if (res.ok) {
            const data = (await res.json()) as { results: Array<{ id: string; result: VerifyApiResponse }> };
            persistOverrides((prev) => {
              const next = { ...prev };
              for (const entry of data.results || []) {
                next[entry.id] = {
                  ...next[entry.id],
                  streamFormat: entry.result.streamFormat,
                  verificationStatus: entry.result.verificationStatus,
                  lastCheckedAt: entry.result.checkedAt,
                  verificationError: entry.result.error || undefined,
                  verificationNotes: entry.result.notes,
                };
              }
              return next;
            });
          }
        }
      } catch {
        // Continue batch gracefully
      } finally {
        setVerifyingStationIds((prev) => prev.filter((id) => !ids.includes(id)));
        completed += chunk.length;
        setBatchVerificationProgress((prev) => ({
          ...prev,
          completed: Math.min(completed, snapshot.length),
        }));
      }
    }

    setBatchVerificationProgress({
      isRunning: false,
      completed: batchCancelRef.current ? completed : snapshot.length,
      total: snapshot.length,
      lastCompletedAt: new Date().toISOString(),
    });
  }, [persistOverrides]);

  // Gentle automated periodic health check (every 30 minutes, verifies oldest-checked active chunk)
  useEffect(() => {
    const runSpotCheck = async () => {
      if (batchVerificationProgress.isRunning) return;
      const candidates = stationsRef.current
        .filter((s) => Boolean(s.streamUrl))
        .sort((a, b) => (a.lastCheckedAt || '').localeCompare(b.lastCheckedAt || ''))
        .slice(0, 6);
      if (candidates.length === 0) return;

      try {
        const res = await fetch('/api/verify-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: candidates.map((s) => ({
              id: s.id,
              url: s.streamUrl,
              stationName: s.name,
              stationCity: s.city,
            })),
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { results: Array<{ id: string; result: VerifyApiResponse }> };
        persistOverrides((prev) => {
          const next = { ...prev };
          for (const entry of data.results || []) {
            next[entry.id] = {
              ...next[entry.id],
              streamFormat: entry.result.streamFormat,
              verificationStatus: entry.result.verificationStatus,
              lastCheckedAt: entry.result.checkedAt,
              verificationError: entry.result.error || undefined,
              verificationNotes: entry.result.notes,
            };
          }
          return next;
        });
      } catch {
        // Background periodic check stays silent
      }
    };

    const interval = window.setInterval(runSpotCheck, 30 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [batchVerificationProgress.isRunning, persistOverrides]);

  const updateStationStreams = useCallback(
    (stationId: string, updates: { streamUrl: string | null; backupStreamUrl?: string; notes?: string }) => {
      const cleanedPrimary = updates.streamUrl && updates.streamUrl.trim() ? updates.streamUrl.trim() : null;
      const cleanedBackup =
        updates.backupStreamUrl !== undefined
          ? updates.backupStreamUrl.trim() || undefined
          : undefined;
      const nowIso = new Date().toISOString();

      persistOverrides((prev) => ({
        ...prev,
        [stationId]: {
          ...prev[stationId],
          streamUrl: cleanedPrimary,
          ...(updates.backupStreamUrl !== undefined ? { backupStreamUrl: cleanedBackup } : {}),
          streamFormat: inferFormatFromUrl(cleanedPrimary),
          verificationStatus: cleanedPrimary ? 'UNVERIFIED' : 'OFFLINE',
          lastCheckedAt: nowIso,
          verificationError: cleanedPrimary ? undefined : 'Live stream currently unavailable.',
          verificationNotes:
            updates.notes ||
            (cleanedPrimary ? 'Stream URL updated by admin; awaiting verification.' : 'Marked offline by admin.'),
        },
      }));
    },
    [persistOverrides],
  );

  const resetStationOverride = useCallback(
    (stationId: string) => {
      persistOverrides((prev) => {
        const next = { ...prev };
        delete next[stationId];
        return next;
      });
    },
    [persistOverrides],
  );

  const resetAllOverrides = useCallback(() => {
    persistOverrides(() => ({}));
  }, [persistOverrides]);

  const hasStationOverride = useCallback(
    (stationId: string) => Boolean(stationOverrides[stationId]),
    [stationOverrides],
  );

  const retryOfflineStation = useCallback(
    async (station: Station): Promise<boolean> => {
      const verified = await verifyStation(station.id);
      if (verified && verified.streamUrl && verified.verificationStatus === 'VERIFIED') {
        playStation(verified);
        return true;
      }
      return false;
    },
    [playStation, verifyStation],
  );

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
    setSelectedDetailId(station.id);
    setIsDetailOpen(true);
  };

  const closeStationDetail = () => {
    setIsDetailOpen(false);
    setSelectedDetailId(null);
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
      streamFormat: inferFormatFromUrl(data.streamUrl),
      verificationStatus: data.streamUrl ? 'UNVERIFIED' : 'OFFLINE',
      lastCheckedAt: new Date().toISOString(),
      verificationNotes: data.streamUrl
        ? 'Community-submitted stream; ready for verification.'
        : 'Community-submitted without stream URL.',
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
        verifyingStationIds,
        batchVerificationProgress,
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
        verifyStation,
        verifyAllStations,
        cancelBatchVerification,
        updateStationStreams,
        resetStationOverride,
        resetAllOverrides,
        hasStationOverride,
        retryOfflineStation,
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
