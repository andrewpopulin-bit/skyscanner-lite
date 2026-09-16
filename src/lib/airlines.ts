// The three carriers that actually fly SYD <-> DPS direct.
// Used to badge/highlight results and to power the mock-data fallback.

export const HIGHLIGHTED_CARRIERS: Record<string, string> = {
  VA: "Virgin Australia",
  QF: "Qantas",
  GA: "Garuda Indonesia",
};

export function isHighlightedCarrier(iataCode: string): boolean {
  return iataCode.toUpperCase() in HIGHLIGHTED_CARRIERS;
}

export function airlineBadgeClasses(iataCode: string): string {
  switch (iataCode.toUpperCase()) {
    case "VA":
      return "bg-red-50 text-red-700 border-red-200";
    case "QF":
      return "bg-red-50 text-red-800 border-red-300";
    case "GA":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}
