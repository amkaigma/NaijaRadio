import React from 'react';
import { Search, X, Radio, MapPin, Sparkles } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  onSelectQuickSuggestion: (tag: string) => void;
  activeCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  onSelectQuickSuggestion,
  activeCount,
}) => {
  const quickPills = [
    { label: 'Wazobia', icon: Radio },
    { label: 'Lagos', icon: MapPin },
    { label: 'Abuja', icon: MapPin },
    { label: 'Kano', icon: MapPin },
    { label: 'Afrobeats', icon: Sparkles },
    { label: 'Pidgin', icon: Sparkles },
    { label: 'Hausa', icon: Sparkles },
    { label: 'Yoruba', icon: Sparkles },
    { label: 'Sports', icon: Sparkles },
    { label: '99.3 FM', icon: Radio },
  ];

  return (
    <div className="w-full">
      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-emerald-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by station name, frequency (e.g. 95.1 FM), state, city, genre..."
          className="w-full pl-12 pr-10 py-3.5 sm:py-4 rounded-2xl bg-[#082215]/90 border border-emerald-700/60 text-white placeholder-emerald-400/50 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 shadow-inner transition-all"
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-3.5 p-1 rounded-full text-emerald-400/70 hover:text-white hover:bg-emerald-800/40 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Search Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-1 text-xs">
        <span className="text-[11px] font-medium text-emerald-300/60 shrink-0 mr-1">
          Popular:
        </span>
        {quickPills.map((item) => {
          const Icon = item.icon;
          const isSelected = value.toLowerCase() === item.label.toLowerCase();
          return (
            <button
              key={item.label}
              onClick={() => onSelectQuickSuggestion(isSelected ? '' : item.label)}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-sm'
                  : 'bg-[#0d2e1e] text-emerald-200/80 hover:text-white hover:bg-emerald-800/40 border border-emerald-800/40'
              }`}
            >
              <Icon className="w-3 h-3 opacity-70" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
