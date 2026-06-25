# Calorie Tracker

A single-page calorie and macro tracking web app. No accounts, no login — just open it and start logging meals.

## What It Does

- Log meals three ways: manual entry, AI text description, or food photo upload
- AI-powered: describe what you ate or snap a photo — Gemini identifies the food and pre-fills the form (including macros) for review before saving
- Pick from 22 common food presets with calorie and macro data to quickly pre-fill the form
- View a daily dashboard with a donut progress chart, macro breakdown (protein/carbs/fat), and meal-type summary
- Progress ring changes color: green (on track), amber (approaching goal), orange (near goal), red (over)
- See a weekly bar chart with a dashed goal reference line
- Filter the food log by meal type; entries are grouped by Breakfast/Lunch/Dinner/Snack
- Navigate between dates with prev/next arrows or the date picker
- Delete any entry with one click
- All data persists in a Neon PostgreSQL database

## How to Run

```bash
npm install
```

Set up the database (one-time):

1. Create a free Neon database at [neon.tech](https://neon.tech)
2. Copy the connection string and add it to `.env.local`:
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Push the schema to Neon:
   ```bash
   npm run db:push
   ```

Then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Framework | Next.js 16 (App Router)                      |
| Language  | TypeScript                                   |
| Styling   | Tailwind CSS 4                               |
| Font      | Inter (via next/font/google)                 |
| Database  | Neon PostgreSQL (@neondatabase/serverless)   |
| ORM       | Drizzle ORM                                  |
| Charts    | Recharts                                     |
| Dates     | date-fns                                     |
| AI        | OpenAI GPT-4o                                |

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx              Root layout (Inter font, metadata)
│   ├── page.tsx                Main dashboard with loading skeleton
│   ├── globals.css             Tailwind + custom animations
│   └── api/
│       ├── entries/
│       │   ├── route.ts        GET + POST (with macros)
│       │   └── [id]/route.ts   DELETE
│       ├── analyze-food-text/route.ts
│       └── analyze-food-photo/route.ts
├── components/
│   ├── daily-summary.tsx       Donut chart, macros, meal breakdown
│   ├── food-entry-card.tsx     Single entry row with macro display
│   ├── food-form.tsx           Meal form (Manual / Describe / Photo tabs)
│   ├── food-log.tsx            Grouped entry list with meal filters
│   ├── food-presets.tsx        Expandable quick-pick food grid
│   └── weekly-chart.tsx        7-day bar chart with goal line
├── db/
│   ├── index.ts                DB connection (Neon PostgreSQL)
│   ├── schema.ts               Drizzle schema (with macros)
│   └── seed.ts                 22 food presets with macro data
├── lib/
│   ├── openai.ts               OpenAI client, prompts, parser
│   └── utils.ts                Date formatting helpers
└── types/
    └── index.ts                TypeScript interfaces
```

## Database

Single table `food_entries` hosted on Neon PostgreSQL:

| Column       | Type    | Description                          |
|-------------|---------|--------------------------------------|
| id          | SERIAL  | Auto-increment primary key           |
| food_name   | TEXT    | Name of the food                     |
| calories    | INTEGER | Calorie count                        |
| protein     | INTEGER | Protein in grams                     |
| carbs       | INTEGER | Carbohydrates in grams               |
| fat         | INTEGER | Fat in grams                         |
| meal_type   | TEXT    | Breakfast, Lunch, Dinner, or Snack   |
| serving_size| TEXT    | e.g., "1 cup", "100g"               |
| date        | TEXT    | ISO date (YYYY-MM-DD)               |
| created_at  | TEXT    | ISO timestamp                        |

Schema is managed via Drizzle Kit. Run `npm run db:push` to sync schema changes to the database.

## API Routes

| Method | Path                     | Description                           |
|--------|--------------------------|---------------------------------------|
| GET    | /api/entries             | List entries (date, mealType, range)  |
| POST   | /api/entries             | Create entry (with macros)            |
| DELETE | /api/entries/[id]        | Delete an entry by ID                 |
| POST   | /api/analyze-food-text   | AI text analysis with macros          |
| POST   | /api/analyze-food-photo  | AI photo analysis with macros         |

## AI Food Analysis

Both text and photo analysis routes use OpenAI GPT-4o to return structured data including macros (protein, carbs, fat). The frontend displays results for user review before saving.

Requires `OPENAI_API_KEY` in `.env.local`. Returns 503 if missing.

## Environment Variables

| Variable       | Required | Description                          |
|---------------|----------|--------------------------------------|
| DATABASE_URL  | Yes      | Neon PostgreSQL connection string    |
| OPENAI_API_KEY| No       | OpenAI API key for AI features       |

## Calorie Goal

Default is 2,000 kcal/day. To change it, edit `CALORIE_GOAL` in `src/app/page.tsx`.

## Next Steps

- Editable calorie goal with persistence
- Editable macro targets (protein, carbs, fat goals)
- Edit existing entries (not just delete)
- Search/filter food presets
- Custom food presets (save your own)
- Data export (CSV)
- Dark mode
- Onboarding tooltip for first-time users
