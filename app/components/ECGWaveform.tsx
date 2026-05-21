'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ECGWaveformProps {
  heartRate: number;
}

export default function ECGWaveform({ heartRate }: ECGWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;
    
    let x = 0;
    const speed = 2;
    const ecgData: number[] = [];
    
    // Generate ECG waveform pattern (P-QRS-T complex)
    const generateECGPoint = (phase: number): number => {
      const normalizedPhase = phase % 360;
      
      // P wave (60-80)
      if (normalizedPhase >= 60 && normalizedPhase < 80) {
        return 15 * Math.sin(((normalizedPhase - 60) / 20) * Math.PI);
      }
      
      // PR segment (80-120)
      if (normalizedPhase >= 80 && normalizedPhase < 120) {
        return 0;
      }
      
      // Q wave (120-130)
      if (normalizedPhase >= 120 && normalizedPhase < 130) {
        return -20 * Math.sin(((normalizedPhase - 120) / 10) * Math.PI);
      }
      
      // R wave (130-145)
      if (normalizedPhase >= 130 && normalizedPhase < 145) {
        return 60 * Math.sin(((normalizedPhase - 130) / 15) * Math.PI);
      }
      
      // S wave (145-155)
      if (normalizedPhase >= 145 && normalizedPhase < 155) {
        return -25 * Math.sin(((normalizedPhase - 145) / 10) * Math.PI);
      }
      
      // ST segment (155-200)
      if (normalizedPhase >= 155 && normalizedPhase < 200) {
        return 0;
      }
      
      // T wave (200-240)
      if (normalizedPhase >= 200 && normalizedPhase < 240) {
        return 20 * Math.sin(((normalizedPhase - 200) / 40) * Math.PI);
      }
      
      return 0;
    };

    const draw = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(17, 24, 39, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Calculate phase based on heart rate
      const beatsPerSecond = heartRate / 60;
      const phaseIncrement = beatsPerSecond * 360 / 60;
      
      // Generate new data point
      const phase = (x * phaseIncrement) % 360;
      const y = generateECGPoint(phase);
      ecgData.push(y);
      
      // Keep only visible data
      if (ecgData.length > width) {
        ecgData.shift();
      }

      // Draw ECG waveform
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let i = 0; i < ecgData.length; i++) {
        const xPos = width - ecgData.length + i;
        const yPos = midY - ecgData[i];
        
        if (i === 0) {
          ctx.moveTo(xPos, yPos);
        } else {
          ctx.lineTo(xPos, yPos);
        }
      }
      
      ctx.stroke();

      // Draw moving baseline
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();

      // Draw scanning line
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width - 1, 0);
      ctx.lineTo(width - 1, height);
      ctx.stroke();

      x += speed;
      
      if (isMonitoring) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [heartRate, isMonitoring]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  return (
    <div className="rounded-2xl border-2 border-green-500 bg-gray-900 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📈</span>
          <div>
            <h3 className="text-lg font-semibold text-white">
              ECG Monitor
            </h3>
            <p className="text-sm text-gray-400">
              Electrocardiogram Waveform
            </p>
          </div>
        </div>
        <button
          onClick={toggleMonitoring}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            isMonitoring
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isMonitoring ? '⏸ Pause' : '▶ Resume'}
        </button>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full rounded-lg border border-green-500/30"
          style={{ backgroundColor: '#111827' }}
        />
        
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
            <span className="text-gray-400">
              {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
            </span>
          </div>
          <div className="text-gray-400">
            Rate: <span className="font-semibold text-green-400">{heartRate} BPM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
