export interface Gem {
  _id: string;
  title: string;
  description: string;
  category: 'Cafe' | 'Park' | 'Study' | 'Viewpoint' | 'Food' | 'Photography';
  images: string[];
  coordinates: {
    type: 'Point';
    coordinates: [number, number]; // [Longitude, Latitude]
  };
  costEstimate: number; // 1, 2, or 3 ($ / $$ / $$$)
  crowdLevel: number; // 1 to 5 (1 = Empty/Solitary, 5 = Packed)
  noiseLevel: number; // 1 to 5 (1 = Dead Silent, 5 = Energetic/Loud)
  safetyRating: number; // 1 to 5
  wiFiAvailable: boolean;
  hiddenGemScore: number; // out of 10, e.g., 9.2 or 9.8
  submittedBy?: string | { _id: string; name: string; explorerLevel: number };
  createdAt?: string;
  savedCount?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  savedPlaces: string[]; // List of Gem ObjectIds
  contributionsCount: number;
  explorerLevel: number;
  badges: string[]; // unlocked badges list, e.g. ["First Discovery", "Reviewer Pro", "Local Guide"]
  contributionStats?: { month: string; count: number }[];
}

export interface Filters {
  search: string;
  category: string; // 'All' or specific categories
  price: number | null; // 1, 2, 3 or null for all
  noise: number; // max noise tolerated (1-5)
  crowd: number; // max crowd tolerated (1-5)
  safety: number; // min safety rating required (1-5)
}
