export interface Place {
  id: string;
  name: string;
  address: string;
  rating?: number;
  categories: string[];
  photos?: string[];
  reviews?: string[];
  geolocation: { lat: number; lng: number };
}

export interface CacheEntry {
  timestamp: number;
  data: Place[];
}