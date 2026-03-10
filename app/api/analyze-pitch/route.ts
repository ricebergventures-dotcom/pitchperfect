import { NextRequest, NextResponse } from 'next/server';
import { analyzePitch } from '@/lib/gemini';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { pitchTranscript, companyName, category, qaSession } = await req.json();
    const report = await analyzePitch(pitchTranscript, companyName, category, qaSession);
    return NextResponse.json({ report });
  } catch (err) {
    console.error('Error analyzing pitch:', err);
    return NextResponse.json({ error: 'Failed to analyze pitch' }, { status: 500 });
  }
}
