import { NextRequest, NextResponse } from "next/server";
import type { FlightSearchRequest, FlightSearchResponse, FlightSearchError } from "@/types/flight";
import { searchDuffelFlights, isDuffelConfigured } from "@/lib/duffel";
import { generateMockOffers } from "@/lib/mockFlights";

// Runs only on the server. This is the ONLY place the Duffel API key is
// used -- the browser never sees it, it only ever talks to this route.
export const runtime = "nodejs";

const IATA_RE = /^[A-Z]{3}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateRequest(body: any): { ok: true; value: FlightSearchRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const origin = String(body.origin ?? "").toUpperCase();
  const destination = String(body.destination ?? "").toUpperCase();
  const departureDate = String(body.departureDate ?? "");
  const returnDate = body.returnDate ? String(body.returnDate) : undefined;

  if (!IATA_RE.test(origin)) return { ok: false, error: "origin must be a 3-letter IATA code (e.g. SYD)." };
  if (!IATA_RE.test(destination)) return { ok: false, error: "destination must be a 3-letter IATA code (e.g. DPS)." };
  if (origin === destination) return { ok: false, error: "origin and destination must be different." };
  if (!DATE_RE.test(departureDate)) return { ok: false, error: "departureDate must be in YYYY-MM-DD format." };
  if (returnDate && !DATE_RE.test(returnDate)) {
    return { ok: false, error: "returnDate must be in YYYY-MM-DD format." };
  }

  const passengers = body.passengers ?? {};
  const adults = Number(passengers.adults ?? 1);
  const children = Number(passengers.children ?? 0);
  const infants = Number(passengers.infants ?? 0);

  if (!Number.isInteger(adults) || adults < 1 || adults > 9) {
    return { ok: false, error: "passengers.adults must be an integer between 1 and 9." };
  }
  if (!Number.isInteger(children) || children < 0 || children > 8) {
    return { ok: false, error: "passengers.children must be an integer between 0 and 8." };
  }
  if (!Number.isInteger(infants) || infants < 0 || infants > adults) {
    return { ok: false, error: "passengers.infants cannot exceed the number of adults." };
  }

  const cabinClass = ["economy", "premium_economy", "business", "first"].includes(body.cabinClass)
    ? body.cabinClass
    : "economy";

  return {
    ok: true,
    value: {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers: { adults, children, infants },
      cabinClass,
    },
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<FlightSearchError>({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validateRequest(body);
  if (!validation.ok) {
    return NextResponse.json<FlightSearchError>({ error: validation.error }, { status: 400 });
  }

  // No API key configured yet -> serve mock data instead of hard-failing,
  // so the app is usable immediately. Remove this branch once you always
  // want to require a live Duffel key.
  if (!isDuffelConfigured()) {
    const offers = generateMockOffers(validation.value);
    return NextResponse.json<FlightSearchResponse>({
      offers,
      source: "mock",
      warning:
        "DUFFEL_API_KEY is not set on the server, so sample data is shown. Add a key to .env.local for live pricing.",
    });
  }

  try {
    const offers = await searchDuffelFlights(validation.value);
    return NextResponse.json<FlightSearchResponse>({ offers, source: "duffel" });
  } catch (err: any) {
    console.error("[api/flights] Duffel search failed:", err);

    // Duffel's SDK throws errors with a `.errors` array of {title, detail}.
    const duffelDetail = Array.isArray(err?.errors)
      ? err.errors.map((e: any) => e.detail ?? e.title).join("; ")
      : undefined;

    return NextResponse.json<FlightSearchError>(
      {
        error: "Unable to fetch live flight data right now. Please try again shortly.",
        details: duffelDetail ?? (err instanceof Error ? err.message : String(err)),
      },
      { status: 502 }
    );
  }
}
