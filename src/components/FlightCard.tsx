"use client";

import { Plane, Clock, Luggage, BadgeCheck } from "lucide-react";
import type { FlightOffer, FlightSlice, PassengerCounts } from "@/types/flight";
import { airlineBadgeClasses } from "@/lib/airlines";

interface FlightCardProps {
  offer: FlightOffer;
  passengers: PassengerCounts;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function SliceRow({ slice, label }: { slice: FlightSlice; label: string }) {
  const first = slice.segments[0];
  const last = slice.segments[slice.segments.length - 1];

  return (
    <div>
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-lg font-semibold leading-none text-slate-900">{formatTime(first.departureTime)}</p>
          <p className="text-xs text-slate-400">{first.departureAirport}</p>
        </div>

        <div className="flex flex-1 flex-col items-center px-1">
          <span className="text-[11px] text-slate-400">{formatDuration(slice.durationMinutes)}</span>
          <div className="relative my-1 h-px w-full bg-slate-200">
            <Plane className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-90 text-slate-400" />
          </div>
          <span className="text-[11px] text-slate-400">
            {slice.stops === 0 ? "Direct" : `${slice.stops} stop${slice.stops > 1 ? "s" : ""}`}
          </span>
        </div>

        <div>
          <p className="text-lg font-semibold leading-none text-slate-900">{formatTime(last.arrivalTime)}</p>
          <p className="text-xs text-slate-400">{last.arrivalAirport}</p>
        </div>
      </div>
    </div>
  );
}

export default function FlightCard({ offer, passengers }: FlightCardProps) {
  const totalPassengers = passengers.adults + passengers.children + passengers.infants;
  const totalPrice = offer.baseFarePerPassenger * totalPassengers;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${airlineBadgeClasses(
              offer.airlineIata
            )}`}
          >
            {offer.airlineName}
          </span>
          {offer.isDirect && (
            <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              <BadgeCheck className="h-3 w-3" />
              Direct
            </span>
          )}
        </div>
        {offer.expiresAt && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            Price held briefly
          </span>
        )}
      </div>

      <div className={`mt-4 grid gap-4 ${offer.inbound ? "sm:grid-cols-2" : ""}`}>
        <SliceRow slice={offer.outbound} label="Outbound" />
        {offer.inbound && <SliceRow slice={offer.inbound} label="Return" />}
      </div>

      <div className="mt-4 flex items-center gap-1 text-xs text-slate-400">
        <Luggage className="h-3.5 w-3.5" />
        Carry-on included · checked bag fares vary by fare class
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs text-slate-400">
            {formatMoney(offer.baseFarePerPassenger, offer.currency)} × {totalPassengers} passenger
            {totalPassengers > 1 ? "s" : ""}
          </p>
          <p className="text-2xl font-bold text-slate-900">{formatMoney(totalPrice, offer.currency)}</p>
        </div>
        <button className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Select
        </button>
      </div>
    </div>
  );
}
