import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiPro = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function generateQuestions(
  pitchTranscript: string,
  companyName: string,
  category: string,
  deckSummary?: string
): Promise<string[]> {
  const deckContext = deckSummary
    ? `\n\nPITCH DECK ANALYSIS:\n${deckSummary}\n\nUse both the spoken pitch AND the deck analysis to craft highly specific questions. Reference actual details from the deck (metrics, team names, product features, market claims) where relevant.`
    : '';

  const prompt = `You are an experienced venture capitalist conducting a pitch interview.
The founder just gave this spoken pitch: ${pitchTranscript || '(no spoken pitch provided)'}
Company: ${companyName}, Category: ${category}${deckContext}

Generate exactly 5 incisive, highly specific follow-up questions tailored to THIS company's pitch. Do NOT ask generic questions — every question must reference specific details from what was said or shown. Cover:
1. Business model and monetization (probe a specific claim made)
2. Market size and competition (challenge a specific number or assumption)
3. Team and unfair advantages (dig into a specific person or credential mentioned)
4. Traction and metrics (push for specifics on a claim made)
5. Use of funds / next milestones (tie to specific goals mentioned)

Return ONLY valid JSON with no markdown: { "questions": ["q1", "q2", "q3", "q4", "q5"] }`;

  const result = await geminiPro.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return parsed.questions;
}

export async function analyzePitch(
  pitchTranscript: string,
  companyName: string,
  category: string,
  qaSession: { question: string; answer: string }[],
  deckSummary?: string
): Promise<string> {
  const qaText = qaSession
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
    .join('\n\n');

  const prompt = `You are a senior VC analyst. Analyze this startup pitch and Q&A session.

INITIAL PITCH: ${pitchTranscript}
COMPANY: ${companyName}
CATEGORY: ${category}${deckSummary ? `\n\nPITCH DECK ANALYSIS:\n${deckSummary}` : ''}

Q&A SESSION:
${qaText}

Generate a detailed investment analysis report with these sections:

# Executive Summary
(3-4 sentences)

# Problem & Solution
**Clarity Score: X/10**
(commentary)

# Market Opportunity
**Score: X/10**
(assessment)

# Business Model
**Score: X/10**
(strength assessment)

# Team
**Score: X/10**
(assessment)

# Traction & Validation
**Score: X/10**
(assessment)

# Key Risks
- Risk 1
- Risk 2
- Risk 3

# Investor Readiness Score
**Overall Score: XX/100**

# Top 3 Recommendations
1.
2.
3.

# VC Verdict
**[Pass / Watch / Interested]**
(2-sentence reasoning)

Format as clean markdown with the exact section headers shown above.`;

  const result = await geminiPro.generateContent(prompt);
  return result.response.text();
}
