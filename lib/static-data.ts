import { Airport, FlightDestination } from "./types";

export const DEFAULT_ORIGIN: Airport = {
  iata: "CDG",
  name: "Charles de Gaulle",
  city: "Paris",
  country: "France",
  lat: 49.0097,
  lng: 2.5479,
};

export const POPULAR_AIRPORTS: Airport[] = [
  // France
  { iata: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France", lat: 49.0097, lng: 2.5479 },
  { iata: "ORY", name: "Orly", city: "Paris", country: "France", lat: 48.7233, lng: 2.3794 },
  { iata: "LYS", name: "Saint-Exupéry", city: "Lyon", country: "France", lat: 45.7256, lng: 5.0811 },
  { iata: "MRS", name: "Provence", city: "Marseille", country: "France", lat: 43.4393, lng: 5.2214 },
  { iata: "NCE", name: "Côte d'Azur", city: "Nice", country: "France", lat: 43.6584, lng: 7.2159 },
  { iata: "BOD", name: "Mérignac", city: "Bordeaux", country: "France", lat: 44.8283, lng: -0.7156 },
  { iata: "TLS", name: "Blagnac", city: "Toulouse", country: "France", lat: 43.6291, lng: 1.3638 },
  { iata: "NTE", name: "Atlantique", city: "Nantes", country: "France", lat: 47.1532, lng: -1.6108 },
  // Europe
  { iata: "LHR", name: "Heathrow", city: "London", country: "United Kingdom", lat: 51.47, lng: -0.4543 },
  { iata: "LGW", name: "Gatwick", city: "London", country: "United Kingdom", lat: 51.1537, lng: -0.1821 },
  { iata: "AMS", name: "Schiphol", city: "Amsterdam", country: "Netherlands", lat: 52.3086, lng: 4.7639 },
  { iata: "FRA", name: "Frankfurt", city: "Frankfurt", country: "Germany", lat: 50.0333, lng: 8.5706 },
  { iata: "BER", name: "Brandenburg", city: "Berlin", country: "Germany", lat: 52.362, lng: 13.5 },
  { iata: "MUC", name: "Franz Josef Strauss", city: "Munich", country: "Germany", lat: 48.3538, lng: 11.786 },
  { iata: "BCN", name: "El Prat", city: "Barcelona", country: "Spain", lat: 41.2971, lng: 2.0785 },
  { iata: "MAD", name: "Barajas", city: "Madrid", country: "Spain", lat: 40.4719, lng: -3.5626 },
  { iata: "AGP", name: "Costa del Sol", city: "Malaga", country: "Spain", lat: 36.675, lng: -4.499 },
  { iata: "PMI", name: "Son Sant Joan", city: "Palma de Majorque", country: "Spain", lat: 39.5517, lng: 2.7388 },
  { iata: "FCO", name: "Fiumicino", city: "Rome", country: "Italy", lat: 41.8003, lng: 12.2389 },
  { iata: "MXP", name: "Malpensa", city: "Milan", country: "Italy", lat: 45.6306, lng: 8.7281 },
  { iata: "NAP", name: "Capodichino", city: "Naples", country: "Italy", lat: 40.886, lng: 14.291 },
  { iata: "LIS", name: "Humberto Delgado", city: "Lisbonne", country: "Portugal", lat: 38.7756, lng: -9.1354 },
  { iata: "OPO", name: "Francisco Sá Carneiro", city: "Porto", country: "Portugal", lat: 41.2481, lng: -8.6813 },
  { iata: "BRU", name: "Zaventem", city: "Brussels", country: "Belgium", lat: 50.9014, lng: 4.4844 },
  { iata: "ZRH", name: "Zürich", city: "Zurich", country: "Switzerland", lat: 47.4647, lng: 8.5492 },
  { iata: "VIE", name: "Schwechat", city: "Vienne", country: "Austria", lat: 48.1103, lng: 16.5697 },
  { iata: "CPH", name: "Kastrup", city: "Copenhague", country: "Denmark", lat: 55.618, lng: 12.656 },
  { iata: "ARN", name: "Arlanda", city: "Stockholm", country: "Sweden", lat: 59.6519, lng: 17.9186 },
  { iata: "OSL", name: "Gardermoen", city: "Oslo", country: "Norway", lat: 60.1976, lng: 11.1004 },
  { iata: "HEL", name: "Vantaa", city: "Helsinki", country: "Finland", lat: 60.3172, lng: 24.9633 },
  { iata: "DUB", name: "Dublin", city: "Dublin", country: "Ireland", lat: 53.4213, lng: -6.2701 },
  { iata: "ATH", name: "Eleftherios Venizelos", city: "Athènes", country: "Greece", lat: 37.9364, lng: 23.9445 },
  { iata: "IST", name: "Istanbul", city: "Istanbul", country: "Turkey", lat: 41.2753, lng: 28.7519 },
  { iata: "PRG", name: "Václav Havel", city: "Prague", country: "Czech Republic", lat: 50.1008, lng: 14.26 },
  { iata: "BUD", name: "Ferenc Liszt", city: "Budapest", country: "Hungary", lat: 47.4298, lng: 19.2611 },
  { iata: "WAW", name: "Chopin", city: "Varsovie", country: "Poland", lat: 52.1657, lng: 20.9671 },
  { iata: "KRK", name: "Jean-Paul II", city: "Cracovie", country: "Poland", lat: 50.0777, lng: 19.7848 },
  { iata: "OTP", name: "Henri Coandă", city: "Bucarest", country: "Romania", lat: 44.5711, lng: 26.085 },
  { iata: "MLA", name: "Luqa", city: "La Valette", country: "Malta", lat: 35.8575, lng: 14.4775 },
  { iata: "KEF", name: "Keflavík", city: "Reykjavik", country: "Iceland", lat: 63.985, lng: -22.6056 },
  { iata: "DBV", name: "Dubrovnik", city: "Dubrovnik", country: "Croatia", lat: 42.5614, lng: 18.2682 },
  { iata: "TIA", name: "Nënë Tereza", city: "Tirana", country: "Albania", lat: 41.4147, lng: 19.7206 },
  // Afrique & Moyen-Orient
  { iata: "RAK", name: "Ménara", city: "Marrakech", country: "Morocco", lat: 31.6069, lng: -8.0363 },
  { iata: "CMN", name: "Mohammed V", city: "Casablanca", country: "Morocco", lat: 33.3675, lng: -7.5898 },
  { iata: "TUN", name: "Carthage", city: "Tunis", country: "Tunisia", lat: 36.851, lng: 10.227 },
  { iata: "CAI", name: "Cairo", city: "Le Caire", country: "Egypt", lat: 30.1219, lng: 31.4056 },
  { iata: "DSS", name: "Blaise Diagne", city: "Dakar", country: "Senegal", lat: 14.67, lng: -17.073 },
  { iata: "DXB", name: "Dubai International", city: "Dubaï", country: "UAE", lat: 25.2532, lng: 55.3657 },
  { iata: "TLV", name: "Ben Gurion", city: "Tel Aviv", country: "Israel", lat: 32.0055, lng: 34.8854 },
  { iata: "DOH", name: "Hamad", city: "Doha", country: "Qatar", lat: 25.2609, lng: 51.6138 },
  { iata: "JNB", name: "O.R. Tambo", city: "Johannesburg", country: "South Africa", lat: -26.1392, lng: 28.246 },
  // Asie
  { iata: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "Thailand", lat: 13.6811, lng: 100.7472 },
  { iata: "SIN", name: "Changi", city: "Singapour", country: "Singapore", lat: 1.3644, lng: 103.9915 },
  { iata: "HND", name: "Haneda", city: "Tokyo", country: "Japan", lat: 35.5494, lng: 139.7798 },
  { iata: "ICN", name: "Incheon", city: "Séoul", country: "South Korea", lat: 37.4602, lng: 126.4407 },
  { iata: "DEL", name: "Indira Gandhi", city: "New Delhi", country: "India", lat: 28.5562, lng: 77.1000 },
  { iata: "HKG", name: "Hong Kong", city: "Hong Kong", country: "China", lat: 22.3080, lng: 113.9185 },
  { iata: "PEK", name: "Capital", city: "Pékin", country: "China", lat: 40.0799, lng: 116.6031 },
  { iata: "KUL", name: "KLIA", city: "Kuala Lumpur", country: "Malaysia", lat: 2.7456, lng: 101.7099 },
  { iata: "DPS", name: "Ngurah Rai", city: "Bali", country: "Indonesia", lat: -8.7482, lng: 115.1672 },
  // Amériques
  { iata: "JFK", name: "John F. Kennedy", city: "New York", country: "USA", lat: 40.6413, lng: -73.7781 },
  { iata: "LAX", name: "Los Angeles", city: "Los Angeles", country: "USA", lat: 33.9425, lng: -118.4081 },
  { iata: "MIA", name: "Miami", city: "Miami", country: "USA", lat: 25.7959, lng: -80.2870 },
  { iata: "SFO", name: "San Francisco", city: "San Francisco", country: "USA", lat: 37.6213, lng: -122.379 },
  { iata: "YUL", name: "Trudeau", city: "Montréal", country: "Canada", lat: 45.4706, lng: -73.7408 },
  { iata: "YYZ", name: "Pearson", city: "Toronto", country: "Canada", lat: 43.6777, lng: -79.6248 },
  { iata: "MEX", name: "Benito Juárez", city: "Mexico", country: "Mexico", lat: 19.4363, lng: -99.0721 },
  { iata: "GRU", name: "Guarulhos", city: "São Paulo", country: "Brazil", lat: -23.4356, lng: -46.4731 },
  { iata: "BOG", name: "El Dorado", city: "Bogota", country: "Colombia", lat: 4.7016, lng: -74.1469 },
  { iata: "CUN", name: "Cancún", city: "Cancún", country: "Mexico", lat: 21.0365, lng: -86.8771 },
  // Océanie
  { iata: "SYD", name: "Kingsford Smith", city: "Sydney", country: "Australia", lat: -33.9461, lng: 151.1772 },
  { iata: "AKL", name: "Auckland", city: "Auckland", country: "New Zealand", lat: -37.0082, lng: 174.7850 },
];

const flag = (country: string): string => {
  const flags: Record<string, string> = {
    // English names
    "Portugal": "🇵🇹", "Spain": "🇪🇸", "Italy": "🇮🇹", "Greece": "🇬🇷",
    "Croatia": "🇭🇷", "Morocco": "🇲🇦", "United Kingdom": "🇬🇧", "Ireland": "🇮🇪",
    "Netherlands": "🇳🇱", "Belgium": "🇧🇪", "Germany": "🇩🇪", "Czech Republic": "🇨🇿",
    "Austria": "🇦🇹", "Hungary": "🇭🇺", "Poland": "🇵🇱", "Denmark": "🇩🇰",
    "Sweden": "🇸🇪", "Norway": "🇳🇴", "Finland": "🇫🇮", "Iceland": "🇮🇸",
    "Switzerland": "🇨🇭", "Turkey": "🇹🇷", "Tunisia": "🇹🇳", "Egypt": "🇪🇬",
    "Romania": "🇷🇴", "Bulgaria": "🇧🇬", "Malta": "🇲🇹", "Cyprus": "🇨🇾",
    "Latvia": "🇱🇻", "Estonia": "🇪🇪", "Lithuania": "🇱🇹", "Albania": "🇦🇱",
    "Montenegro": "🇲🇪", "Serbia": "🇷🇸", "Senegal": "🇸🇳", "Georgia": "🇬🇪",
    "Israel": "🇮🇱", "Jordan": "🇯🇴", "UAE": "🇦🇪", "Thailand": "🇹🇭",
    "Japan": "🇯🇵", "USA": "🇺🇸", "Canada": "🇨🇦", "Brazil": "🇧🇷",
    "Mexico": "🇲🇽", "Colombia": "🇨🇴", "Cape Verde": "🇨🇻", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "France": "🇫🇷", "Singapore": "🇸🇬", "South Korea": "🇰🇷", "India": "🇮🇳",
    "China": "🇨🇳", "Malaysia": "🇲🇾", "Indonesia": "🇮🇩", "Australia": "🇦🇺",
    "New Zealand": "🇳🇿", "Qatar": "🇶🇦", "South Africa": "🇿🇦",
    // French names (from Travelpayouts /data/fr/)
    "Espagne": "🇪🇸", "Italie": "🇮🇹", "Grèce": "🇬🇷", "Croatie": "🇭🇷",
    "Maroc": "🇲🇦", "Royaume-Uni": "🇬🇧", "Irlande": "🇮🇪", "Pays-Bas": "🇳🇱",
    "Belgique": "🇧🇪", "Allemagne": "🇩🇪", "République tchèque": "🇨🇿", "Tchéquie": "🇨🇿",
    "Autriche": "🇦🇹", "Hongrie": "🇭🇺", "Pologne": "🇵🇱", "Danemark": "🇩🇰",
    "Suède": "🇸🇪", "Norvège": "🇳🇴", "Finlande": "🇫🇮", "Islande": "🇮🇸",
    "Suisse": "🇨🇭", "Turquie": "🇹🇷", "Tunisie": "🇹🇳", "Égypte": "🇪🇬",
    "Roumanie": "🇷🇴", "Bulgarie": "🇧🇬", "Malte": "🇲🇹", "Chypre": "🇨🇾",
    "Lettonie": "🇱🇻", "Estonie": "🇪🇪", "Lituanie": "🇱🇹", "Albanie": "🇦🇱",
    "Monténégro": "🇲🇪", "Serbie": "🇷🇸", "Sénégal": "🇸🇳", "Géorgie": "🇬🇪",
    "Israël": "🇮🇱", "Jordanie": "🇯🇴", "Émirats arabes unis": "🇦🇪",
    "Thaïlande": "🇹🇭", "Japon": "🇯🇵", "États-Unis": "🇺🇸", "Brésil": "🇧🇷",
    "Mexique": "🇲🇽", "Colombie": "🇨🇴", "Cap-Vert": "🇨🇻", "Écosse": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "Singapour": "🇸🇬", "Corée du Sud": "🇰🇷", "Inde": "🇮🇳", "Chine": "🇨🇳",
    "Malaisie": "🇲🇾", "Indonésie": "🇮🇩", "Australie": "🇦🇺",
    "Nouvelle-Zélande": "🇳🇿", "Afrique du Sud": "🇿🇦",
    "Algérie": "🇩🇿", "Luxembourg": "🇱🇺", "Bosnie-Herzégovine": "🇧🇦",
    "Macédoine du Nord": "🇲🇰", "Moldavie": "🇲🇩", "Ukraine": "🇺🇦",
    "Russie": "🇷🇺", "Biélorussie": "🇧🇾", "Arménie": "🇦🇲", "Azerbaïdjan": "🇦🇿",
    "Ouzbékistan": "🇺🇿", "Kazakhstan": "🇰🇿", "Arabie saoudite": "🇸🇦",
    "Oman": "🇴🇲", "Bahreïn": "🇧🇭", "Koweït": "🇰🇼", "Liban": "🇱🇧",
    "Viêt Nam": "🇻🇳", "Philippines": "🇵🇭", "Cambodge": "🇰🇭", "Sri Lanka": "🇱🇰",
    "Népal": "🇳🇵", "Myanmar": "🇲🇲", "Taïwan": "🇹🇼", "Mongolie": "🇲🇳",
    "Argentine": "🇦🇷", "Chili": "🇨🇱", "Pérou": "🇵🇪", "Équateur": "🇪🇨",
    "Cuba": "🇨🇺", "République dominicaine": "🇩🇴", "Costa Rica": "🇨🇷",
    "Panama": "🇵🇦", "Guatemala": "🇬🇹", "Porto Rico": "🇵🇷",
    "Jamaïque": "🇯🇲", "Trinité-et-Tobago": "🇹🇹", "Haïti": "🇭🇹",
    "Kenya": "🇰🇪", "Tanzanie": "🇹🇿", "Éthiopie": "🇪🇹", "Nigeria": "🇳🇬",
    "Ghana": "🇬🇭", "Côte d'Ivoire": "🇨🇮", "Cameroun": "🇨🇲",
    "Maurice": "🇲🇺", "Madagascar": "🇲🇬", "Mozambique": "🇲🇿",
    "Namibie": "🇳🇦", "Rwanda": "🇷🇼", "Ouganda": "🇺🇬",
  };
  return flags[country] ?? "🌍";
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getStaticDestinations(_origin?: string): FlightDestination[] {
  const destinations: Array<{
    city: string; country: string; iata: string; lat: number; lng: number;
    price: number; airline: string; direct: boolean; duration: string;
  }> = [
    { city: "Lisbonne", country: "Portugal", iata: "LIS", lat: 38.7756, lng: -9.1354, price: 98, airline: "Transavia", direct: true, duration: "2h40" },
    { city: "Porto", country: "Portugal", iata: "OPO", lat: 41.2481, lng: -8.6813, price: 104, airline: "Ryanair", direct: true, duration: "2h15" },
    { city: "Barcelone", country: "Spain", iata: "BCN", lat: 41.2971, lng: 2.0785, price: 68, airline: "Vueling", direct: true, duration: "1h50" },
    { city: "Madrid", country: "Spain", iata: "MAD", lat: 40.4719, lng: -3.5626, price: 82, airline: "easyJet", direct: true, duration: "2h10" },
    { city: "Malaga", country: "Spain", iata: "AGP", lat: 36.675, lng: -4.499, price: 110, airline: "Ryanair", direct: true, duration: "2h30" },
    { city: "Séville", country: "Spain", iata: "SVQ", lat: 37.418, lng: -5.893, price: 136, airline: "Vueling", direct: true, duration: "2h20" },
    { city: "Palma", country: "Spain", iata: "PMI", lat: 39.5517, lng: 2.7388, price: 90, airline: "Transavia", direct: true, duration: "2h00" },
    { city: "Ibiza", country: "Spain", iata: "IBZ", lat: 38.8729, lng: 1.3731, price: 156, airline: "Vueling", direct: true, duration: "1h55" },
    { city: "Rome", country: "Italy", iata: "FCO", lat: 41.8003, lng: 12.2389, price: 76, airline: "Ryanair", direct: true, duration: "2h15" },
    { city: "Milan", country: "Italy", iata: "MXP", lat: 45.6306, lng: 8.7281, price: 64, airline: "easyJet", direct: true, duration: "1h35" },
    { city: "Naples", country: "Italy", iata: "NAP", lat: 40.886, lng: 14.291, price: 88, airline: "Transavia", direct: true, duration: "2h20" },
    { city: "Venise", country: "Italy", iata: "VCE", lat: 45.5053, lng: 12.3519, price: 112, airline: "Volotea", direct: true, duration: "1h45" },
    { city: "Florence", country: "Italy", iata: "FLR", lat: 43.81, lng: 11.205, price: 124, airline: "Vueling", direct: true, duration: "1h50" },
    { city: "Athènes", country: "Greece", iata: "ATH", lat: 37.9364, lng: 23.9445, price: 178, airline: "Aegean", direct: true, duration: "3h15" },
    { city: "Santorin", country: "Greece", iata: "JTR", lat: 36.3992, lng: 25.4793, price: 270, airline: "Transavia", direct: true, duration: "3h30" },
    { city: "Crète", country: "Greece", iata: "HER", lat: 35.3397, lng: 25.1803, price: 196, airline: "easyJet", direct: true, duration: "3h25" },
    { city: "Dubrovnik", country: "Croatia", iata: "DBV", lat: 42.5614, lng: 18.2682, price: 230, airline: "Croatia Airlines", direct: true, duration: "2h15" },
    { city: "Split", country: "Croatia", iata: "SPU", lat: 43.5389, lng: 16.298, price: 170, airline: "easyJet", direct: true, duration: "2h05" },
    { city: "Marrakech", country: "Morocco", iata: "RAK", lat: 31.6069, lng: -8.0363, price: 130, airline: "Ryanair", direct: true, duration: "3h20" },
    { city: "Agadir", country: "Morocco", iata: "AGA", lat: 30.325, lng: -9.413, price: 158, airline: "Transavia", direct: true, duration: "3h35" },
    { city: "Londres", country: "United Kingdom", iata: "LHR", lat: 51.47, lng: -0.4543, price: 110, airline: "Air France", direct: true, duration: "1h15" },
    { city: "Dublin", country: "Ireland", iata: "DUB", lat: 53.4213, lng: -6.2701, price: 96, airline: "Ryanair", direct: true, duration: "1h40" },
    { city: "Amsterdam", country: "Netherlands", iata: "AMS", lat: 52.3086, lng: 4.7639, price: 124, airline: "Transavia", direct: true, duration: "1h15" },
    { city: "Bruxelles", country: "Belgium", iata: "BRU", lat: 50.9014, lng: 4.4844, price: 150, airline: "Air France", direct: true, duration: "1h05" },
    { city: "Berlin", country: "Germany", iata: "BER", lat: 52.362, lng: 13.5, price: 90, airline: "easyJet", direct: true, duration: "1h50" },
    { city: "Munich", country: "Germany", iata: "MUC", lat: 48.3538, lng: 11.786, price: 116, airline: "Lufthansa", direct: true, duration: "1h35" },
    { city: "Prague", country: "Czech Republic", iata: "PRG", lat: 50.1008, lng: 14.26, price: 84, airline: "Transavia", direct: true, duration: "1h45" },
    { city: "Vienne", country: "Austria", iata: "VIE", lat: 48.1103, lng: 16.5697, price: 110, airline: "Austrian", direct: true, duration: "2h00" },
    { city: "Budapest", country: "Hungary", iata: "BUD", lat: 47.4298, lng: 19.2611, price: 78, airline: "Wizz Air", direct: true, duration: "2h15" },
    { city: "Varsovie", country: "Poland", iata: "WAW", lat: 52.1657, lng: 20.9671, price: 96, airline: "Wizz Air", direct: true, duration: "2h20" },
    { city: "Cracovie", country: "Poland", iata: "KRK", lat: 50.0777, lng: 19.7848, price: 70, airline: "Ryanair", direct: true, duration: "2h10" },
    { city: "Copenhague", country: "Denmark", iata: "CPH", lat: 55.618, lng: 12.656, price: 130, airline: "Norwegian", direct: true, duration: "2h05" },
    { city: "Stockholm", country: "Sweden", iata: "ARN", lat: 59.6519, lng: 17.9186, price: 144, airline: "SAS", direct: true, duration: "2h40" },
    { city: "Reykjavik", country: "Iceland", iata: "KEF", lat: 63.985, lng: -22.6056, price: 290, airline: "PLAY", direct: true, duration: "3h40" },
    { city: "Istanbul", country: "Turkey", iata: "IST", lat: 41.2753, lng: 28.7519, price: 190, airline: "Turkish Airlines", direct: true, duration: "3h30" },
    { city: "Tunis", country: "Tunisia", iata: "TUN", lat: 36.851, lng: 10.227, price: 164, airline: "Transavia", direct: true, duration: "2h25" },
    { city: "La Valette", country: "Malta", iata: "MLA", lat: 35.8575, lng: 14.4775, price: 150, airline: "Air Malta", direct: true, duration: "2h35" },
    { city: "Bucarest", country: "Romania", iata: "OTP", lat: 44.5711, lng: 26.085, price: 96, airline: "Wizz Air", direct: true, duration: "3h00" },
    { city: "Tirana", country: "Albania", iata: "TIA", lat: 41.4147, lng: 19.7206, price: 110, airline: "Transavia", direct: true, duration: "2h30" },
    { city: "Tbilissi", country: "Georgia", iata: "TBS", lat: 41.6692, lng: 44.9547, price: 370, airline: "Wizz Air", direct: false, duration: "6h15" },
    { city: "Tel Aviv", country: "Israel", iata: "TLV", lat: 32.0055, lng: 34.8854, price: 310, airline: "El Al", direct: true, duration: "4h30" },
    { city: "Dubaï", country: "UAE", iata: "DXB", lat: 25.2532, lng: 55.3657, price: 570, airline: "Emirates", direct: true, duration: "6h30" },
    { city: "Bangkok", country: "Thailand", iata: "BKK", lat: 13.6811, lng: 100.7472, price: 760, airline: "Thai Airways", direct: false, duration: "11h20" },
    { city: "New York", country: "USA", iata: "JFK", lat: 40.6413, lng: -73.7781, price: 590, airline: "French Bee", direct: true, duration: "8h15" },
    { city: "Montréal", country: "Canada", iata: "YUL", lat: 45.4706, lng: -73.7408, price: 640, airline: "Air Transat", direct: true, duration: "7h30" },
    { city: "Dakar", country: "Senegal", iata: "DSS", lat: 14.67, lng: -17.073, price: 550, airline: "Air Senegal", direct: true, duration: "5h45" },
  ];

  return destinations.map((d) => ({
    destination: {
      iata: d.iata,
      name: d.city,
      city: d.city,
      country: d.country,
      lat: d.lat,
      lng: d.lng,
    },
    price: d.price,
    currency: "EUR",
    airline: d.airline,
    departureDate: "2026-05-15",
    returnDate: "2026-05-22",
    direct: d.direct,
    duration: d.duration,
  }));
}

/** Seasonal multiplier per month (1 = base, higher = more expensive) */
const SEASON_MULTIPLIER: Record<string, number> = {
  "2026-04": 0.85,
  "2026-05": 0.92,
  "2026-06": 1.15,
  "2026-07": 1.45,
  "2026-08": 1.50,
  "2026-09": 0.90,
};

/** Deterministic pseudo-random from a seed string */
function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return ((h >>> 0) % 100) / 100;
}

/** Stay duration in days from filter value */
function stayDays(stayDuration: string): number {
  switch (stayDuration) {
    case "1-3": return 2;
    case "4-7": return 5;
    case "8-14": return 10;
    default: return 7;
  }
}

/**
 * Get destinations with prices adjusted for month & dates for stay duration.
 */
export function getFilteredDestinations(
  origin: string,
  month: string,
  stay: string
): FlightDestination[] {
  const base = getStaticDestinations(origin);
  const multiplier = month === "flexible" ? 1 : (SEASON_MULTIPLIER[month] ?? 1);
  const days = stayDays(stay);

  // Pick a departure date in the selected month
  const depMonth = month === "flexible" ? "2026-05" : month;
  const depDate = `${depMonth}-15`;
  const dep = new Date(depDate);
  const ret = new Date(dep);
  ret.setDate(ret.getDate() + days);
  const retDate = ret.toISOString().split("T")[0];

  return base.map((f) => {
    // Per-destination price variation so it's not uniform
    const variation = 0.9 + seededRandom(f.destination.iata + month) * 0.2;
    const adjusted = Math.round(f.price * multiplier * variation);
    return {
      ...f,
      price: adjusted,
      departureDate: depDate,
      returnDate: retDate,
    };
  });
}

export function getCountryFlag(country: string): string {
  return flag(country);
}
