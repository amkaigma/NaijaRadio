import React, { useState } from 'react';
import { X, Send, Radio, MapPin, Globe, Sparkles, CheckCircle2, Volume2, AlertCircle } from 'lucide-react';
import { ALL_GENRES, ALL_LANGUAGES, NIGERIAN_STATES } from '../data/nigeriaGeo';
import { NigerianLanguage, Region, StationGenre } from '../types/radio';
import { useRadioPlayer } from '../context/PlayerContext';

export const SuggestStationModal: React.FC = () => {
  const { isSuggestModalOpen, closeSuggestModal, suggestStation, playStation } = useRadioPlayer();

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('');
  const [state, setState] = useState('Lagos');
  const [city, setCity] = useState('Lagos');
  const [genre, setGenre] = useState<StationGenre>('Afrobeats & Hits');
  const [selectedLanguages, setSelectedLanguages] = useState<NigerianLanguage[]>(['English', 'Pidgin']);
  const [tagline, setTagline] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [currentShow, setCurrentShow] = useState('');
  const [hostName, setHostName] = useState('');
  const [brandColor, setBrandColor] = useState('#008751');

  // Test stream state
  const [isTestingStream, setIsTestingStream] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [testAudio] = useState(() => new Audio());

  // Form submission state
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdStationId, setCreatedStationId] = useState<string | null>(null);

  if (!isSuggestModalOpen) return null;

  // Selected state info for major cities and region
  const currentStateObj = NIGERIAN_STATES.find(s => s.name === state) || NIGERIAN_STATES[0];

  const handleStateChange = (newState: string) => {
    setState(newState);
    const found = NIGERIAN_STATES.find(s => s.name === newState);
    if (found && found.majorCities.length > 0) {
      setCity(found.majorCities[0]);
    }
  };

  const toggleLanguage = (lang: NigerianLanguage) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) 
        ? (prev.length > 1 ? prev.filter(l => l !== lang) : prev) 
        : [...prev, lang]
    );
  };

  const handleTestAudio = () => {
    if (!streamUrl.trim()) {
      setTestStatus('failed');
      return;
    }

    setIsTestingStream(true);
    setTestStatus('idle');

    testAudio.src = streamUrl.trim();
    testAudio.load();
    testAudio.play()
      .then(() => {
        setIsTestingStream(false);
        setTestStatus('success');
        // Stop test after 4 seconds
        setTimeout(() => {
          testAudio.pause();
          testAudio.src = '';
        }, 4000);
      })
      .catch(() => {
        setIsTestingStream(false);
        setTestStatus('failed');
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !frequency.trim()) {
      alert('Please fill in Station Name and Frequency!');
      return;
    }

    const region: Region = currentStateObj.region;

    const newStation = suggestStation({
      name: name.trim(),
      frequency: frequency.trim().includes('FM') ? frequency.trim() : `${frequency.trim()} FM`,
      tagline: tagline.trim() || 'Nigeria’s finest broadcast',
      city: city.trim() || currentStateObj.capital,
      state: currentStateObj.name,
      region,
      genre,
      languages: selectedLanguages,
      streamUrl: streamUrl.trim() || null,
      brandColor,
      accentColor: '#FDB813',
      currentShow: currentShow.trim() || 'Daily Live Broadcast',
      hostName: hostName.trim() || 'On-Air Personality',
      description: `Community suggested Nigerian radio station broadcasting to listeners in ${city}, ${currentStateObj.name}.`,
    });

    setCreatedStationId(newStation.id);
    setIsSuccess(true);
  };

  const handlePlayNow = () => {
    if (createdStationId) {
      // Find and play
      const newStation = {
        id: createdStationId,
        name: name.trim(),
        frequency: frequency.trim(),
        tagline: tagline.trim() || 'Naija on air',
        city,
        state,
        region: currentStateObj.region,
        genre,
        languages: selectedLanguages,
        streamUrl: streamUrl.trim() || null,
        brandColor,
        accentColor: '#FDB813',
      };
      playStation(newStation);
    }
    handleClose();
  };

  const handleClose = () => {
    testAudio.pause();
    testAudio.src = '';
    setIsSuccess(false);
    closeSuggestModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-gradient-to-b from-[#092c1a] to-[#04160d] border border-emerald-700/80 rounded-3xl shadow-2xl text-white p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-emerald-950/80 text-emerald-300 hover:text-white hover:bg-emerald-900 border border-emerald-700/50 transition-colors z-20"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 bg-amber-400 text-emerald-950 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 font-['Cabinet_Grotesk',sans-serif]">
              Oshey! Station Added Successfully! 🇳🇬
            </h3>
            <p className="text-emerald-200/90 text-sm max-w-md mx-auto mb-6">
              <span className="font-bold text-amber-300">{name} ({frequency})</span> has been added to your Naija Radio stations list. You and other local users can now discover and tune in.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {streamUrl.trim() && (
                <button
                  onClick={handlePlayNow}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-400/25 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen Live Now</span>
                </button>
              )}
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer"
              >
                Back to Stations
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  COMMUNITY SUGGESTION 🎙️
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Cabinet_Grotesk',sans-serif]">
                Suggest a Nigerian Radio Station
              </h2>
              <p className="text-xs sm:text-sm text-emerald-300/80 mt-1">
                Know an ogbonge station we need to include? Submit its frequency, location, and stream so listeners everywhere can tune in!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              
              {/* Row 1: Station Name & Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-emerald-200 mb-1">
                    Station Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Wazobia FM, Splash FM, Freedom Radio"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#061e12] border border-emerald-700/60 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-200 mb-1">
                    Frequency / Dial <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="e.g. 95.1 FM, 99.3 FM, or Online HD"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#061e12] border border-emerald-700/60 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Row 2: State & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-emerald-200 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>State (36 States + FCT)</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#061e12] border border-emerald-700/60 text-white focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.region})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-emerald-200 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>City / Town</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Ikeja, Kano, Ibadan, Port Harcourt"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#061e12] border border-emerald-700/60 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Row 3: Genre & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-emerald-200 mb-1">
                    Primary Genre
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value as StationGenre)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#061e12] border border-emerald-700/60 text-white focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                  >
                    {ALL_GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-emerald-200 mb-1">
                    Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Oya make we talk!, Voice of the people"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#061e12] border border-emerald-700/60 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Row 4: Broadcast Languages */}
              <div>
                <label className="block font-bold text-emerald-200 mb-1.5 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>Broadcast Languages (Tap to select)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_LANGUAGES.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang);
                    return (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-emerald-950 font-bold shadow-sm'
                            : 'bg-[#061e12] text-emerald-300 border border-emerald-800 hover:border-emerald-600'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Stream URL with Test Feature */}
              <div className="bg-[#051c11] p-3.5 rounded-2xl border border-emerald-800/60">
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-emerald-200 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-amber-400" />
                    <span>Live Stream URL (Direct MP3 / AAC / Icecast)</span>
                  </label>
                  <span className="text-[10px] text-emerald-400/60">Optional</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={streamUrl}
                    onChange={(e) => {
                      setStreamUrl(e.target.value);
                      setTestStatus('idle');
                    }}
                    placeholder="https://example.com/stream or https://stream.zeno.fm/..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#06180f] border border-emerald-700/60 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestAudio}
                    disabled={!streamUrl.trim() || isTestingStream}
                    className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-colors"
                  >
                    {isTestingStream ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    <span>Test Audio</span>
                  </button>
                </div>
                {testStatus === 'success' && (
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Stream is active and playing!
                  </p>
                )}
                {testStatus === 'failed' && (
                  <p className="text-[11px] text-rose-400 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Could not play stream link. Verify that it allows direct streaming (CORS enabled).
                  </p>
                )}
                <p className="text-[10px] text-emerald-300/50 mt-1">
                  Tip: If no working stream is available right now, leave it empty. The station will be listed with an offline tag until a stream is added.
                </p>
              </div>

              {/* Row 6: Color theme & Host */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-emerald-200 mb-1">
                    Popular Show / Program
                  </label>
                  <input
                    type="text"
                    value={currentShow}
                    onChange={(e) => setCurrentShow(e.target.value)}
                    placeholder="e.g. Morning Crossfire, Una Wake Up"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#061e12] border border-emerald-700/60 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-200 mb-1">
                    Station Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-xs text-emerald-300/70 font-mono">{brandColor}</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-emerald-800/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl text-emerald-300 hover:text-white font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 text-emerald-950" />
                  <span>Submit Station</span>
                </button>
              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
};
