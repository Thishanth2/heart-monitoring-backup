"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MetricCard from "./components/MetricCard";
import LoginForm from "./components/LoginForm";

interface HealthMetrics {
  heartRate: number;
  oxygenLevel: number;
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
    perfusionIndex: 4.5,
  });

  const handleLogin = (data: UserData) => {
    setUserData(data);
    setIsLoggedIn(true);
    localStorage.setItem("userLoginData", JSON.stringify(data));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem("userLoginData");
  };

  useEffect(() => {
    const storedData = localStorage.getItem("userLoginData");

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem("userLoginData");
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        heartRate: Math.floor(Math.random() * (85 - 60) + 60),
        oxygenLevel: Math.floor(Math.random() * (100 - 95) + 95),
        perfusionIndex: Math.random() * (10 - 2) + 2,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!isLoggedIn) {
    return <LoginForm onSubmit={handleLogin} />;
  }

  const getHeartRateStatus = (hr: number): "normal" | "warning" | "critical" => {
    if (hr >= 60 && hr <= 100) return "normal";
    if ((hr >= 50 && hr < 60) || (hr > 100 && hr <= 120)) return "warning";
    return "critical";
  };

  const getOxygenStatus = (spo2: number): "normal" | "warning" | "critical" => {
    if (spo2 >= 95) return "normal";
    if (spo2 >= 90) return "warning";
    return "critical";
  };

  const getPerfusionStatus = (pi: number): "normal" | "warning" | "critical" => {
    if (pi >= 2 && pi <= 10) return "normal";
    if (pi >= 1 && pi < 2) return "warning";
    return "critical";
  };

  return (
    <div className="min-h-screen bg-[#eef4f8] text-slate-900">
      <header className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-200">
                Clinical Screening Dashboard
              </p>

              <h1 className="mt-3 text-4xl font-extrabold">
                Heart Health Monitoring System
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium text-blue-100">
                Non-invasive cardiac assessment using questionnaire data,
                MAX30102 PPG readings and AMG8833 thermal analysis.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/questionnaire"
                className="rounded-xl bg-emerald-500 px-6 py-3 text-center text-sm font-bold text-white shadow hover:bg-emerald-600"
              >
                Start Assessment
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur md:grid-cols-3">
            <Info label="Patient Name" value={userData?.fullName || "N/A"} />
            <Info label="Age" value={userData?.age || "N/A"} />
            <Info label="Gender" value={userData?.gender || "N/A"} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Live Vital Overview
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Key MAX30102-based indicators shown for demonstration.
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
              System Active
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <MetricCard
              title="Heart Rate"
              value={metrics.heartRate}
              unit="bpm"
              icon="❤️"
              status={getHeartRateStatus(metrics.heartRate)}
              normalRange="60–100"
            />

            <MetricCard
              title="SpO₂ Level"
              value={metrics.oxygenLevel}
              unit="%"
              icon="🩸"
              status={getOxygenStatus(metrics.oxygenLevel)}
              normalRange="95–100"
            />

            <MetricCard
              title="Perfusion Index"
              value={Math.round(metrics.perfusionIndex * 10) / 10}
              unit=""
              icon="📈"
              status={getPerfusionStatus(metrics.perfusionIndex)}
              normalRange="2–10"
            />
          </div>
        </section>

        <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Assessment Workflow
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Follow each stage to complete the full cardiac screening report.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FlowCard
              step="01"
              title="Questionnaire"
              desc="Collect symptoms and risk factors"
              href="/questionnaire"
              color="bg-blue-600"
            />

            <FlowCard
              step="02"
              title="MAX30102"
              desc="Measure heart rate, SpO₂ and perfusion"
              href="/measurement"
              color="bg-red-600"
            />

            <FlowCard
              step="03"
              title="Thermal ROI"
              desc="Analyze fingertip and palm temperature"
              href="/thermal-processing"
              color="bg-orange-600"
            />

            <FlowCard
              step="04"
              title="Final Report"
              desc="View combined medical-style report"
              href="/final-result"
              color="bg-emerald-600"
            />
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-5">
        <p className="text-center text-sm font-medium text-slate-500">
          Heart Health Monitoring System — Academic prototype. Not for clinical diagnosis.
        </p>
      </footer>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
        {label}
      </p>
      <p className="mt-1 text-lg font-extrabold text-white">{value}</p>
    </div>
  );
}

function FlowCard({
  step,
  title,
  desc,
  href,
  color,
}: {
  step: string;
  title: string;
  desc: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-slate-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} text-lg font-extrabold text-white`}
      >
        {step}
      </div>

      <h3 className="mt-4 text-xl font-extrabold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm font-medium text-slate-500">
        {desc}
      </p>

      <p className="mt-4 text-sm font-bold text-blue-700 group-hover:underline">
        Open section →
      </p>
    </Link>
  );
}