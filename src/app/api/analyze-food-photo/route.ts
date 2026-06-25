import { NextRequest, NextResponse } from 'next/server';
import { analyzePhoto, getOpenAIClient } from '@/lib/openai';

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Invalid form data. Send multipart/form-data with an "image" field.' },
      { status: 400 },
    );
  }

  const file = formData.get('image');
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'image field is required and must be a file' },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported image type: ${file.type}. Accepted: JPEG, PNG, WebP, HEIC` },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 4MB.` },
      { status: 400 },
    );
  }

  try {
    getOpenAIClient();
  } catch {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString('base64');
  const todayDate = new Date().toISOString().split('T')[0];

  try {
    const analysis = await analyzePhoto(base64Data, file.type, todayDate);
    return NextResponse.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('AI returned invalid JSON') || message.includes('AI response missing')) {
      return NextResponse.json(
        { error: 'AI could not recognize the food in the image. Please try a clearer photo.' },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: `AI analysis failed: ${message}` },
      { status: 502 },
    );
  }
}
