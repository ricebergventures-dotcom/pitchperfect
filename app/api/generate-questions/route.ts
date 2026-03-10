import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { pitchTranscript, companyName, category, deckSummary } = await req.json();

    const questions = await generateQuestions(pitchTranscript, companyName, category, deckSummary);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error('Error generating questions:', err);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
