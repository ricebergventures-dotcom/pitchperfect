import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateEmailHTML } from '@/lib/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { founderName, email, companyName, report, scores } = await req.json();
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = generateEmailHTML(founderName, companyName, report, scores, date);

    const { data, error } = await resend.emails.send({
      from: 'PitchPerfect <onboarding@resend.dev>',
      to: 'pitchdeckriceberg@gmail.com',
      subject: `PitchPerfect Analysis — ${companyName} (${founderName})`,
      html,
    });

    if (error) {
      // Log but don't fail — report is already shown on screen
      console.error('Resend error:', error);
      return NextResponse.json({ success: false, warning: 'Email could not be sent' });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Email error:', err);
    // Non-fatal — return success so report page doesn't crash
    return NextResponse.json({ success: false, warning: 'Email could not be sent' });
  }
}
