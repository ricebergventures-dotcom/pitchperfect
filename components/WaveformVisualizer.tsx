'use client';

import { useEffect, useRef } from 'react';

interface Props {
  isActive: boolean;
  color?: string;
}

export function WaveformVisualizer({ isActive, color = '#61D1DC' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | undefined>(undefined);
  const contextRef = useRef<AudioContext | undefined>(undefined);

  useEffect(() => {
    if (!isActive) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      drawIdle();
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        contextRef.current = audioCtx;
        analyserRef.current = analyser;

        draw();
      })
      .catch(console.error);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      contextRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const drawIdle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barCount = 32;
    const barWidth = canvas.width / barCount - 2;
    ctx.fillStyle = `${color}40`;
    for (let i = 0; i < barCount; i++) {
      const height = 4;
      const x = i * (barWidth + 2);
      const y = (canvas.height - height) / 2;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, height, 2);
      ctx.fill();
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 32;
      const barWidth = canvas.width / barCount - 2;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] / 255;
        const height = Math.max(4, value * canvas.height * 0.9);
        const x = i * (barWidth + 2);
        const y = (canvas.height - height) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, '#B4E9E9');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 3);
        ctx.fill();
      }
    };

    animate();
  };

  return (
    <canvas ref={canvasRef} width={300} height={80} className="w-full max-w-sm" />
  );
}
