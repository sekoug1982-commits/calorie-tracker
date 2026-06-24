import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { foodEntries } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);

  if (isNaN(numId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  await db.delete(foodEntries).where(eq(foodEntries.id, numId));

  return NextResponse.json({ success: true });
}
