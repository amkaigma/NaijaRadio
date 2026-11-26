import React, { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  WifiOff,
  RefreshCw,
  Play,
  Edit3,
  PlusCircle,
  Download,
  Search,
  RotateCcw,
  ShieldCheck,
  Save,
  X,
  StopCircle,
  ExternalLink,
} from 'lucide-react';
import { useRadioPlayer } from '../context/PlayerContext';
import { NIGERIAN_STATES } from '../data/nigeriaGeo';
import { Station, StreamVerificationStatus } from '../types/radio';

type StatusFilter = StreamVerificationStatus | 'all';

const getEffectiveStatus = (station: Station): StreamVerificationStatus => {
  if (station.verificationStatus) return station.verificationStatus;
  return station.streamUrl ? 'VERIFIED' : 'OFFLINE';
};

const formatCheckedAt = (iso?: string): string => {
  if (!iso) return 'Not checked yet';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const StreamHealthMonitor: React.FC = () => {
  const {
    stations,
    currentStation,
    isPlaying,
    isBuffering,
    verifyingStationIds,
    batchVerificationProgress,
    playStation,
    verifyStation,
    verifyAllStations,
    cancelBatchVerification,
    updateStationStreams,
    resetStationOverride,
    resetAllOverrides,
    hasStationOverride,
  } = useRadioPlayer();

  const [stateFilter, setStateFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'primary' | 'backup'>('primary');
  const [editPrimaryUrl, setEditPrimaryUrl] = useState<string>('');
  const [editBackupUrl, setEditBackupUrl] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);

  const summary = useMemo(() => {
    const counts = {
      total: stations.length,
      verified: 0,
      offline: 0,
      broken: 0,
      unverified: 0,
      needsReview: 0,
    };
    for (const s of stations) {
      const st = getEffectiveStatus(s);
      if (st === 'VERIFIED') counts.verified++;
      else if (st === 'OFFLINE') counts.offline++;
      else if (st === 'BROKEN') counts.broken++;
      else if (st === 'UNVERIFIED') counts.unverified++;
      else if (st === 'NEEDS REVIEW') counts.needsReview++;
    }
    return counts;
  }, [stations]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    for (const s of stations) {
      if (stateFilter === 'all' || s.state === stateFilter) {
        set.add(s.city);
      }
    }
    return Array.from(set).sort();
  }, [stations, stateFilter]);

  const filteredStations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stations.filter((s) => {
      if (stateFilter !== 'all' && s.state !== stateFilter) return false;
      if (cityFilter !== 'all' && !s.city.toLowerCase().includes(cityFilter.toLowerCase())) return false;
      const st = getEffectiveStatus(s);
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      if (q) {
        const hay = `${s.name} ${s.frequency} ${s.city} ${s.state} ${s.streamUrl || ''} ${s.backupStreamUrl || ''} ${s.verificationError || ''} ${s.verificationNotes || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [stations, stateFilter, cityFilter, statusFilter, searchQuery]);

  const anyOverrides = useMemo(
    () => stations.some((s) => hasStationOverride(s.id)),
    [stations, hasStationOverride],
  );

  const openEditor = (station: Station, mode: 'primary' | 'backup') => {
    setEditingId(station.id);
    setEditMode(mode);
    setEditPrimaryUrl(station.streamUrl || '');
    setEditBackupUrl(station.backupStreamUrl || '');
    setEditNotes(station.verificationNotes || '');
    setEditError(null);
  };

  const closeEditor = () => {
    setEditingId(null);
    setEditError(null);
  };

  const handleSaveEdit = async (stationId: string, verifyAfterSave: boolean) => {
    const pTrim = editPrimaryUrl.trim();
    const bTrim = editBackupUrl.trim();

    if (pTrim && !/^https?:\/\//i.test(pTrim)) {
      setEditError('Primary stream URL must start with https:// or http:// (or leave blank to mark offline).');
      return;
    }
    if (bTrim && !/^https?:\/\//i.test(bTrim)) {
      setEditError('Backup stream URL must start with https:// or http://.');
      return;
    }

    updateStationStreams(stationId, {
      streamUrl: pTrim || null,
      backupStreamUrl: bTrim,
      notes: editNotes.trim() || undefined,
    });
    setEditingId(null);
    setEditError(null);

    if (verifyAfterSave && pTrim) {
      await verifyStation(stationId);
    }
  };

  const handleExportAuditReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary,
      stations: stations.map((s) => ({
        id: s.id,
        name: s.name,
        frequency: s.frequency,
        city: s.city,
        state: s.state,
        region: s.region,
        streamUrl: s.streamUrl,
        backupStreamUrl: s.backupStreamUrl || null,
        streamFormat: s.streamFormat || (s.streamUrl ? 'Audio' : 'Offline'),
        verificationStatus: getEffectiveStatus(s),
        lastCheckedAt: s.lastCheckedAt || null,
        verificationError: s.verificationError || null,
        verificationNotes: s.verificationNotes || null,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naija-radio-stream-audit-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStatusBadge = (status: StreamVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" />
            VERIFIED
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40">
            <WifiOff className="w-3 h-3" />
            OFFLINE
          </span>
        );
      case 'BROKEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <XCircle className="w-3 h-3" />
            BROKEN
          </span>
        );
      case 'NEEDS REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
            <AlertTriangle className="w-3 h-3" />
            NEEDS REVIEW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
            <HelpCircle className="w-3 h-3" />
            UNVERIFIED
          </span>
        );
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-5 pb-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#072617] to-[#04160d] border border-emerald-800/60 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Stream Health Monitor</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white font-['Cabinet_Grotesk',sans-serif] flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Stream Health & Verification</span>
            </h1>
            <p className="text-[11px] sm:text-sm text-emerald-300/80 mt-0.5 max-w-2xl line-clamp-2">
              Audit, verify, test, and repair live streams across all 36 states, Abuja (FCT), and Adamawa State.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {batchVerificationProgress.isRunning ? (
              <button
                onClick={cancelBatchVerification}
                className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <StopCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>
                  Stop ({batchVerificationProgress.completed}/{batchVerificationProgress.total})
                </span>
              </button>
            ) : (
              <button
                onClick={verifyAllStations}
                className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Verify All</span>
              </button>
            )}

            <button
              onClick={handleExportAuditReport}
              className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Export JSON</span>
            </button>

            {anyOverrides && (
              <button
                onClick={resetAllOverrides}
                className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-[#082618] hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-semibold text-[11px] sm:text-xs flex items-center gap-1.5 cursor-pointer"
                title="Reset local admin edits back to audited directory defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Edits</span>
              </button>
            )}
          </div>
        </div>

        {/* Batch progress bar */}
        {batchVerificationProgress.isRunning && (
          <div className="mt-4 bg-[#03130a] rounded-xl p-3 border border-emerald-800/60">
            <div className="flex items-center justify-between text-xs text-emerald-200 mb-1.5 font-semibold">
              <span>Probing live streams, audio payloads & station headers...</span>
              <span className="font-mono text-amber-300">
                {batchVerificationProgress.completed} / {batchVerificationProgress.total}
              </span>
            </div>
            <div className="w-full h-2 bg-emerald-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-300"
                style={{
                  width: `${Math.round(
                    (batchVerificationProgress.completed / Math.max(1, batchVerificationProgress.total)) * 100,
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-3.5 sm:mt-5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`text-left p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-emerald-900/60 border-emerald-400/60'
                : 'bg-[#04190e] border-emerald-800/50 hover:border-emerald-700'
            }`}
          >
            <div className="text-[10px] sm:text-[11px] font-bold uppercase text-emerald-400/70 truncate">Total</div>
            <div className="text-lg sm:text-2xl font-black text-white font-mono tabular-nums mt-0.5">{summary.total}</div>
          </button>

          <button
            onClick={() => setStatusFilter('VERIFIED')}
            className={`text-left p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'VERIFIED'
                ? 'bg-emerald-500/20 border-emerald-400'
                : 'bg-[#04190e] border-emerald-800/50 hover:border-emerald-600/60'
            }`}
          >
            <div className="text-[10px] sm:text-[11px] font-bold uppercase text-emerald-400 truncate">Live</div>
            <div className="text-lg sm:text-2xl font-black text-emerald-300 font-mono tabular-nums mt-0.5">{summary.verified}</div>
          </button>

          <button
            onClick={() => setStatusFilter('OFFLINE')}
            className={`text-left p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'OFFLINE'
                ? 'bg-slate-500/25 border-slate-400'
                : 'bg-[#04190e] border-emerald-800/50 hover:border-slate-500/60'
            }`}
          >
            <div className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-300 truncate">Offline</div>
            <div className="text-lg sm:text-2xl font-black text-slate-200 font-mono tabular-nums mt-0.5">{summary.offline}</div>
          </button>

          <button
            onClick={() => setStatusFilter('BROKEN')}
            className={`text-left p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'BROKEN'
                ? 'bg-rose-500/20 border-rose-400'
                : 'bg-[#04190e] border-emerald-800/50 hover:border-rose-500/60'
            }`}
          >
            <div className="text-[10px] sm:text-[11px] font-bold uppercase text-rose-400 truncate">Broken</div>
            <div className="text-lg sm:text-2xl font-black text-rose-300 font-mono tabular-nums mt-0.5">{summary.broken}</div>
          </button>

          <button
            onClick={() => setStatusFilter('UNVERIFIED')}
            className={`text-left p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'UNVERIFIED'
                ? 'bg-sky-500/20 border-sky-400'
                : 'bg-[#04190e] border-emerald-800/50 hover:border-sky-500/60'
            }`}
          >
            <div className="text-[10px] sm:text-[11px] font-bold uppercase text-sky-400 truncate">Unverified</div>
            <div className="text-lg sm:text-2xl font-black text-sky-300 font-mono tabular-nums mt-0.5">{summary.unverified}</div>
          </button>

          <button
            onClick={() => setStatusFilter('NEEDS REVIEW')}
            className={`text-left p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'NEEDS REVIEW'
                ? 'bg-amber-400/20 border-amber-400'
                : 'bg-[#04190e] border-emerald-800/50 hover:border-amber-400/60'
            }`}
          >
            <div className="text-[10px] sm:text-[11px] font-bold uppercase text-amber-400 truncate">Review</div>
            <div className="text-lg sm:text-2xl font-black text-amber-300 font-mono tabular-nums mt-0.5">{summary.needsReview}</div>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#061f13] border border-emerald-800/60 rounded-2xl p-3 sm:p-4 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="col-span-2 lg:col-span-1">
          <label className="block text-[10px] sm:text-[11px] font-bold uppercase text-emerald-300/70 mb-1">
            Search Station
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search station, URL, or error..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#04150c] border border-emerald-700/60 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-emerald-300/70 mb-1">
            State
          </label>
          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setCityFilter('all');
            }}
            className="w-full px-3 py-2 rounded-xl bg-[#04150c] border border-emerald-700/60 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            <option value="all">All 36 States + FCT</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-emerald-300/70 mb-1">
            City
          </label>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#04150c] border border-emerald-700/60 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            <option value="all">All Cities</option>
            {availableCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-emerald-300/70 mb-1">
            Stream Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="w-full px-3 py-2 rounded-xl bg-[#04150c] border border-emerald-700/60 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            <option value="all">All Statuses ({summary.total})</option>
            <option value="VERIFIED">Verified ({summary.verified})</option>
            <option value="OFFLINE">Offline ({summary.offline})</option>
            <option value="BROKEN">Broken ({summary.broken})</option>
            <option value="UNVERIFIED">Unverified ({summary.unverified})</option>
            <option value="NEEDS REVIEW">Needs Review ({summary.needsReview})</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-emerald-300/80">
        <span>
          Showing <strong className="text-white">{filteredStations.length}</strong> of {stations.length} stations
        </span>
        {batchVerificationProgress.lastCompletedAt && (
          <span className="font-mono text-[11px] text-emerald-400/70">
            Last full audit: {formatCheckedAt(batchVerificationProgress.lastCompletedAt)}
          </span>
        )}
      </div>

      {/* Station Monitoring List */}
      <div className="space-y-2 sm:space-y-3">
        {filteredStations.map((station) => {
          const status = getEffectiveStatus(station);
          const isVerifying = verifyingStationIds.includes(station.id);
          const isCurrent = currentStation?.id === station.id;
          const isEditing = editingId === station.id;
          const isOverride = hasStationOverride(station.id);

          return (
            <div
              key={station.id}
              className="bg-[#062013] border border-emerald-800/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-colors hover:border-emerald-600/60"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-2.5 sm:gap-4">
                {/* Station & Stream Info */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-md text-[11px] font-black text-white"
                      style={{ backgroundColor: station.brandColor || '#008751' }}
                    >
                      {station.frequency}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {station.name}
                    </h3>
                    {renderStatusBadge(status)}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#03140b] text-emerald-300 border border-emerald-800/60">
                      {station.streamFormat || (station.streamUrl ? 'Audio' : 'Offline')}
                    </span>
                    {isOverride && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                        Admin Edited
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-emerald-300/75 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>
                      {station.city}, {station.state} ({station.region})
                    </span>
                    <span className="text-emerald-600">•</span>
                    <span className="font-mono text-[11px]">
                      Checked: {formatCheckedAt(station.lastCheckedAt)}
                    </span>
                    {station.website && (
                      <>
                        <span className="text-emerald-600">•</span>
                        <a
                          href={station.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-300 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Website</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </div>

                  {/* URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#03140b] rounded-xl px-3 py-2 border border-emerald-900/70 truncate">
                      <span className="text-emerald-400/70 font-bold mr-1.5">Primary:</span>
                      {station.streamUrl ? (
                        <span className="font-mono text-emerald-200">{station.streamUrl}</span>
                      ) : (
                        <span className="text-slate-400 italic">None (Live stream currently unavailable.)</span>
                      )}
                    </div>
                    <div className="bg-[#03140b] rounded-xl px-3 py-2 border border-emerald-900/70 truncate">
                      <span className="text-emerald-400/70 font-bold mr-1.5">Backup:</span>
                      {station.backupStreamUrl ? (
                        <span className="font-mono text-emerald-200">{station.backupStreamUrl}</span>
                      ) : (
                        <span className="text-emerald-500/50 italic">No backup stream configured</span>
                      )}
                    </div>
                  </div>

                  {/* Verification Error / Notes */}
                  {(station.verificationError || station.verificationNotes) && (
                    <div
                      className={`text-xs rounded-xl px-3 py-2 border ${
                        status === 'BROKEN'
                          ? 'bg-rose-950/50 border-rose-800/60 text-rose-200'
                          : status === 'NEEDS REVIEW'
                          ? 'bg-amber-950/40 border-amber-700/50 text-amber-200'
                          : status === 'OFFLINE'
                          ? 'bg-slate-900/60 border-slate-700/50 text-slate-300'
                          : 'bg-emerald-950/60 border-emerald-800/50 text-emerald-200'
                      }`}
                    >
                      {station.verificationError && (
                        <div className="font-semibold">Error: {station.verificationError}</div>
                      )}
                      {station.verificationNotes && (
                        <div className="text-[11px] opacity-85 mt-0.5">
                          Notes: {station.verificationNotes}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => playStation(station)}
                      disabled={!station.streamUrl}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        !station.streamUrl
                          ? 'bg-emerald-950/60 text-emerald-500/40 border border-emerald-900 cursor-not-allowed'
                          : isCurrent && isPlaying && !isBuffering
                          ? 'bg-amber-400 text-emerald-950'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isCurrent && isPlaying ? 'Playing' : 'Test Stream'}</span>
                    </button>

                    <button
                      onClick={() => verifyStation(station.id)}
                      disabled={isVerifying}
                      className="px-3 py-1.5 rounded-xl bg-[#092e1d] hover:bg-emerald-800/70 text-emerald-200 border border-emerald-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-amber-400' : ''}`} />
                      <span>{isVerifying ? 'Checking...' : 'Retry Verification'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => openEditor(station, 'primary')}
                      className="px-3 py-1.5 rounded-xl bg-[#04170e] hover:bg-emerald-900/50 text-amber-300 border border-emerald-800/70 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Stream URL</span>
                    </button>

                    <button
                      onClick={() => openEditor(station, 'backup')}
                      className="px-3 py-1.5 rounded-xl bg-[#04170e] hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/70 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{station.backupStreamUrl ? 'Edit Backup' : 'Add Backup Stream'}</span>
                    </button>

                    {isOverride && (
                      <button
                        onClick={() => resetStationOverride(station.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-semibold cursor-pointer"
                        title="Revert local override"
                      >
                        Revert
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Inline Stream Editor */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-emerald-800/60 bg-[#04150c] p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      {editMode === 'primary'
                        ? `Edit Stream URL — ${station.name}`
                        : `Configure Same-Station Backup Stream — ${station.name}`}
                    </h4>
                    <button
                      onClick={closeEditor}
                      className="p-1 rounded-lg text-emerald-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-emerald-200 mb-1">
                        Primary Stream URL (leave blank to mark offline)
                      </label>
                      <input
                        type="url"
                        value={editPrimaryUrl}
                        onChange={(e) => setEditPrimaryUrl(e.target.value)}
                        placeholder="https://stream.example.com/live.mp3"
                        className="w-full px-3 py-2 rounded-xl bg-[#072114] border border-emerald-700/60 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-emerald-200 mb-1">
                        Backup Stream URL (must belong to {station.name})
                      </label>
                      <input
                        type="url"
                        value={editBackupUrl}
                        onChange={(e) => setEditBackupUrl(e.target.value)}
                        placeholder="https://backup.example.com/live.mp3"
                        className="w-full px-3 py-2 rounded-xl bg-[#072114] border border-emerald-700/60 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-emerald-200 text-xs mb-1">
                      Verification / Admin Notes
                    </label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Source website, verified encoder details, or outage notes..."
                      className="w-full px-3 py-2 rounded-xl bg-[#072114] border border-emerald-700/60 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  {editError && (
                    <p className="text-xs text-rose-300 font-semibold">{editError}</p>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeEditor}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(station.id, false)}
                      className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(station.id, true)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Save & Verify Stream</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredStations.length === 0 && (
          <div className="text-center py-12 bg-[#051c11] rounded-2xl border border-emerald-800/60 text-emerald-300/80 text-sm">
            No stations match the selected Stream Health filters.
          </div>
        )}
      </div>
    </div>
  );
};
