# Decision Log — Initial Build (2026-06-24)

## What Was Built

A complete single-page calorie tracker web app with:

- Meal logging form with food name, calories, meal type, serving size, and date
- 22 food presets for quick entry (Apple, Chicken Breast, Rice, etc.)
- Daily summary dashboard with calorie total, progress bar, and meal-type breakdown
- Weekly bar chart showing calories per day for the past 7 days
- Food log with meal-type filtering
- Date navigation via date picker
- Delete functionality for entries
- Persistent SQLite storage

## Technical Choices

### Next.js App Router over Pages Router
The App Router is the current standard for new Next.js projects. Server-side API routes handle database access cleanly without exposing SQLite to the client.

### better-sqlite3 + Drizzle ORM over Prisma
- **better-sqlite3**: Synchronous API, zero external dependencies, no migration daemon. Perfect for a local-first app that just needs a file-based database.
- **Drizzle ORM**: Lightweight, type-safe query builder. Chosen over Prisma for its smaller footprint and simpler setup — no `prisma generate` step, no binary downloads.

### Recharts over Chart.js
Recharts is built as React components, making it trivial to integrate without a ref-based wrapper. For a simple bar chart, its declarative API is more natural in a React codebase.

### Tailwind CSS 4 over styled-components or CSS Modules
Utility-first CSS keeps styling co-located with markup. No additional build configuration needed — Next.js has built-in Tailwind support.

### date-fns over Moment.js or dayjs
Tree-shakeable, so only the functions used are bundled. Moment.js is deprecated; date-fns is the modern standard.

### Hardcoded presets over a database table
The 22 food presets are a static array in `src/db/seed.ts`. This avoids needing a second table, a seeding step, or migration complexity. If presets need to be user-editable in the future, they can be moved to a database table then.

### Single table schema
One `food_entries` table handles everything. No separate `users`, `goals`, or `foods` tables — the app has no auth and the calorie goal is a constant. This keeps the data model minimal and the codebase simple.

### Client-side filtering
The meal-type filter in the food log operates client-side on already-fetched data rather than making a new API call. Since daily entries are small in number, this is faster and avoids unnecessary network requests.

## Architecture Decisions

### All state in page.tsx
The main page component manages all state (entries, weekly data, filters, prefill). Components are stateless/presentational where possible. This keeps data flow simple and avoids prop-drilling or a state management library for an app this size.

### API routes for all data mutations
Even though this is a local app, all database operations go through `/api/entries` routes. This separates the database layer (server-only) from the UI (client), keeps `better-sqlite3` out of the browser bundle, and makes the app easy to extend with remote storage later.

### Auto-create table on import
The database module (`src/db/index.ts`) runs `CREATE TABLE IF NOT EXISTS` on import. No migration step needed — the app is ready to use immediately after `npm run dev`.

## File Count
- 14 source files
- 22 food presets
- 3 API endpoints (GET, POST, DELETE)
- 6 UI components
