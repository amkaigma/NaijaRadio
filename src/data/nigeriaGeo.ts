import { NigerianLanguage, Region, StationGenre } from '../types/radio';

export interface StateInfo {
  name: string;
  region: Region;
  capital: string;
  majorCities: string[];
}

export const NIGERIAN_REGIONS: Region[] = [
  'South West',
  'South South',
  'South East',
  'North Central',
  'North West',
  'North East',
];

export const NIGERIAN_STATES: StateInfo[] = [
  // South West
  { name: 'Lagos', region: 'South West', capital: 'Ikeja', majorCities: ['Lagos Island', 'Ikeja', 'Victoria Island', 'Lekki', 'Surulere', 'Yaba'] },
  { name: 'Oyo', region: 'South West', capital: 'Ibadan', majorCities: ['Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin'] },
  { name: 'Ogun', region: 'South West', capital: 'Abeokuta', majorCities: ['Abeokuta', 'Ijebu Ode', 'Sagamu', 'Ota'] },
  { name: 'Osun', region: 'South West', capital: 'Osogbo', majorCities: ['Osogbo', 'Ile-Ife', 'Ilesa', 'Ede'] },
  { name: 'Ondo', region: 'South West', capital: 'Akure', majorCities: ['Akure', 'Ondo Town', 'Owo', 'Ikare'] },
  { name: 'Ekiti', region: 'South West', capital: 'Ado-Ekiti', majorCities: ['Ado-Ekiti', 'Ikole', 'Ijero'] },

  // South South
  { name: 'Rivers', region: 'South South', capital: 'Port Harcourt', majorCities: ['Port Harcourt', 'Bonny', 'Obio-Akpor'] },
  { name: 'Delta', region: 'South South', capital: 'Asaba', majorCities: ['Asaba', 'Warri', 'Sapele', 'Ughelli'] },
  { name: 'Edo', region: 'South South', capital: 'Benin City', majorCities: ['Benin City', 'Auchi', 'Ekpoma'] },
  { name: 'Akwa Ibom', region: 'South South', capital: 'Uyo', majorCities: ['Uyo', 'Eket', 'Ikot Ekpene'] },
  { name: 'Cross River', region: 'South South', capital: 'Calabar', majorCities: ['Calabar', 'Ikom', 'Ogoja'] },
  { name: 'Bayelsa', region: 'South South', capital: 'Yenagoa', majorCities: ['Yenagoa', 'Brass', 'Ogbia'] },

  // South East
  { name: 'Enugu', region: 'South East', capital: 'Enugu', majorCities: ['Enugu', 'Nsukka', 'Awgu'] },
  { name: 'Anambra', region: 'South East', capital: 'Awka', majorCities: ['Awka', 'Onitsha', 'Nnewi'] },
  { name: 'Imo', region: 'South East', capital: 'Owerri', majorCities: ['Owerri', 'Orlu', 'Okigwe'] },
  { name: 'Abia', region: 'South East', capital: 'Umuahia', majorCities: ['Aba', 'Umuahia', 'Ohafia'] },
  { name: 'Ebonyi', region: 'South East', capital: 'Abakaliki', majorCities: ['Abakaliki', 'Afikpo'] },

  // North Central
  { name: 'Abuja (FCT)', region: 'North Central', capital: 'Abuja', majorCities: ['Abuja Central', 'Garki', 'Wuse', 'Maitama', 'Gwarinpa', 'Kubwa'] },
  { name: 'Plateau', region: 'North Central', capital: 'Jos', majorCities: ['Jos', 'Bukuru', 'Pankshin'] },
  { name: 'Kwara', region: 'North Central', capital: 'Ilorin', majorCities: ['Ilorin', 'Offa', 'Omu-Aran'] },
  { name: 'Benue', region: 'North Central', capital: 'Makurdi', majorCities: ['Makurdi', 'Gboko', 'Otukpo'] },
  { name: 'Kogi', region: 'North Central', capital: 'Lokoja', majorCities: ['Lokoja', 'Okene', 'Kabba'] },
  { name: 'Niger', region: 'North Central', capital: 'Minna', majorCities: ['Minna', 'Bida', 'Suleja', 'Kontagora'] },
  { name: 'Nasarawa', region: 'North Central', capital: 'Lafia', majorCities: ['Lafia', 'Keffi', 'Akwanga'] },

  // North West
  { name: 'Kano', region: 'North West', capital: 'Kano', majorCities: ['Kano City', 'Fagge', 'Dala', 'Gwale'] },
  { name: 'Kaduna', region: 'North West', capital: 'Kaduna', majorCities: ['Kaduna', 'Zaria', 'Kafanchan'] },
  { name: 'Katsina', region: 'North West', capital: 'Katsina', majorCities: ['Katsina', 'Daura', 'Funtua'] },
  { name: 'Sokoto', region: 'North West', capital: 'Sokoto', majorCities: ['Sokoto', 'Wamakko'] },
  { name: 'Kebbi', region: 'North West', capital: 'Birnin Kebbi', majorCities: ['Birnin Kebbi', 'Argungu', 'Yauri'] },
  { name: 'Zamfara', region: 'North West', capital: 'Gusau', majorCities: ['Gusau', 'Kaura Namoda'] },
  { name: 'Jigawa', region: 'North West', capital: 'Dutse', majorCities: ['Dutse', 'Hadejia', 'Kazaure'] },

  // North East
  { name: 'Borno', region: 'North East', capital: 'Maiduguri', majorCities: ['Maiduguri', 'Biu'] },
  { name: 'Bauchi', region: 'North East', capital: 'Bauchi', majorCities: ['Bauchi', 'Azare', 'Misau'] },
  { name: 'Gombe', region: 'North East', capital: 'Gombe', majorCities: ['Gombe', 'Kaltungo'] },
  { name: 'Adamawa', region: 'North East', capital: 'Yola', majorCities: ['Yola', 'Mubi', 'Jimeta'] },
  { name: 'Taraba', region: 'North East', capital: 'Jalingo', majorCities: ['Jalingo', 'Wukari'] },
  { name: 'Yobe', region: 'North East', capital: 'Damaturu', majorCities: ['Damaturu', 'Potiskum', 'Gashua'] },
];

export const ALL_GENRES: StationGenre[] = [
  'Afrobeats & Hits',
  'News & Talk',
  'Sports Radio',
  'Pidgin & Comedy',
  'Gospel & Christian',
  'Classic & Highlife',
  'Youth & Urban Pop',
  'Cultural & Community',
  'Islamic & Talk',
];

export const ALL_LANGUAGES: NigerianLanguage[] = [
  'Pidgin',
  'English',
  'Yoruba',
  'Hausa',
  'Igbo',
  'Fulfulde',
  'Kanuri',
  'Nupe',
  'Igala',
  'Ebira',
  'Multilingual',
];
