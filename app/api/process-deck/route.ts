import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function POST(req: NextRequest) {
  let tmpPath: string | null = null;
  let uploadedFileName: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Write raw file to /tmp — avoids base64 body size issues
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'pdf';
    tmpPath = join(tmpdir(), `deck-${randomUUID()}.${ext}`);
    await writeFile(tmpPath, buffer);

    // Upload to Gemini File API (designed for larger files)
    const uploadResult = await fileManager.uploadFile(tmpPath, {
      mimeType: file.type,
      displayName: file.name,
    });
    uploadedFileName = uploadResult.file.name;

    // Wait for file to be ACTIVE (usually instant but required by API)
    let fileState = uploadResult.file;
    let attempts = 0;
    while (fileState.state === 'PROCESSING' && attempts < 10) {
      await new Promise((r) => setTimeout(r, 2000));
      fileState = await fileManager.getFile(uploadedFileName);
      attempts++;
    }

    if (fileState.state !== 'ACTIVE') {
      throw new Error(`File not ready: ${fileState.state}`);
    }

    // Analyze with Gemini using file URI
    const result = await model.generateContent([
      {
        fileData: {
          fileUri: fileState.uri,
          mimeType: file.type,
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
    return NextResponse.json({ deckSummary, fileName: file.name });
  } catch (err) {
    console.error('Deck processing error:', err);
    return NextResponse.json({ error: 'Failed to process deck' }, { status: 500 });
  } finally {
    if (tmpPath) {
      try { await unlink(tmpPath); } catch { /* ignore */ }
    }
    if (uploadedFileName) {
      try { await fileManager.deleteFile(uploadedFileName); } catch { /* ignore */ }
    }
  }
}
