import type { Metadata } from 'next';
import { Inter, Raleway } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/lib/session-context';

const raleway = Raleway({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PitchPerfect — AI-Powered Pitch Analyzer',
  description: 'Present your startup pitch and get VC-quality analysis powered by AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${raleway.className} ${inter.variable} bg-black text-white min-h-screen`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
