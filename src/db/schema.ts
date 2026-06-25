import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const foodEntries = pgTable('food_entries', {
  id: serial('id').primaryKey(),
  food_name: text('food_name').notNull(),
  calories: integer('calories').notNull(),
  protein: integer('protein').notNull().default(0),
  carbs: integer('carbs').notNull().default(0),
  fat: integer('fat').notNull().default(0),
  meal_type: text('meal_type').notNull(),
  serving_size: text('serving_size').notNull(),
  date: text('date').notNull(),
  created_at: text('created_at').notNull(),
});
