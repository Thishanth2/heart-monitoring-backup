'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MetricCard from './components/MetricCard';
import LoginForm from './components/LoginForm';

interface HealthMetrics {
  heartRate: number;
  oxygenLevel: number;
  respiratoryRate: number;
  perfusionIndex: number;
}

interface UserData {
  fullName: string;
  age: string;
  gender: string;
  nic: string;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [metrics, setMetrics] = useState<HealthMetrics>({
    heartRate: 72,
    oxygenLevel: 98,
    respiratoryRate: 16,
    perfusionIndex: 4.5,
  });

  const handleLogin = (data: UserData) => {
    setUserData(data);
    setIsLoggedIn(true);
    localStorage.setItem('userLoginData', JSON.stringify(data));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem('userLoginData');
  };

  useEffect(() => {
    const storedData = localStorage.getItem('userLoginData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('userLoginData');
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        heartRate: Math.floor(Math.random() * (85 - 60) + 60),
        oxygenLevel: Math.floor(Math.random() * (100 - 95) + 95),
        respiratoryRate: Math.floor(Math.random() * (20 - 12) + 12),
        perfusionIndex: Math.random() * (10 - 2) + 2,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!isLoggedIn) {
    return <LoginForm onSubmit={handleLogin} />;
  }

  const getHeartRateStatus = (hr: number): 'normal' | 'warning' | 'critical' => {
    if (hr >= 60 && hr <= 100) return 'normal';
    if ((hr >= 50 && hr < 60) || (hr > 100 && hr <= 120)) return 'warning';
    return 'critical';
  };

  const getOxygenStatus = (spo2: number): 'normal' | 'warning' | 'critical' => {
    if (spo2 >= 95) return 'normal';
    if (spo2 >= 90) return 'warning';
    return 'critical';
  };

  const getRespiratoryStatus = (rr: number): 'normal' | 'warning' | 'critical' => {
    if (rr >= 12 && rr <= 20) return 'normal';
    if ((rr >= 10 && rr < 12) || (rr > 20 && rr <= 25)) return 'warning';
    return 'critical';
  };

  const getPerfusionStatus = (pi: number): 'normal' | 'warning' | 'critical' => {
    if (pi >= 2 && pi <= 10) return 'normal';
    if (pi >= 1 && pi < 2) return 'warning';
    return 'critical';
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">❤️ Heart Health Monitor</h1>
              <p className="mt-1 text-sm text-gray-600">Login to start the assessment flow.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/questionnaire"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
              >
                Start Questionnaire
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
            <span>Logged in as {userData?.fullName}</span>
            <span>Age: {userData?.age}</span>
            <span>Gender: {userData?.gender}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Heart Rate"
            value={metrics.heartRate}
            unit="bpm"
            icon="❤️"
            status={getHeartRateStatus(metrics.heartRate)}
            normalRange="60-100"
          />
          <MetricCard
            title="SpO2 Level"
            value={metrics.oxygenLevel}
            unit="%"
            icon="🫁"
            status={getOxygenStatus(metrics.oxygenLevel)}
            normalRange="95-100"
          />
          <MetricCard
            title="Respiratory Rate"
            value={metrics.respiratoryRate}
            unit="breaths/min"
            icon="💨"
            status={getRespiratoryStatus(metrics.respiratoryRate)}
            normalRange="12-20"
          />
          <MetricCard
            title="Perfusion Index"
            value={Math.round(metrics.perfusionIndex * 10) / 10}
            unit=""
            icon="💫"
            status={getPerfusionStatus(metrics.perfusionIndex)}
            normalRange="2-10"
          />
        </div>

        <div className="mt-8 rounded-3xl border border-gray-200 bg-slate-50 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Assessment Flow</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/questionnaire"
              className="rounded-3xl bg-blue-600 px-5 py-6 text-center text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
            >
              Questionnaire
            </Link>
            <Link
              href="/measurement"
              className="rounded-3xl bg-indigo-600 px-5 py-6 text-center text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
            >
              MAX30102 Measurement
            </Link>
            <Link
              href="/thermal-processing"
              className="rounded-3xl bg-amber-600 px-5 py-6 text-center text-sm font-semibold text-white shadow hover:bg-amber-700 transition"
            >
              Thermal Processing
            </Link>
            <Link
              href="/final-result"
              className="rounded-3xl bg-green-600 px-5 py-6 text-center text-sm font-semibold text-white shadow hover:bg-green-700 transition"
            >
              Final Result
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Follow the flow: Login → Questionnaire → MAX30102 Measurement → Thermal Processing → Final Result.
          </p>
        </div>
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            ⚕️ Heart Health Monitoring System — For demonstration purposes only. Consult healthcare professionals for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
