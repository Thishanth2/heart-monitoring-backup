'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ThermalProcessingPage() {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (progress < 100) {
      interval = setInterval(() => {
        setProgress((current) => Math.min(100, current + 10));
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [progress]);

  useEffect(() => {
    if (progress >= 100 && !complete) {
      setComplete(true);
      localStorage.setItem(
        'latestThermalProcessing',
        JSON.stringify({ complete: true, summary: 'Thermal feature extraction completed successfully.' })
      );
    }
  }, [progress, complete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Thermal Processing</h1>
            <p className="text-sm text-slate-600">Process the measured sensor data and prepare the final result dashboard.</p>
          </div>
          <Link
            href="/measurement"
            className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
          >
            Back to Measurement
          </Link>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Processing Workflow</h2>
              <p className="text-slate-600">Thermal analysis is used to extract feature vectors from sensor data and compute the final risk outcome.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-slate-700">
              {complete ? 'Completed' : `Processing ${progress}%`}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-600">Current progress</p>
              <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-4 rounded-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-700">
                {complete
                  ? 'Processing finished. Your assessment is ready for the final dashboard.'
                  : 'Thermal feature extraction is in progress. Please wait while the algorithm computes the final report.'}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-600">Feature Extraction</p>
                <p className="mt-2 text-slate-900">Detect thermal patterns and correlate them with cardiovascular data.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-600">Signal Fusion</p>
                <p className="mt-2 text-slate-900">Combine sensor measurements into a unified health signature.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-600">Final Report</p>
                <p className="mt-2 text-slate-900">Generate the final result dashboard for physician review.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              {complete ? (
                <Link
                  href="/final-result"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-green-600 px-6 py-4 text-sm font-semibold text-white shadow hover:bg-green-700 transition"
                >
                  View Final Result
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-300 px-6 py-4 text-sm font-semibold text-white shadow transition cursor-not-allowed"
                >
                  View Final Result
                </button>
              )}
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
