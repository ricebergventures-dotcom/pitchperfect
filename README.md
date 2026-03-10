# PitchPerfect — AI-Powered Pitch Deck Analyzer

Present your startup pitch by voice and get VC-quality analysis powered by Google Gemini.

## User Flow

1. **Setup Screen** — Enter your name, email, company name, and pitch category
2. **Pitch Presentation** — Speak your pitch (3-second countdown, live waveform, transcript)
3. **AI Interview** — Answer 5 AI-generated follow-up questions read aloud by the browser
4. **Analysis & Email Report** — Receive a scored report in-app and via email

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Google Gemini 1.5 Pro
- **Speech**: Web Speech API (browser-native, Chrome/Edge)
- **Email**: Resend API
- **Styling**: Tailwind CSS v3
- **Animations**: Framer Motion

## Getting API Keys

### Google Gemini
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API Key" → "Create API key"
3. Copy the key

### Resend (Email)
1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys → Create API Key
3. Copy the key
4. Add and verify your domain in Resend → update the `from` address in `app/api/send-email/route.ts`

## Setup

1. Clone / download this project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your API keys in `.env.local`:
   ```
   GEMINI_API_KEY=your_gemini_key_here
   RESEND_API_KEY=your_resend_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in Chrome or Edge

## Production Deployment (Vercel)

```bash
npm install -g vercel
vercel --prod
```

Set `GEMINI_API_KEY` and `RESEND_API_KEY` as environment variables in the Vercel dashboard under **Settings → Environment Variables**.

## Project Structure

```
pitchperfect/
├── app/
│   ├── page.tsx                    # Setup screen
│   ├── pitch/page.tsx              # Pitch recording
│   ├── interview/page.tsx          # AI interview
│   ├── report/page.tsx             # Analysis results
│   ├── layout.tsx                  # Root layout with SessionProvider
│   ├── globals.css                 # Tailwind + custom scrollbar
│   └── api/
│       ├── generate-questions/     # POST: Gemini question generation
│       ├── analyze-pitch/          # POST: Gemini pitch analysis
│       └── send-email/             # POST: Resend email delivery
├── components/
│   ├── WaveformVisualizer.tsx      # Audio canvas visualizer
│   ├── TranscriptDisplay.tsx       # Live speech transcript
│   ├── QuestionCard.tsx            # Interview question UI
│   ├── ScoreCard.tsx               # Animated score bars
│   └── ReportPreview.tsx           # Collapsible report
├── lib/
│   ├── gemini.ts                   # Gemini API wrappers
│   ├── email-template.ts           # HTML email generator
│   ├── speech.ts                   # Web Speech API helpers
│   └── session-context.tsx         # React context / state
├── types/
│   └── speech.d.ts                 # Web Speech API type declarations
├── .env.local                      # API keys (not committed)
└── vercel.json                     # Vercel function timeout config
```

## Browser Requirements

- Chrome 25+ or Edge 79+ for Web Speech API
- Microphone permission required for voice input
- Text input fallback is available if speech is not supported
