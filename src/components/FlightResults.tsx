"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, PlaneTakeoff } from "lucide-react";
import FlightCard from "./FlightCard";
import SkeletonCard from "./SkeletonCard";
import type { FlightOffer, PassengerCounts } from "@/types/flight";

interface FlightResultsProps {
  isLoading: boolean;
  error: string | null;
  offers: FlightOffer[];
  passengers: PassengerCounts;
  warning?: string;
  hasSearched: boolean;
}

export default function FlightResults({
  isLoading,
  error,
  offers,
  passengers,
  warning,
  hasSearched,
}: FlightResultsProps) {
  const [directOnly, setDirectOnly] = useState(false);
  const [highlightedOnly, setHighlightedOnly] = useState(false);

  const visibleOffers = useMemo(() => {
    return offers.filter((o) => (!directOnly || o.isDirect) && (!highlightedOnly || o.isHighlightedCarrier));
  }, [offers, directOnly, highlightedOnly]);

  if (isLoading) {
    return (
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">We couldn&apos;t load flights</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!hasSearched) {
    return null;
  }

  if (offers.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
        <PlaneTakeoff className="h-6 w-6" />
        <p>No flights found for that route and date. Try adjusting your search.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {warning && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {warning}
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={directOnly}
            onChange={(e) => setDirectOnly(e.target.checked)}
            className="accent-brand-600"
          />
          Direct flights only
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={highlightedOnly}
            onChange={(e) => setHighlightedOnly(e.target.checked)}
            className="accent-brand-600"
          />
          Virgin Australia / Qantas / Garuda only
        </label>
        <span className="ml-auto text-xs text-slate-400">
          {visibleOffers.length} of {offers.length} flight{offers.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3">
        {visibleOffers.map((offer) => (
          <FlightCard key={offer.id} offer={offer} passengers={passengers} />
        ))}
      </div>
    </div>
  );
}
