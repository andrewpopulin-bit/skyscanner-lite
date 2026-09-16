// Shared types between the API route and the UI.
// Kept intentionally small/flat -- the raw Duffel offer object is much bigger,
// this is the trimmed-down shape the client actually needs to render a card.

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface FlightSearchRequest {
  origin: string; // IATA code, e.g. "SYD"
  destination: string; // IATA code, e.g. "DPS"
  departureDate: string; // "YYYY-MM-DD"
  returnDate?: string; // "YYYY-MM-DD", omit for one-way
  passengers: PassengerCounts;
  cabinClass?: "economy" | "premium_economy" | "business" | "first";
}

export interface FlightSegment {
  airlineName: string;
  airlineIata: string;
  flightNumber: string;
  departureAirport: string;
  departureTime: string; // ISO 8601
  arrivalAirport: string;
  arrivalTime: string; // ISO 8601
  durationMinutes: number;
}

export interface FlightSlice {
  segments: FlightSegment[];
  durationMinutes: number;
  stops: number; // segments.length - 1
}

export interface FlightOffer {
  id: string;
  isDirect: boolean;
  isHighlightedCarrier: boolean; // Virgin Australia / Qantas / Garuda Indonesia
  airlineName: string;
  airlineIata: string;
  outbound: FlightSlice;
  inbound: FlightSlice | null;
  baseFarePerPassenger: number; // numeric amount, in `currency`
  currency: string;
  expiresAt: string | null;
}

export interface FlightSearchResponse {
  offers: FlightOffer[];
  source: "duffel" | "mock";
  warning?: string;
}

export interface FlightSearchError {
  error: string;
  details?: string;
}
