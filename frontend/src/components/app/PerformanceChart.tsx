'use client';

import React, { useRef, useEffect } from 'react';

interface PerformanceChartProps {
  equityCurve?: number[];
  initialEquity?: number;
}

export default function PerformanceChart({
  equityCurve = [1000000, 1002000, 1001500, 1006000, 1004500, 1008000, 1012000, 1010000, 1015000],
  initialEquity = 1000000
}: PerformanceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !equityCurve || equityCurve.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : 600;
    const height = parent ? parent.clientHeight : 240;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const margin = { top: 20, right: 20, bottom: 25, left: 20 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const minVal = Math.min(...equityCurve, initialEquity) * 0.998;
    const maxVal = Math.max(...equityCurve, initialEquity) * 1.002;
    const range = maxVal - minVal || 1;

    const getX = (idx: number) => margin.left + (idx / (equityCurve.length - 1)) * chartWidth;
    const getY = (val: number) => margin.top + chartHeight - ((val - minVal) / range) * chartHeight;

    // Draw baseline
    const baseY = getY(initialEquity);
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(margin.left, baseY);
    ctx.lineTo(width - margin.right, baseY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Gradient fill under curve
    const gradient = ctx.createLinearGradient(0, margin.top, 0, height - margin.bottom);
    gradient.addColorStop(0, '#10b98133');
    gradient.addColorStop(1, '#10b98100');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(getX(0), height - margin.bottom);
    equityCurve.forEach((val, i) => {
      ctx.lineTo(getX(i), getY(val));
    });
    ctx.lineTo(getX(equityCurve.length - 1), height - margin.bottom);
    ctx.closePath();
    ctx.fill();

    // Draw equity line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    equityCurve.forEach((val, i) => {
      const x = getX(i);
      const y = getY(val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [equityCurve, initialEquity]);

  return (
    <div className="w-full h-full min-h-[220px] relative select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
