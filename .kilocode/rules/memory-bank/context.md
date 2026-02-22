# Active Context: EggWatch Pro — Smart Incubator Dashboard

## Current State

**Project Status**: ✅ Smart Egg Incubator Dashboard — Fully Implemented

A full-featured real-time monitoring dashboard for ESP32-based smart egg incubators, built with Next.js 16, TypeScript, Tailwind CSS 4, Recharts, Lucide React, and date-fns.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Smart Egg Incubator Dashboard implementation
  - [x] Types/interfaces for incubator data (`src/types/incubator.ts`)
  - [x] Mock data generator and utilities (`src/lib/mockData.ts`)
  - [x] Incubator data store with polling (`src/lib/incubatorStore.ts`)
  - [x] Reusable UI components: Card, Badge
  - [x] Real-time monitoring: TemperatureCard, HumidityCard, MotorStatusCard
  - [x] Egg Turning Control Panel with schedule calculator
  - [x] Data Logs Table with auto-refresh
  - [x] Charts with temperature/humidity lines + egg turn markers (Recharts)
  - [x] Alerts Panel with configurable thresholds
  - [x] Full History Panel with search, filters, pagination, CSV export
  - [x] Connection Status header with demo/live toggle
  - [x] Dark mode UI, card-based responsive layout

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Dashboard entry point | ✅ Ready |
| `src/app/layout.tsx` | Root layout (dark mode) | ✅ Ready |
| `src/app/globals.css` | Global styles + scrollbar | ✅ Ready |
| `src/types/incubator.ts` | TypeScript types | ✅ Ready |
| `src/lib/mockData.ts` | Mock data + CSV export | ✅ Ready |
| `src/lib/incubatorStore.ts` | State management hook | ✅ Ready |
| `src/components/ui/` | Card, Badge components | ✅ Ready |
| `src/components/dashboard/` | All dashboard components | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## ESP32 Integration

Set `NEXT_PUBLIC_ESP32_API_URL` env var to your ESP32 IP address. Toggle "Demo Mode" off in the header to use live data.

Expected ESP32 API endpoints:
- `GET /api/status` — current readings
- `GET /api/logs?limit=20` — recent logs
- `POST /api/schedule` — update turning schedule

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-02-22 | Added `arduino/eggwatch_esp32.ino` — complete ESP32 firmware for AHT30 + DS3231, serves `/api/status`, `/api/logs`, `/api/schedule` with CORS headers matching dashboard expectations. Added `.env.local` template for ESP32 IP configuration. |
