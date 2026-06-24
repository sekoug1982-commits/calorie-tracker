# Calorie Tracker — Project Plan

## What We Built

A single-page calorie and macro tracking web app with AI-powered food recognition:

- **Three input methods**: Manual entry, AI text description, AI photo analysis (via Gemini)
- **Macro tracking**: Protein, carbs, and fat alongside calories
- **Daily dashboard**: SVG donut progress chart with color-coded thresholds, macro breakdown bars, meal-type summary grid
- **Weekly trend**: 7-day bar chart with goal reference line
- **Organized food log**: Entries grouped by meal type with filter pills
- **22 food presets**: Quick-add with full nutritional data (calories + macros)
- **Date navigation**: Previous/next day arrows with calendar picker
- **Local persistence**: SQLite database with auto-migration support

## What We Improved

### From Prototype to Professional
| Area | Before | After |
|------|--------|-------|
| Progress display | Flat orange bar | SVG donut with green/amber/orange/red thresholds |
| Nutrition data | Calories only | Calories + protein + carbs + fat |
| Food log | Flat list with dropdown filter | Grouped by meal type with pill filters |
| Typography | System font | Inter (Google Fonts) |
| Color system | Gray/orange | Slate/emerald with semantic color use |
| Loading state | "Loading..." text | Skeleton shimmer matching layout |
| Empty states | Plain text | Icon + description + call to action |
| Form feedback | None | "Added!" confirmation on submit |
| Mobile layout | Basic responsive | Purpose-built mobile views (2-col grids, scroll fades) |
| Presets | All 22 shown, calories only | Expandable grid, full macro data |
| Date navigation | Date input only | Prev/next arrows + "Today" shortcut |
| AI integration | Text + photo, calories only | Text + photo, full macros |
| Card design | Borders | Subtle shadows with rounded corners |
| Animations | None | Fade-in with stagger, progress ring animation |

## Future Roadmap

### High Priority
- **Editable calorie goal**: Let users set their own daily target with persistence
- **Macro targets**: Configurable protein/carbs/fat goals with progress indicators
- **Edit entries**: Modify existing entries instead of delete-and-recreate

### Medium Priority
- **Search presets**: Filter the 22 presets by name
- **Custom presets**: Save frequently eaten foods
- **Data export**: Download food log as CSV
- **Dark mode**: Full dark theme support

### Nice to Have
- **Onboarding**: First-visit tooltip walkthrough
- **Meal suggestions**: AI recommendations based on remaining macros
- **Multi-day view**: Compare nutrition across a date range
- **PWA support**: Install as a mobile app with offline capability
