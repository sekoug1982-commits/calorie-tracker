# Decision Log — AI Food Analysis (2026-06-24)

## What Was Added

Two backend API routes that use Google's Gemini API (model: `gemini-2.5-flash-lite`) to analyze food from text descriptions or photos and return structured nutrition data.

### New files
- `src/lib/gemini.ts` — Shared Gemini client initialization, prompt templates, and response parser
- `src/app/api/analyze-food-text/route.ts` — POST endpoint for text-based food analysis
- `src/app/api/analyze-food-photo/route.ts` — POST endpoint for photo-based food analysis

### Modified files
- `src/types/index.ts` — Added `AIFoodAnalysis` interface
- `CLAUDE.md` — Documented new routes, tech stack addition, folder structure update

### New dependency
- `@google/generative-ai` — Google's official SDK for the Gemini API

## Technical Choices

### @google/generative-ai SDK over raw REST fetch
The SDK was chosen over calling the Gemini REST API directly with `fetch`. The raw approach requires manually constructing nested `contents[].parts[]` request bodies, handling base64 image encoding in `inline_data` objects, and extracting responses from `candidates[0].content.parts[0].text`. The SDK handles all of this with a typed `.generateContent()` method. The trade-off is one new dependency (~50KB, zero transitive deps), which is minimal for this codebase that already has 7 runtime dependencies.

### Analysis-only routes (no database writes)
Both routes return `AIFoodAnalysis` without touching the database. The intended flow is: AI analyzes → frontend displays results for user review/edit → user confirms → frontend POSTs to the existing `/api/entries` endpoint to save. This preserves user agency over what gets logged — AI calorie estimates are imprecise and users should be able to correct them before persisting.

### Shared gemini.ts module
The Gemini client, prompt templates, and response parser are in a single shared module (`src/lib/gemini.ts`) rather than duplicated across routes. This makes prompt tuning a single-file operation and keeps the route files focused on HTTP concerns.

### Defensive JSON parsing
LLM outputs are non-deterministic. The `parseAIResponse` function handles common failure modes:
- Strips markdown code fences (Gemini sometimes wraps JSON in ``` despite instructions)
- Validates each field type individually
- Throws on missing critical fields (food_name, calories)
- Falls back to sensible defaults for non-critical fields (meal_type → "Snack", serving_size → "1 serving", date → today)

### 4MB image size limit
Gemini supports up to 20MB inline, but 4MB covers typical mobile food photos (iPhone HEIC/JPEG are usually 2-4MB). This prevents accidental upload of oversized images without restricting normal use.

### .env.local for the API key
The existing `.env` file (containing only `DATABASE_URL`) is committed to git. `.env*.local` files are gitignored. The Gemini API key goes in `.env.local` to avoid accidental credential exposure. Next.js loads both files automatically with `.env.local` taking precedence. The `GEMINI_API_KEY` has no `NEXT_PUBLIC_` prefix since it's only used server-side.

## Error Handling Strategy

| Condition | HTTP Status | Rationale |
|-----------|-------------|-----------|
| Bad input (missing field, wrong type, too large) | 400 | Client error, fixable by the caller |
| Missing API key | 503 | Service unavailable until configured |
| Gemini API failure or unparseable response | 502 | Our server is a proxy to Gemini; 502 signals upstream failure |

## Response Shape

Both endpoints return the same `AIFoodAnalysis` shape on success:
```json
{
  "food_name": "Oatmeal with Blueberries and Honey",
  "calories": 350,
  "meal_type": "Breakfast",
  "serving_size": "1 bowl",
  "date": "2026-06-24"
}
```

This is intentionally identical to the payload that `POST /api/entries` accepts, making the frontend integration straightforward.
