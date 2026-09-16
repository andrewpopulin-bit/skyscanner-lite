import { Duffel } from "@duffel/api";
import type {
  FlightOffer,
  FlightSearchRequest,
  FlightSlice,
  FlightSegment,
} from "@/types/flight";
import { isHighlightedCarrier } from "@/lib/airlines";

// This file only ever runs on the server (imported from a Route Handler),
// so process.env.DUFFEL_API_KEY is never bundled into client JS.

let duffelClient: Duffel | null = null;

function getDuffelClient(): Duffel {
  const token = process.env.DUFFEL_API_KEY;
  if (!token) {
    throw new Error("MISSING_DUFFEL_API_KEY");
  }
  if (!duffelClient) {
    duffelClient = new Duffel({ token });
  }
  return duffelClient;
}

function minutesBetween(startIso: string, endIso: string): number {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

/**
 * Maps a single raw Duffel "slice" (one direction of travel) into our
 * trimmed-down FlightSlice shape.
 */
function mapSlice(slice: any): FlightSlice {
  const segments: FlightSegment[] = slice.segments.map((seg: any) => ({
    airlineName: seg.marketing_carrier?.name ?? seg.operating_carrier?.name ?? "Unknown",
    airlineIata: seg.marketing_carrier?.iata_code ?? seg.operating_carrier?.iata_code ?? "??",
    flightNumber: `${seg.marketing_carrier?.iata_code ?? ""}${seg.marketing_carrier_flight_number ?? ""}`,
    departureAirport: seg.origin?.iata_code ?? "???",
    departureTime: seg.departing_at,
    arrivalAirport: seg.destination?.iata_code ?? "???",
    arrivalTime: seg.arriving_at,
    durationMinutes: minutesBetween(seg.departing_at, seg.arriving_at),
  }));

  const durationMinutes = segments.length
    ? minutesBetween(segments[0].departureTime, segments[segments.length - 1].arrivalTime)
    : 0;

  return {
    segments,
    durationMinutes,
    stops: Math.max(0, segments.length - 1),
  };
}

/**
 * Maps one raw Duffel offer into our FlightOffer shape. Returns null for
 * offers we can't sensibly render (e.g. no slices), so callers can filter.
 */
function mapOffer(offer: any): FlightOffer | null {
  const rawSlices = offer.slices ?? [];
  if (rawSlices.length === 0) return null;

  const outbound = mapSlice(rawSlices[0]);
  const inbound = rawSlices.length > 1 ? mapSlice(rawSlices[1]) : null;

  const primarySegment = rawSlices[0]?.segments?.[0];
  const airlineIata = primarySegment?.marketing_carrier?.iata_code ?? "??";
  const airlineName = primarySegment?.marketing_carrier?.name ?? "Unknown airline";

  return {
    id: offer.id,
    isDirect: outbound.stops === 0 && (!inbound || inbound.stops === 0),
    isHighlightedCarrier: isHighlightedCarrier(airlineIata),
    airlineName,
    airlineIata,
    outbound,
    inbound,
    baseFarePerPassenger: parseFloat(offer.total_amount ?? "0"),
    currency: offer.total_currency ?? "AUD",
    expiresAt: offer.expires_at ?? null,
  };
}

/**
 * Searches live flight offers via Duffel. Throws on any API/network failure
 * so the caller (the API route) can decide how to respond.
 */
export async function searchDuffelFlights(
  params: FlightSearchRequest
): Promise<FlightOffer[]> {
  const duffel = getDuffelClient();

  const slices: Array<{
    origin: string;
    destination: string;
    departure_date: string;
    arrival_time: null;
    departure_time: null;
  }> = [
    {
      origin: params.origin,
      destination: params.destination,
      departure_date: params.departureDate,
      arrival_time: null,
      departure_time: null,
    },
  ];

  if (params.returnDate) {
    slices.push({
      origin: params.destination,
      destination: params.origin,
      departure_date: params.returnDate,
      arrival_time: null,
      departure_time: null,
    });
  }

  const passengers = [
    ...Array(params.passengers.adults).fill({ type: "adult" }),
    ...Array(params.passengers.children).fill({ type: "child" }),
    ...Array(params.passengers.infants).fill({ type: "infant_without_seat" }),
  ];

  const response = await duffel.offerRequests.create({
    slices,
    passengers,
    cabin_class: params.cabinClass ?? "economy",
    return_offers: true,
  });

  const offers = (response.data.offers ?? [])
    .map(mapOffer)
    .filter((o: FlightOffer | null): o is FlightOffer => o !== null)
    // Cheapest first.
    .sort((a: FlightOffer, b: FlightOffer) => a.baseFarePerPassenger - b.baseFarePerPassenger);

  return offers;
}

export function isDuffelConfigured(): boolean {
  return Boolean(process.env.DUFFEL_API_KEY);
}
