import type { FlightOffer, FlightSearchRequest } from "@/types/flight";
import { isHighlightedCarrier } from "@/lib/airlines";

// Used only when DUFFEL_API_KEY is not set, so the app is still demoable
// out of the box. Clearly flagged to the client via `source: "mock"`.

const SAMPLE_CARRIERS: Array<{ iata: string; name: string; flightNo: string; durationMin: number }> = [
  { iata: "VA", name: "Virgin Australia", flightNo: "VA75", durationMin: 385 },
  { iata: "QF", name: "Qantas", flightNo: "QF43", durationMin: 375 },
  { iata: "GA", name: "Garuda Indonesia", flightNo: "GA715", durationMin: 400 },
  { iata: "JQ", name: "Jetstar", flightNo: "JQ39", durationMin: 390 },
];

function isoAt(dateStr: string, hour: number, minute: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function buildOneWaySlice(
  origin: string,
  destination: string,
  dateStr: string,
  departHour: number,
  durationMin: number,
  carrier: (typeof SAMPLE_CARRIERS)[number]
) {
  const departureTime = isoAt(dateStr, departHour, (departHour * 17) % 60);
  const arrivalMs = new Date(departureTime).getTime() + durationMin * 60000;
  const arrivalTime = new Date(arrivalMs).toISOString();

  return {
    segments: [
      {
        airlineName: carrier.name,
        airlineIata: carrier.iata,
        flightNumber: carrier.flightNo,
        departureAirport: origin,
        departureTime,
        arrivalAirport: destination,
        arrivalTime,
        durationMinutes: durationMin,
      },
    ],
    durationMinutes: durationMin,
    stops: 0,
  };
}

export function generateMockOffers(params: FlightSearchRequest): FlightOffer[] {
  return SAMPLE_CARRIERS.map((carrier, index) => {
    const outbound = buildOneWaySlice(
      params.origin,
      params.destination,
      params.departureDate,
      7 + index * 3,
      carrier.durationMin,
      carrier
    );

    const inbound = params.returnDate
      ? buildOneWaySlice(
          params.destination,
          params.origin,
          params.returnDate,
          9 + index * 3,
          carrier.durationMin - 15,
          carrier
        )
      : null;

    // Deterministic-ish pricing so results feel plausible without being random noise.
    const basePrice = 420 + index * 65 + (params.returnDate ? 380 : 0);

    return {
      id: `mock-${carrier.iata}-${index}`,
      isDirect: true,
      isHighlightedCarrier: isHighlightedCarrier(carrier.iata),
      airlineName: carrier.name,
      airlineIata: carrier.iata,
      outbound,
      inbound,
      baseFarePerPassenger: basePrice,
      currency: "AUD",
      expiresAt: null,
    } satisfies FlightOffer;
  }).sort((a, b) => a.baseFarePerPassenger - b.baseFarePerPassenger);
}
