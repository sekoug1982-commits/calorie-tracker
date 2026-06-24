import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { foodEntries } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const mealType = searchParams.get('mealType');
  const range = searchParams.get('range');

  if (range === 'week' && date) {
    const endDate = date;
    const start = new Date(date + 'T00:00:00');
    start.setDate(start.getDate() - 6);
    const startDate = start.toISOString().split('T')[0];

    const entries = await db
      .select()
      .from(foodEntries)
      .where(and(gte(foodEntries.date, startDate), lte(foodEntries.date, endDate)))
      .orderBy(desc(foodEntries.created_at));

    return NextResponse.json(entries);
  }

  const conditions = [];
  if (date) conditions.push(eq(foodEntries.date, date));
  if (mealType && mealType !== 'All') conditions.push(eq(foodEntries.meal_type, mealType));

  const entries = await db
    .select()
    .from(foodEntries)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(foodEntries.created_at));

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { food_name, calories, protein, carbs, fat, meal_type, serving_size, date } = body;

  if (!food_name || !calories || !meal_type || !serving_size || !date) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const entry = await db
    .insert(foodEntries)
    .values({
      food_name,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      meal_type,
      serving_size,
      date,
      created_at: new Date().toISOString(),
    })
    .returning();

  return NextResponse.json(entry[0], { status: 201 });
}
