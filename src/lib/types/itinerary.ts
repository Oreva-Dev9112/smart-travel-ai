export interface WeatherData {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  category: string;
  location: {
    lat: number;
    lon: number;
  };
  entities?: {
    name: string;
    type: string;
  }[];
  venue?: {
    name: string;
    address?: string;
  };
}

export interface PointOfInterest {
  name: string;
  location: {
    address: string[];
    lat: number;
    lng: number;
  };
  categories: {
    name: string;
  }[];
  distance: number;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface ItineraryDay {
  date: string;
  activities: {
    time: string;
    title: string;
    description: string;
    location?: string;
    cost?: number;
  }[];
  weather: {
    forecast: string;
    backupPlan?: string;
  };
}

export interface ItineraryResponse {
  success: boolean;
  itinerary: {
    days: ItineraryDay[];
    totalCost: number;
    summary: string;
  };
  metadata: {
    location: Location;
    weather: WeatherData[];
    events: Event[];
    pointsOfInterest: PointOfInterest[];
  };
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
} 