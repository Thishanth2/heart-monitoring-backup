"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";

type SensorData = {
  patientName?: string;
  measurementStatus?: string;
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
  patientName?: string;
  fingertipTemp?: number;
  palmTemp?: number;
  deltaT?: number;
  circulationStatus?: string;
};

type RiskResult = {
  percentage?: number;
  level?: string;
  reasons?: string[];
};

type Questionnaire = {
  name?: string;
  age?: string;
  gender?: string;
  chestPain?: string;
  painLocation?: string;
  painStart?: string;
  suddenOrGradual?: string;
  activityAtTime?: string;
  painRadiation?: string;
  painDuration?: string;
  hadBefore?: string;
  symptoms?: string[];
  painScale?: string;
  heartRacing?: string;
  fainted?: string;
  medicalHistory?: string[];
  familyHeartDisease?: string;
  alcohol?: string;
  painNow?: string;
  riskResult?: RiskResult;
};

export default function FinalResultPage() {
  const router = useRouter();

  const [sensor, setSensor] = useState<SensorData | null>(null);
  const [thermal, setThermal] = useState<ThermalResult | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);

  useEffect(() => {
    const sensorQuery = query(
      collection(db, "sensor_readings"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const thermalQuery = query(
      collection(db, "thermal_results"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const questionnaireQuery = query(
      collection(db, "questionnaires"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubSensor = onSnapshot(sensorQuery, (snapshot) => {
      if (!snapshot.empty) {
        setSensor(snapshot.docs[0].data() as SensorData);
      }
    });

    const unsubThermal = onSnapshot(thermalQuery, (snapshot) => {
      if (!snapshot.empty) {
        setThermal(snapshot.docs[0].data() as ThermalResult);
      }
    });

    const unsubQuestionnaire = onSnapshot(questionnaireQuery, (snapshot) => {
      if (!snapshot.empty) {
        setQuestionnaire(snapshot.docs[0].data() as Questionnaire);
      }
    });

    return () => {
      unsubSensor();
      unsubThermal();
      unsubQuestionnaire();
    };
  }, []);

  const risk = questionnaire?.riskResult;

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-gray-900">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-red-700">
              Final Cardiac Assessment
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Questionnaire + MAX30102 + Thermal ROI Results
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
          >
            Start New Scan
          </button>
        </div>

        <Section title="Patient Information" color="bg-slate-50">
          <Card title="Patient Name" value={questionnaire?.name || sensor?.patientName || thermal?.patientName || "Unknown"} />
          <Card title="Age" value={questionnaire?.age || "N/A"} />
          <Card title="Gender" value={questionnaire?.gender || "N/A"} />
        </Section>

        <Section title="Questionnaire Risk Assessment" color="bg-red-50">
          <Card title="Risk Level" value={risk?.level || "Unknown"} />
          <Card title="Risk Percentage" value={`${risk?.percentage ?? 0}%`} />
          <Card
            title="Main Risk Reasons"
            value={risk?.reasons?.length ? risk.reasons.join(", ") : "No major risk reason recorded"}
          />
        </Section>

        <Section title="MAX30102 Measurement Result" color="bg-blue-50">
          <Card title="Finger Status" value={sensor?.fingerStatus || "No result"} />
          <Card title="Heart Rate" value={`${sensor?.heartRate ?? 0} BPM`} />
          <Card title="SpO₂" value={`${sensor?.spo2 ?? 0}%`} />
          <Card title="Perfusion Index" value={`${sensor?.perfusionIndex ?? 0}%`} />
          <Card title="Red Value" value={sensor?.redValue ?? 0} />
          <Card title="IR Value" value={sensor?.irValue ?? 0} />
        </Section>

        <Section title="Thermal ROI Result" color="bg-orange-50">
          <Card title="Fingertip Temperature" value={`${thermal?.fingertipTemp ?? 0} °C`} />
          <Card title="Palm Temperature" value={`${thermal?.palmTemp ?? 0} °C`} />
          <Card title="Delta T" value={`${thermal?.deltaT ?? 0} °C`} />
          <Card title="Circulation Status" value={thermal?.circulationStatus || "Waiting"} />
        </Section>

        <Section title="Thermal Summary from AMG8833" color="bg-green-50">
          <Card title="Average Temperature" value={`${sensor?.avgTemp ?? 0} °C`} />
          <Card title="Maximum Temperature" value={`${sensor?.maxTemp ?? 0} °C`} />
          <Card title="Minimum Temperature" value={`${sensor?.minTemp ?? 0} °C`} />
          <Card title="Delta Temperature" value={`${sensor?.deltaTemp ?? 0} °C`} />
        </Section>

        <Section title="Questionnaire Summary" color="bg-purple-50">
          <Card title="Chest Pain" value={questionnaire?.chestPain || "N/A"} />
          <Card title="Pain Location" value={questionnaire?.painLocation || "N/A"} />
          <Card title="Pain Started" value={questionnaire?.painStart || "N/A"} />
          <Card title="Sudden or Gradual" value={questionnaire?.suddenOrGradual || "N/A"} />
          <Card title="Pain Radiation" value={questionnaire?.painRadiation || "N/A"} />
          <Card title="Pain Duration" value={questionnaire?.painDuration || "N/A"} />
          <Card title="Pain Scale" value={questionnaire?.painScale || "N/A"} />
          <Card title="Heart Racing" value={questionnaire?.heartRacing || "N/A"} />
          <Card title="Fainted" value={questionnaire?.fainted || "N/A"} />
          <Card title="Family Heart Disease" value={questionnaire?.familyHeartDisease || "N/A"} />
          <Card title="Alcohol" value={questionnaire?.alcohol || "N/A"} />
          <Card title="Pain Right Now" value={questionnaire?.painNow || "N/A"} />
          <Card title="Symptoms" value={questionnaire?.symptoms?.join(", ") || "N/A"} />
          <Card title="Medical History" value={questionnaire?.medicalHistory?.join(", ") || "N/A"} />
        </Section>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <button
            onClick={() => router.push("/measurement")}
            className="w-full rounded-xl bg-gray-700 p-4 font-bold text-white hover:bg-gray-800"
          >
            Back to Measurement
          </button>

          <button
            onClick={() => router.push("/thermal-processing")}
            className="w-full rounded-xl bg-orange-600 p-4 font-bold text-white hover:bg-orange-700"
          >
            Back to Thermal Processing
          </button>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mt-8 rounded-2xl border p-6 ${color}`}>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">{children}</div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-gray-600">{title}</p>
      <p className="mt-2 break-words text-xl font-extrabold text-gray-900">
        {value}
      </p>
    </div>
  );
}