"use client";

import { useState } from "react";
import { PlaneTakeoff, PlaneLanding, Calendar, ArrowLeftRight, Search } from "lucide-react";
import PassengerSelector from "./PassengerSelector";
import type { FlightSearchRequest, PassengerCounts } from "@/types/flight";

interface SearchFormProps {
  onSearch: (params: FlightSearchRequest) => void;
  isLoading: boolean;
}

const DEFAULT_ORIGIN = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "SYD";
const DEFAULT_DESTINATION = process.env.NEXT_PUBLIC_DEFAULT_DESTINATION || "DPS";

function todayPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN);
  const [destination, setDestination] = useState(DEFAULT_DESTINATION);
  const [departureDate, setDepartureDate] = useState(todayPlusDays(14));
  const [returnDate, setReturnDate] = useState(todayPlusDays(21));
  const [tripType, setTripType] = useState<"return" | "oneway">("return");
  const [passengers, setPassengers] = useState<PassengerCounts>({ adults: 1, children: 0, infants: 0 });

  function swapOriginDestination() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      returnDate: tripType === "return" ? returnDate : undefined,
      passengers,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm"
    >
      <div className="mb-4 flex gap-4 text-sm">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            checked={tripType === "return"}
            onChange={() => setTripType("return")}
            className="accent-brand-600"
          />
          Return
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            checked={tripType === "oneway"}
            onChange={() => setTripType("oneway")}
            className="accent-brand-600"
          />
          One-way
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        {/* Origin */}
        <div className="relative lg:col-span-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
          <div className="relative">
            <PlaneTakeoff className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase().slice(0, 3))}
              maxLength={3}
              required
              placeholder="SYD"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Swap button (visible on larger screens between the two airport fields) */}
        <button
          type="button"
          onClick={swapOriginDestination}
          aria-label="Swap origin and destination"
          className="hidden lg:flex h-9 w-9 items-center justify-center self-end justify-self-center rounded-full border border-slate-300 text-slate-500 hover:border-brand-500 hover:text-brand-600 lg:-mx-2 lg:mb-0.5"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>

        {/* Destination */}
        <div className="relative lg:col-span-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
          <div className="relative">
            <PlaneLanding className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase().slice(0, 3))}
              maxLength={3}
              required
              placeholder="DPS"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 lg:col-span-2">
          <div className="relative">
            <label className="block text-xs font-medium text-slate-500 mb-1">Depart</label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={departureDate}
                min={todayPlusDays(0)}
                onChange={(e) => setDepartureDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-slate-500 mb-1">Return</label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={returnDate}
                min={departureDate}
                disabled={tripType === "oneway"}
                onChange={(e) => setReturnDate(e.target.value)}
                required={tripType === "return"}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="lg:col-span-1">
          <PassengerSelector value={passengers} onChange={setPassengers} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Search className="h-4 w-4" />
        {isLoading ? "Searching flights…" : "Search flights"}
      </button>
    </form>
  );
}
