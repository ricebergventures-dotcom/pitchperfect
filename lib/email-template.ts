export function generateEmailHTML(
  founderName: string,
  companyName: string,
  report: string,
  scores: {
    problemSolution: number;
    marketOpportunity: number;
    businessModel: number;
    team: number;
    traction: number;
    overall: number;
  },
  date: string
): string {
  const markdownToHTML = (md: string) => {
    return md
      .replace(/^# (.*$)/gim, '<h1 style="color:#a855f7;font-size:24px;margin-top:32px;margin-bottom:8px;">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 style="color:#7c3aed;font-size:20px;margin-top:24px;margin-bottom:8px;">$1</h2>')
      .replace(/^\*\*(.*?)\*\*/gim, '<strong style="color:#c084fc;">$1</strong>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/^- (.*$)/gim, '<li style="margin:4px 0;">$1</li>')
      .replace(/\n\n/g, '</p><p style="margin:8px 0;">')
      .replace(/^(\d+)\. (.*$)/gim, '<li style="margin:4px 0;"><strong>$1.</strong> $2</li>');
  };

  const scoreCard = (label: string, score: number) => `
    <div style="display:inline-block;background:#1e1b4b;border:1px solid #4c1d95;border-radius:8px;padding:16px;margin:8px;text-align:center;min-width:120px;">
      <div style="color:#a855f7;font-size:28px;font-weight:bold;">${score}</div>
      <div style="color:#9ca3af;font-size:12px;margin-top:4px;">${label}</div>
    </div>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PitchPerfect Analysis — ${companyName}</title>
</head>
<body style="background:#0f0a1e;color:#e5e7eb;font-family:'Segoe UI',sans-serif;margin:0;padding:0;">
  <div style="max-width:700px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:40px;padding:40px;background:linear-gradient(135deg,#1e1b4b,#4c1d95);border-radius:16px;">
      <h1 style="font-size:36px;font-weight:bold;margin:0;background:linear-gradient(to right,#a855f7,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">PitchPerfect</h1>
      <p style="color:#c084fc;margin:8px 0 0;">AI-Powered Pitch Analysis</p>
      <h2 style="color:#e5e7eb;margin:24px 0 0;font-size:24px;">${companyName}</h2>
      <p style="color:#9ca3af;margin:4px 0 0;">Pitch Analysis for ${founderName}</p>
    </div>

    <!-- Scorecard -->
    <div style="background:#111827;border:1px solid #374151;border-radius:12px;padding:32px;margin-bottom:32px;text-align:center;">
      <h2 style="color:#a855f7;margin:0 0 8px;font-size:20px;">Overall Investor Readiness</h2>
      <div style="font-size:72px;font-weight:bold;background:linear-gradient(to right,#a855f7,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${scores.overall}</div>
      <div style="color:#9ca3af;font-size:16px;">out of 100</div>

      <div style="margin-top:24px;">
        ${scoreCard('Problem & Solution', scores.problemSolution * 10)}
        ${scoreCard('Market Opportunity', scores.marketOpportunity * 10)}
        ${scoreCard('Business Model', scores.businessModel * 10)}
        ${scoreCard('Team', scores.team * 10)}
        ${scoreCard('Traction', scores.traction * 10)}
      </div>
    </div>

    <!-- Full Report -->
    <div style="background:#111827;border:1px solid #374151;border-radius:12px;padding:32px;margin-bottom:32px;line-height:1.7;">
      <h2 style="color:#a855f7;margin:0 0 24px;font-size:20px;">Full Analysis Report</h2>
      <div style="color:#d1d5db;">${markdownToHTML(report)}</div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;color:#6b7280;font-size:14px;padding:24px;">
      <p>Analyzed on ${date} by PitchPerfect AI</p>
      <p style="margin-top:8px;">Powered by Google Gemini</p>
    </div>
  </div>
</body>
</html>`;
}
