import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { pitchTranscript, companyName, category } = await req.json();

    if (!pitchTranscript) {
      return NextResponse.json({ error: 'No pitch transcript provided' }, { status: 400 });
    }

    const questions = await generateQuestions(pitchTranscript, companyName, category);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error('Error generating questions:', err);
    return NextResponse.json(
      {
        error: 'Failed to generate questions',
        questions: [
          'Can you walk me through your business model and how you plan to monetize?',
          'What is the total addressable market and who are your main competitors?',
          "What is your team's unique unfair advantage in this space?",
          'What traction or early metrics can you share to validate demand?',
          'How will you use the funds you are raising and what milestones will it unlock?',
        ],
      },
      { status: 200 }
    );
  }
}
