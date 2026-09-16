# SkyLite

A lightweight, Skyscanner-style flight search app built with Next.js, TypeScript,
and Tailwind CSS. Defaults to Sydney (SYD) → Denpasar, Bali (DPS), and highlights
the three carriers that fly that route direct: Virgin Australia, Qantas, and
Garuda Indonesia. Real-time pricing comes from the [Duffel API](https://duffel.com).

## Getting started

```bash
npm install
cp .env.local.example .env.local
# then edit .env.local and add your Duffel API key
npm run dev
```

Open http://localhost:3000. Without a `DUFFEL_API_KEY` set, the app falls back
to realistic sample data so the UI is fully demoable out of the box.

## Project structure

```
skyscanner-lite/
├── src/
│   ├── app/
│   │   ├── api/flights/route.ts   # Server-side Duffel integration (API key never reaches the client)
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Main search + results dashboard
│   │   └── globals.css
│   ├── components/
│   │   ├── SearchForm.tsx
│   │   ├── PassengerSelector.tsx
│   │   ├── FlightResults.tsx
│   │   ├── FlightCard.tsx
│   │   └── SkeletonCard.tsx
│   ├── lib/
│   │   ├── duffel.ts                # Duffel SDK wrapper + response mapping
│   │   ├── mockFlights.ts           # Fallback sample data
│   │   └── airlines.ts              # Highlighted-carrier logic
│   └── types/flight.ts
├── .env.local.example
└── package.json
```

## Deploying

See the "GitHub & Deployment" section in the project write-up for step-by-step
instructions to push this to GitHub and deploy it on Vercel.
