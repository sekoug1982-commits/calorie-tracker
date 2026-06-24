import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const foodEntries = sqliteTable('food_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  food_name: text('food_name').notNull(),
  calories: integer('calories').notNull(),
  meal_type: text('meal_type').notNull(),
  serving_size: text('serving_size').notNull(),
  date: text('date').notNull(),
  created_at: text('created_at').notNull(),
});
