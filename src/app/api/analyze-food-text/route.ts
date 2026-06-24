import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, TEXT_ANALYSIS_PROMPT, parseAIResponse } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  let body: { description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { description } = body;
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return NextResponse.json(
      { error: 'description is required and must be a non-empty string' },
      { status: 400 },
    );
  }
  if (description.length > 1000) {
    return NextResponse.json(
      { error: 'description must be 1000 characters or fewer' },
      { status: 400 },
    );
  }

  let model;
  try {
    model = getGeminiModel();
  } catch {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
  }

  const todayDate = new Date().toISOString().split('T')[0];
  const prompt = TEXT_ANALYSIS_PROMPT
    .replace('{todayDate}', todayDate)
    .replace('{description}', description.trim());

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const analysis = parseAIResponse(rawText, todayDate);
    return NextResponse.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('AI returned invalid JSON') || message.includes('AI response missing')) {
      return NextResponse.json(
        { error: 'AI returned an unrecognizable response. Please try again.' },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: `AI analysis failed: ${message}` },
      { status: 502 },
    );
  }
}
