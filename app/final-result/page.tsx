"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";

type SensorData = {
  patientName?: string;
  fingerStatus?: string;
  heartRate?: number;
  spo2?: number;
  perfusionIndex?: number;
  redValue?: number;
  irValue?: number;
  avgTemp?: number;
  maxTemp?: number;
  minTemp?: number;
  deltaTemp?: number;
};

type ThermalResult = {
  fingertipTemp?: number;
  palmTemp?: number;
  deltaT?: number;
  circulationStatus?: string;
};

type Questionnaire = {
  name?: string;
  age?: string;
  gender?: string;
  chestPain?: string;
  painScale?: string;
  heartRacing?: string;
  diabetes?: string;
  familyHistory?: string;
  alcohol?: string;
  currentPain?: string;
  riskPercentage?: number;
  riskLevel?: string;
};

export default function FinalResultPage() {
  const router = useRouter();

  const [sensor, setSensor] = useState<SensorData | null>(null);
  const [thermal, setThermal] = useState<ThermalResult | null>(null);
  const [questionnaire, setQuestionnaire] =
    useState<Questionnaire | null>(null);

  useEffect(() => {
    const unsub1 = onSnapshot(
      collection(db, "sensor_readings"),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs;
          const latest = docs[docs.length - 1].data();

          setSensor(latest as SensorData);
        }
      }
    );

    const unsub2 = onSnapshot(
      collection(db, "thermal_results"),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs;
          const latest = docs[docs.length - 1].data();

          setThermal(latest as ThermalResult);
        }
      }
    );

    const unsub3 = onSnapshot(
      collection(db, "questionnaires"),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs;
          const latest = docs[docs.length - 1].data();

          setQuestionnaire(latest as Questionnaire);
        }
      }
    );

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-gray-900">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-xl">

        {/* TITLE */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-red-700">
              Final Cardiac Assessment
            </h1>

            <p className="mt-2 text-lg text-gray-600">
              Combined Questionnaire + MAX30102 + Thermal ROI Results
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
          >
            Start New Scan
          </button>
        </div>

        {/* PATIENT */}
        <div className="mt-8 rounded-2xl border bg-slate-50 p-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Patient Information
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Card
              title="Patient Name"
              value={
                questionnaire?.name ||
                sensor?.patientName ||
                "Unknown"
              }
            />

            <Card
              title="Age"
              value={questionnaire?.age || "N/A"}
            />

            <Card
              title="Gender"
              value={questionnaire?.gender || "N/A"}
            />
          </div>
        </div>

        {/* RISK */}
        <div className="mt-8 rounded-2xl border bg-red-50 p-6">
          <h2 className="text-2xl font-bold text-red-800">
            Risk Assessment
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-lg font-bold text-gray-700">
                Risk Level
              </p>

              <p
                className={`mt-4 text-4xl font-extrabold ${
                  questionnaire?.riskLevel === "High Risk"
                    ? "text-red-700"
                    : questionnaire?.riskLevel === "Moderate Risk"
                    ? "text-yellow-600"
                    : "text-green-700"
                }`}
              >
                {questionnaire?.riskLevel || "Unknown"}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-lg font-bold text-gray-700">
                Risk Percentage
              </p>

              <p className="mt-4 text-4xl font-extrabold text-red-700">
                {questionnaire?.riskPercentage || 0}%
              </p>
            </div>

          </div>
        </div>

        {/* MAX30102 */}
        <div className="mt-8 rounded-2xl border bg-blue-50 p-6">
          <h2 className="text-2xl font-bold text-blue-800">
            MAX30102 Measurement
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            <Card
              title="Finger Status"
              value={sensor?.fingerStatus || "Waiting"}
            />

            <Card
              title="Heart Rate"
              value={`${sensor?.heartRate || 0} BPM`}
            />

            <Card
              title="SpO₂"
              value={`${sensor?.spo2 || 0}%`}
            />

            <Card
              title="Perfusion Index"
              value={`${sensor?.perfusionIndex || 0}`}
            />

            <Card
              title="Red Value"
              value={sensor?.redValue || 0}
            />

            <Card
              title="IR Value"
              value={sensor?.irValue || 0}
            />

          </div>
        </div>

        {/* THERMAL */}
        <div className="mt-8 rounded-2xl border bg-orange-50 p-6">
          <h2 className="text-2xl font-bold text-orange-800">
            Thermal ROI Result
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            <Card
              title="Fingertip Temperature"
              value={`${thermal?.fingertipTemp || 0} °C`}
            />

            <Card
              title="Palm Temperature"
              value={`${thermal?.palmTemp || 0} °C`}
            />

            <Card
              title="Delta T"
              value={`${thermal?.deltaT || 0} °C`}
            />

            <Card
              title="Circulation Status"
              value={thermal?.circulationStatus || "Waiting"}
            />

            <Card
              title="Average Temperature"
              value={`${sensor?.avgTemp || 0} °C`}
            />

            <Card
              title="Maximum Temperature"
              value={`${sensor?.maxTemp || 0} °C`}
            />

          </div>
        </div>

        {/* QUESTIONNAIRE */}
        <div className="mt-8 rounded-2xl border bg-green-50 p-6">
          <h2 className="text-2xl font-bold text-green-800">
            Questionnaire Summary
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            <Card
              title="Chest Pain"
              value={questionnaire?.chestPain || "N/A"}
            />

            <Card
              title="Pain Scale"
              value={questionnaire?.painScale || "N/A"}
            />

            <Card
              title="Heart Racing"
              value={questionnaire?.heartRacing || "N/A"}
            />

            <Card
              title="Diabetes"
              value={questionnaire?.diabetes || "N/A"}
            />

            <Card
              title="Family History"
              value={questionnaire?.familyHistory || "N/A"}
            />

            <Card
              title="Alcohol"
              value={questionnaire?.alcohol || "N/A"}
            />

            <Card
              title="Current Pain"
              value={questionnaire?.currentPain || "N/A"}
            />

          </div>
        </div>

      </div>
    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-gray-600">
        {title}
      </p>

      <p className="mt-2 text-2xl font-extrabold text-gray-900 break-words">
        {value}
      </p>
    </div>
  );
}