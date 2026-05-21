'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MetricCard from './components/MetricCard';

interface HealthMetrics {
  heartRate: number;
  oxygenLevel: number;
  respiratoryRate: number;
  perfusionIndex: number;
}

export default function MeasurementPage() {
  const [status, setStatus] = useState<'idle' | 'measuring' | 'complete'>('idle');
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (status === 'measuring') {
      setMessage('Initializing MAX30102 sensor. Please place your finger.');

      timeout = setTimeout(async () => {
        try {
          const response = await fetch('http://localhost:5000/api/sensor');
          const result = await response.json();
          const sensor = result.data;

          const measured: HealthMetrics = {
            heartRate: sensor?.heartRate || 0,
            oxygenLevel: sensor?.spo2 || 0,
            respiratoryRate: 0,
            perfusionIndex: sensor?.perfusionIndex || 0,
          };

          setMetrics(measured);
          localStorage.setItem('latestMeasurement', JSON.stringify(measured));
          localStorage.setItem('latestSensorData', JSON.stringify(sensor));
          setStatus('complete');
        } catch (error) {
          console.error('Backend fetch error:', error);
          setMessage('Backend connection failed. Check backend and Pico connection.');
          setStatus('idle');
        }
      }, 3000);

      interval = setInterval(() => {
        setMessage((prev) =>
          prev === 'Measuring signals...'
            ? 'Reading MAX30102 data from backend...'
            : 'Measuring signals...'
        );
      }, 1500);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [status]);

  const startMeasurement = () => {
    setStatus('measuring');
    setMetrics(null);
    setMessage('Preparing sensors...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">MAX30102 Measurement</h1>
            <p className="text-sm text-slate-600">
              Collect heart rate, SpO₂, and perfusion index readings from MAX30102 sensor.
            </p>
          </div>
          <Link
            href="/questionnaire"
            className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
          >
            Back to Questionnaire
          </Link>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Measurement Status</h2>
              <p className="text-slate-600">Follow the flow to measure, process, and review results.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-slate-700">
              {status === 'idle' ? 'Idle' : status === 'measuring' ? 'Measuring...' : 'Complete'}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-600">Current step</p>
              <p className="mt-2 text-lg text-slate-900">
                {status === 'idle'
                  ? 'Start the MAX30102 measurement.'
                  : status === 'measuring'
                  ? message
                  : 'Measurement complete. Ready to proceed to thermal processing.'}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-600">Expected metrics</p>
              <p className="mt-2 text-lg text-slate-900">Heart Rate, SpO₂, Perfusion Index</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {status === 'complete' && metrics ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                  title="Heart Rate"
                  value={metrics.heartRate}
                  unit="bpm"
                  icon="❤️"
                  status={metrics.heartRate >= 60 && metrics.heartRate <= 100 ? 'normal' : 'warning'}
                  normalRange="60-100"
                />
                <MetricCard
                  title="SpO2"
                  value={metrics.oxygenLevel}
                  unit="%"
                  icon="🫁"
                  status={metrics.oxygenLevel >= 95 ? 'normal' : 'warning'}
                  normalRange="95-100"
                />
                <MetricCard
                  title="Perfusion Index"
                  value={metrics.perfusionIndex}
                  unit=""
                  icon="💫"
                  status={metrics.perfusionIndex >= 2 && metrics.perfusionIndex <= 10 ? 'normal' : 'warning'}
                  normalRange="2-10"
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={startMeasurement}
                disabled={status === 'measuring'}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-6 py-4 text-white font-semibold shadow hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {status === 'idle' ? 'Start Measurement' : status === 'measuring' ? 'Measuring...' : 'Measurement Complete'}
              </button>
              {status === 'complete' ? (
                <Link
                  href="/thermal-processing"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-600 px-6 py-4 text-sm font-semibold text-white shadow hover:bg-amber-700 transition"
                >
                  Continue to Thermal Processing
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-300 px-6 py-4 text-sm font-semibold text-white shadow transition cursor-not-allowed"
                >
                  Continue to Thermal Processing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}