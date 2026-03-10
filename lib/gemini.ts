import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiPro = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export async function generateQuestions(
  pitchTranscript: string,
  companyName: string,
  category: string
): Promise<string[]> {
  const prompt = `You are an experienced venture capitalist conducting a pitch interview.
The founder just gave this pitch: ${pitchTranscript}
Company: ${companyName}, Category: ${category}
Generate exactly 5 incisive follow-up questions to probe deeper into:
1. Business model and monetization
2. Market size and competition
3. Team and unfair advantages
4. Traction and metrics
5. Use of funds / next milestones

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
  qaSession: { question: string; answer: string }[]
): Promise<string> {
  const qaText = qaSession
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
    .join('\n\n');

  const prompt = `You are a senior VC analyst. Analyze this startup pitch and Q&A session.

INITIAL PITCH: ${pitchTranscript}
COMPANY: ${companyName}
CATEGORY: ${category}

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
