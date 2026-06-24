# Calorie Tracker

A single-page calorie tracking web app. No accounts, no login — just open it and start logging meals.

## What It Does

- Log meals three ways: manual entry, AI text description, or food photo upload
- AI-powered: describe what you ate in plain English or snap a photo — Gemini identifies the food and pre-fills the form for review before saving
- Pick from 22 common food presets to quickly pre-fill the form
- View a daily dashboard with total calories, a progress bar toward a 2,000 kcal goal, and a breakdown by meal type (Breakfast / Lunch / Dinner / Snack)
- See a weekly bar chart showing total calories per day for the past 7 days
- Filter the food log by meal type
- Navigate between dates with the date picker
- Delete any entry with one click
- All data persists in a local SQLite database

## How to Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Framework | Next.js 16 (App Router)           |
| Language  | TypeScript                        |
| Styling   | Tailwind CSS 4                    |
| Database  | SQLite via better-sqlite3         |
| ORM       | Drizzle ORM                       |
| Charts    | Recharts                          |
| Dates     | date-fns                          |
| AI        | Google Gemini (gemini-2.5-flash-lite) via @google/generative-ai |

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx              Root layout
│   ├── page.tsx                Main dashboard (client component)
│   ├── globals.css             Tailwind directives
│   └── api/
│       ├── entries/
│       │   ├── route.ts        GET + POST endpoints
│       │   └── [id]/
│       │       └── route.ts    DELETE endpoint
│       ├── analyze-food-text/
│       │   └── route.ts        AI text-based food analysis
│       └── analyze-food-photo/
│           └── route.ts        AI photo-based food analysis
├── components/
│   ├── daily-summary.tsx       Calorie total, progress bar, meal breakdown
│   ├── food-entry-card.tsx     Single entry row with delete button
│   ├── food-form.tsx           Meal logging form (Manual / AI Text / Photo tabs)
│   ├── food-log.tsx            Scrollable entry list with meal filter
│   ├── food-presets.tsx        Quick-pick food grid
│   └── weekly-chart.tsx        7-day bar chart
├── db/
│   ├── index.ts                Database connection + auto-create table
│   ├── schema.ts               Drizzle schema (food_entries table)
│   └── seed.ts                 22 food presets with calorie data
├── lib/
│   ├── gemini.ts               Gemini AI client, prompts, response parser
│   └── utils.ts                Date formatting helpers
└── types/
    └── index.ts                TypeScript interfaces
```

## Database

Single table `food_entries` stored in `data/tracker.db`:

| Column       | Type    | Description                          |
|-------------|---------|--------------------------------------|
| id          | INTEGER | Auto-increment primary key           |
| food_name   | TEXT    | Name of the food                     |
| calories    | INTEGER | Calorie count                        |
| meal_type   | TEXT    | Breakfast, Lunch, Dinner, or Snack   |
| serving_size| TEXT    | e.g., "1 cup", "100g"               |
| date        | TEXT    | ISO date (YYYY-MM-DD)               |
| created_at  | TEXT    | ISO timestamp                        |

The database file is created automatically on first run. It's gitignored.

## API Routes

| Method | Path                  | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/entries          | List entries (filter by date, mealType, range=week) |
| POST   | /api/entries          | Create a new entry       |
| DELETE | /api/entries/[id]     | Delete an entry by ID    |
| POST   | /api/analyze-food-text  | AI-analyze a text description → structured food data |
| POST   | /api/analyze-food-photo | AI-analyze a food photo → structured food data |

## AI Food Analysis

Two API routes use Gemini (`gemini-2.5-flash-lite`) to analyze food from text or photos. Both return structured data matching the `POST /api/entries` payload shape — the frontend can display results for user review before saving.

**Text analysis** (`POST /api/analyze-food-text`):
- Body: `{ "description": "I had oatmeal with blueberries for breakfast" }`
- Returns: `{ food_name, calories, meal_type, serving_size, date }`

**Photo analysis** (`POST /api/analyze-food-photo`):
- Body: multipart form data with `image` field (JPEG, PNG, WebP, or HEIC, max 4MB)
- Returns: same shape as text analysis

Requires `GEMINI_API_KEY` in `.env.local` (gitignored). Returns 503 if the key is missing.

### Frontend Integration

The "Log a Meal" form has three tabs:

1. **Manual** — traditional form with food name, calories, meal type, serving size
2. **Describe** — textarea for natural language input (e.g., "I had a burger and fries for lunch"); hits `/api/analyze-food-text` and pre-fills the form
3. **Photo** — file upload with image preview; hits `/api/analyze-food-photo` and pre-fills the form

After AI analysis, all fields are editable before saving. A loading spinner shows during AI requests, and errors display as a friendly banner (e.g., "Couldn't identify the food — try describing it instead").

## Calorie Goal

Default is 2,000 kcal/day. To change it, edit the `CALORIE_GOAL` constant in `src/app/page.tsx`.

## What's Coming Next

- Editable calorie goal with persistence
- Edit existing entries (not just delete)
- Search/filter food presets
- Custom food presets (save your own)
- Nutrition info beyond calories (protein, carbs, fat)
- Data export (CSV)
- Dark mode
