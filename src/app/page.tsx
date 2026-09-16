"use client";

import { useState } from "react";
import { PlaneTakeoff } from "lucide-react";
import SearchForm from "@/components/SearchForm";
import FlightResults from "@/components/FlightResults";
import type {
  FlightOffer,
  FlightSearchRequest,
  FlightSearchResponse,
  FlightSearchError,
  PassengerCounts,
} from "@/types/flight";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [warning, setWarning] = useState<string | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);
  const [passengers, setPassengers] = useState<PassengerCounts>({ adults: 1, children: 0, infants: 0 });

  async function handleSearch(params: FlightSearchRequest) {
    setIsLoading(true);
    setError(null);
    setWarning(undefined);
    setHasSearched(true);
    setPassengers(params.passengers);

    try {
      const res = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = (await res.json()) as FlightSearchResponse | FlightSearchError;

      if (!res.ok || "error" in data) {
        const message = "error" in data ? data.error : "Something went wrong fetching flights.";
        throw new Error(message);
      }

      setOffers(data.offers);
      setWarning(data.warning);
    } catch (err) {
      setOffers([]);
      setError(err instanceof Error ? err.message : "Unexpected error while searching flights.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <header className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
          <PlaneTakeoff className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">SkyLite</h1>
          <p className="text-xs text-slate-400">Live fares · Sydney → Bali and beyond</p>
        </div>
      </header>

      <SearchForm onSearch={handleSearch} isLoading={isLoading} />

      <FlightResults
        isLoading={isLoading}
        error={error}
        offers={offers}
        passengers={passengers}
        warning={warning}
        hasSearched={hasSearched}
      />

      <footer className="mt-12 text-center text-xs text-slate-400">
        Fares are indicative and may change at checkout. Powered by the Duffel API.
      </footer>
    </main>
  );
}
