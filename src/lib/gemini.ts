import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIFoodAnalysis, MealType } from '@/types';

const VALID_MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
}

export const TEXT_ANALYSIS_PROMPT = `You are a nutrition analysis assistant for a calorie tracking app.

Analyze the following food description and extract structured data.

Rules:
- Return ONLY valid JSON, no markdown, no code fences, no explanation.
- Use exactly these field names: food_name, calories, protein, carbs, fat, meal_type, serving_size, date
- meal_type must be exactly one of: "Breakfast", "Lunch", "Dinner", "Snack"
- calories must be a positive integer (your best estimate for the described portion)
- protein, carbs, fat must be positive integers representing grams
- serving_size should be a human-readable quantity like "1 cup", "100g", "1 medium", "2 slices"
- food_name should be a concise, common name for the food
- If the description mentions a date, use it in YYYY-MM-DD format
- If no date is mentioned, use: {todayDate}
- If meal type can be inferred from context (e.g., "breakfast cereal", "midnight snack"), use it; otherwise default to "Snack"

Food description: {description}`;

export const PHOTO_ANALYSIS_PROMPT = `You are a nutrition analysis assistant for a calorie tracking app.

Look at this food image and identify what food is shown. Extract structured data.

Rules:
- Return ONLY valid JSON, no markdown, no code fences, no explanation.
- Use exactly these field names: food_name, calories, protein, carbs, fat, meal_type, serving_size, date
- meal_type must be exactly one of: "Breakfast", "Lunch", "Dinner", "Snack"
- calories must be a positive integer (your best estimate based on the visible portion size)
- protein, carbs, fat must be positive integers representing grams
- serving_size should describe the visible portion like "1 plate", "1 bowl", "1 cup", "1 piece"
- food_name should be a concise, common name for the food you see
- Use today's date: {todayDate}
- If the food suggests a specific meal type (e.g., pancakes suggest Breakfast, a full plate of rice and meat suggests Lunch or Dinner), infer it; otherwise default to "Snack"
- If multiple food items are visible, name the primary/largest item as food_name and estimate total combined calories

Analyze the image now.`;

export function parseAIResponse(rawText: string, fallbackDate: string): AIFoodAnalysis {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned invalid JSON');
  }

  const obj = parsed as Record<string, unknown>;

  const food_name = typeof obj.food_name === 'string' && obj.food_name.length > 0
    ? obj.food_name
    : null;
  if (!food_name) throw new Error('AI response missing food_name');

  const calories = typeof obj.calories === 'number' && obj.calories > 0
    ? Math.round(obj.calories)
    : null;
  if (!calories) throw new Error('AI response missing valid calories');

  const protein = typeof obj.protein === 'number' ? Math.max(0, Math.round(obj.protein)) : 0;
  const carbs = typeof obj.carbs === 'number' ? Math.max(0, Math.round(obj.carbs)) : 0;
  const fat = typeof obj.fat === 'number' ? Math.max(0, Math.round(obj.fat)) : 0;

  const meal_type = VALID_MEAL_TYPES.includes(obj.meal_type as MealType)
    ? (obj.meal_type as MealType)
    : 'Snack';

  const serving_size = typeof obj.serving_size === 'string' && obj.serving_size.length > 0
    ? obj.serving_size
    : '1 serving';

  const date = typeof obj.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.date)
    ? obj.date
    : fallbackDate;

  return { food_name, calories, protein, carbs, fat, meal_type, serving_size, date };
}
