export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface FoodEntry {
  id: number;
  food_name: string;
  calories: number;
  meal_type: MealType;
  serving_size: string;
  date: string;
  created_at: string;
}

export interface FoodPreset {
  name: string;
  calories: number;
  serving_size: string;
}

export interface DailyTotal {
  date: string;
  total_calories: number;
}
