'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  report: string;
}

function parseMarkdown(md: string): string {
  return md
    .replace(/^# (.*$)/gim, '<h1 style="font-size:20px;font-weight:800;color:#61D1DC;margin-top:28px;margin-bottom:10px;letter-spacing:-0.02em;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size:16px;font-weight:700;color:#B4E9E9;margin-top:20px;margin-bottom:8px;">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ffffff;font-weight:700;">$1</strong>')
    .replace(/^- (.*$)/gim, '<li style="margin:5px 0;color:rgba(255,255,255,0.7);padding-left:4px;">$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li style="margin:5px 0;color:rgba(255,255,255,0.7);"><span style="color:#61D1DC;font-weight:700;">$1.</span> $2</li>')
    .replace(/\n\n/g, '</p><p style="color:rgba(255,255,255,0.6);line-height:1.7;margin:8px 0;">')
    .replace(/^(?!<[hli])/gm, '<p style="color:rgba(255,255,255,0.6);line-height:1.7;margin:8px 0;">');
}

export function ReportPreview({ report }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d0d0d', border: '1px solid #1e1e1e' }}>
      <div
        className="p-5 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
        style={{ borderBottom: expanded ? '1px solid #1e1e1e' : 'none' }}
      >
        <h3 className="font-bold text-white text-sm tracking-wide">Full Analysis Report</h3>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-white/30" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/30" />
        )}
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-6 pb-6 pt-4"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(report) }}
        />
      )}
    </div>
  );
}
