"use client";

import { useState, useRef, useEffect } from "react";
import { Users, Minus, Plus } from "lucide-react";
import type { PassengerCounts } from "@/types/flight";

interface PassengerSelectorProps {
  value: PassengerCounts;
  onChange: (value: PassengerCounts) => void;
}

const ROWS: Array<{ key: keyof PassengerCounts; label: string; hint: string; min: number }> = [
  { key: "adults", label: "Adults", hint: "12+ years", min: 1 },
  { key: "children", label: "Children", hint: "2-11 years", min: 0 },
  { key: "infants", label: "Infants", hint: "Under 2, on lap", min: 0 },
];

export default function PassengerSelector({ value, onChange }: PassengerSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const total = value.adults + value.children + value.infants;

  function update(key: keyof PassengerCounts, delta: number) {
    const min = ROWS.find((r) => r.key === key)?.min ?? 0;
    const nextValue = Math.max(min, value[key] + delta);
    const next = { ...value, [key]: nextValue };
    // Infants can never exceed adults (one lap infant per adult).
    if (next.infants > next.adults) next.infants = next.adults;
    onChange(next);
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-medium text-slate-500 mb-1">Passengers</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm hover:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <Users className="h-4 w-4 text-slate-400 shrink-0" />
        <span>
          {total} passenger{total !== 1 ? "s" : ""}
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          {ROWS.map((row) => (
            <div key={row.key} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-slate-800">{row.label}</p>
                <p className="text-xs text-slate-400">{row.hint}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`Decrease ${row.label}`}
                  onClick={() => update(row.key, -1)}
                  disabled={value[row.key] <= row.min}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500 disabled:opacity-30 hover:border-brand-500 hover:text-brand-600"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-4 text-center text-sm font-medium">{value[row.key]}</span>
                <button
                  type="button"
                  aria-label={`Increase ${row.label}`}
                  onClick={() => update(row.key, 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:border-brand-500 hover:text-brand-600"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
