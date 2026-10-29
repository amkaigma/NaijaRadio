export type Region = 
  | 'South West'
  | 'South South'
  | 'South East'
  | 'North Central'
  | 'North West'
  | 'North East'
  | 'National / Online';

export type NigerianLanguage = 
  | 'English'
  | 'Pidgin'
  | 'Yoruba'
  | 'Hausa'
  | 'Igbo'
  | 'Fulfulde'
  | 'Kanuri'
  | 'Nupe'
  | 'Igala'
  | 'Ebira'
  | 'Multilingual';

export type StationGenre = 
  | 'Afrobeats & Hits'
  | 'News & Talk'
  | 'Sports Radio'
  | 'Gospel & Christian'
  | 'Pidgin & Comedy'
  | 'Classic & Highlife'
  | 'Youth & Urban Pop'
  | 'Cultural & Community'
  | 'Islamic & Talk';

export interface Station {
  id: string;
  name: string;
  tagline: string;
  frequency: string;
  city: string;
  state: string;
  region: Region;
  languages: NigerianLanguage[];
  genre: StationGenre;
  streamUrl: string | null; // Can be null/empty for offline stations
  backupStreamUrl?: string;
  logoUrl?: string;
  brandColor: string;
  accentColor: string;
  featured?: boolean;
  bitrate?: string;
  currentShow?: string;
  hostName?: string;
  website?: string;
  whatsapp?: string;
  phone?: string;
  twitter?: string;
  listenersEstimate?: number;
  isCommunitySubmitted?: boolean;
  description?: string;
}

export type ViewTab = 'discover' | 'browse' | 'favorites' | 'recent' | 'suggest';

export interface FilterState {
  searchQuery: string;
  region: Region | 'all';
  state: string | 'all';
  city: string | 'all';
  language: NigerianLanguage | 'all';
  genre: StationGenre | 'all';
  onlyLive: boolean; // only stations with working stream
}
