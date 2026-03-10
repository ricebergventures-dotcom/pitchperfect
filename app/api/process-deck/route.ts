import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function POST(req: NextRequest) {
  try {
    const { fileBase64, mimeType, fileName } = await req.json();

    if (!fileBase64 || !mimeType) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const result = await model.generateContent([
      {
        inlineData: {
          data: fileBase64,
          mimeType,
        },
      },
      `You are a venture capital analyst. Carefully read this pitch deck and extract the following information in a structured way:

1. Company name and one-line description
2. Problem being solved
3. Solution / product description
4. Business model and monetization approach
5. Target market and market size claims
6. Traction, metrics, or customer evidence mentioned
7. Team members and their backgrounds
8. Funding ask and use of funds
9. Key competitive advantages or differentiators
10. Any notable risks or gaps visible in the deck

Be specific and quote or reference actual content from the deck. This summary will be used to generate targeted interview questions.`,
    ]);

    const deckSummary = result.response.text();
    return NextResponse.json({ deckSummary, fileName });
  } catch (err) {
    console.error('Deck processing error:', err);
    return NextResponse.json({ error: 'Failed to process deck' }, { status: 500 });
  }
}
