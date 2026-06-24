# Calorie Tracker

A single-page calorie tracking web app. No accounts, no login — just open it and start logging meals.

## What It Does

- Log meals with food name, calories, meal type, serving size, and date
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

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx              Root layout
│   ├── page.tsx                Main dashboard (client component)
│   ├── globals.css             Tailwind directives
│   └── api/
│       └── entries/
│           ├── route.ts        GET + POST endpoints
│           └── [id]/
│               └── route.ts    DELETE endpoint
├── components/
│   ├── daily-summary.tsx       Calorie total, progress bar, meal breakdown
│   ├── food-entry-card.tsx     Single entry row with delete button
│   ├── food-form.tsx           Meal logging form
│   ├── food-log.tsx            Scrollable entry list with meal filter
│   ├── food-presets.tsx        Quick-pick food grid
│   └── weekly-chart.tsx        7-day bar chart
├── db/
│   ├── index.ts                Database connection + auto-create table
│   ├── schema.ts               Drizzle schema (food_entries table)
│   └── seed.ts                 22 food presets with calorie data
├── lib/
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

| Method | Path               | Description              |
|--------|--------------------|--------------------------|
| GET    | /api/entries       | List entries (filter by date, mealType, range=week) |
| POST   | /api/entries       | Create a new entry       |
| DELETE | /api/entries/[id]  | Delete an entry by ID    |

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
