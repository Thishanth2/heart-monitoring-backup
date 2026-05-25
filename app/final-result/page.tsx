"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
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
  painRadiation?: string[] | string;
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sensorQuery = query(collection(db, "sensor_readings"), orderBy("createdAt", "desc"), limit(1));
    const thermalQuery = query(collection(db, "thermal_results"), orderBy("createdAt", "desc"), limit(1));
    const questionnaireQuery = query(collection(db, "questionnaires"), orderBy("createdAt", "desc"), limit(1));

    const unsubSensor = onSnapshot(sensorQuery, (snapshot) => {
      if (!snapshot.empty) setSensor(snapshot.docs[0].data() as SensorData);
    });

    const unsubThermal = onSnapshot(thermalQuery, (snapshot) => {
      if (!snapshot.empty) setThermal(snapshot.docs[0].data() as ThermalResult);
    });

    const unsubQuestionnaire = onSnapshot(questionnaireQuery, (snapshot) => {
      if (!snapshot.empty) setQuestionnaire(snapshot.docs[0].data() as Questionnaire);
    });

    return () => {
      unsubSensor();
      unsubThermal();
      unsubQuestionnaire();
    };
  }, []);

  const risk = questionnaire?.riskResult;
  const patientName = questionnaire?.name || sensor?.patientName || thermal?.patientName || "Unknown";
  const reportDate = new Date().toLocaleString();

  const saveFinalSummary = async () => {
    try {
      setSaving(true);

      await addDoc(collection(db, "final_results"), {
        patientInfo: {
          name: patientName,
          age: questionnaire?.age || "N/A",
          gender: questionnaire?.gender || "N/A",
        },
        questionnaire,
        max30102Result: sensor,
        thermalRoiResult: thermal,
        finalRiskResult: risk || null,
        createdAt: serverTimestamp(),
      });

      alert("Final medical report saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to save final report.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#eef3f7] p-6 text-slate-900">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="border-b bg-gradient-to-r from-slate-900 to-blue-900 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">
            Clinical Summary Report
          </p>

          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold">
                Cardiac Screening Assessment
              </h1>
              <p className="mt-2 text-blue-100">
                Questionnaire, MAX30102 measurement and thermal ROI analysis
              </p>
            </div>

            <button
              onClick={saveFinalSummary}
              disabled={saving}
              className="rounded-lg bg-emerald-500 px-6 py-3 font-bold text-white hover:bg-emerald-600 disabled:bg-slate-400"
            >
              {saving ? "Saving Report..." : "Save Full Report"}
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="grid gap-4 rounded-xl border bg-slate-50 p-5 md:grid-cols-4">
            <Info label="Patient Name" value={patientName} />
            <Info label="Age" value={questionnaire?.age || "N/A"} />
            <Info label="Gender" value={questionnaire?.gender || "N/A"} />
            <Info label="Report Date" value={reportDate} />
          </div>

          <div className="mt-6 rounded-xl border-l-8 border-red-600 bg-red-50 p-6">
            <p className="text-sm font-bold uppercase tracking-wider text-red-700">
              Overall Questionnaire Risk
            </p>

            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-red-800">
                  {risk?.level || "Unknown"}
                </h2>
                <p className="mt-1 text-slate-700">
                  Risk score calculated from symptoms and medical history.
                </p>
              </div>

              <div className="text-right">
                <p className="text-5xl font-extrabold text-red-700">
                  {risk?.percentage ?? 0}%
                </p>
                <p className="font-semibold text-slate-600">Risk Percentage</p>
              </div>
            </div>

            <div className="mt-4 h-3 rounded-full bg-white">
              <div
                className="h-3 rounded-full bg-red-600"
                style={{ width: `${risk?.percentage ?? 0}%` }}
              />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-700">
              Main reasons:{" "}
              {risk?.reasons?.length ? risk.reasons.join(", ") : "No major reason recorded"}
            </p>
          </div>

          <ReportSection title="MAX30102 Finger Measurement" subtitle="Contact-based PPG measurement">
            <ResultCard label="Finger Status" value={sensor?.fingerStatus || "No result"} />
            <ResultCard label="Heart Rate" value={`${sensor?.heartRate ?? 0} BPM`} highlight />
            <ResultCard label="SpO₂" value={`${sensor?.spo2 ?? 0}%`} highlight />
            <ResultCard label="Perfusion Index" value={`${sensor?.perfusionIndex ?? 0}%`} />
            <ResultCard label="Red Value" value={sensor?.redValue ?? 0} />
            <ResultCard label="IR Value" value={sensor?.irValue ?? 0} />
          </ReportSection>

          <ReportSection title="Thermal ROI Result" subtitle="Selected fingertip and palm thermal comparison">
            <ResultCard label="Fingertip Temperature" value={`${thermal?.fingertipTemp ?? 0} °C`} highlight />
            <ResultCard label="Palm Temperature" value={`${thermal?.palmTemp ?? 0} °C`} highlight />
            <ResultCard label="Delta T" value={`${thermal?.deltaT ?? 0} °C`} />
            <ResultCard label="Circulation Status" value={thermal?.circulationStatus || "Waiting"} />
          </ReportSection>

          <ReportSection title="Questionnaire Summary" subtitle="Patient-reported clinical symptoms">
            <ResultCard label="Chest Pain" value={questionnaire?.chestPain || "N/A"} />
            <ResultCard label="Pain Location" value={questionnaire?.painLocation || "N/A"} />
            <ResultCard label="Pain Started" value={questionnaire?.painStart || "N/A"} />
            <ResultCard label="Sudden / Gradual" value={questionnaire?.suddenOrGradual || "N/A"} />
            <ResultCard label="Pain Radiation" value={formatArray(questionnaire?.painRadiation)} />
            <ResultCard label="Pain Duration" value={questionnaire?.painDuration || "N/A"} />
            <ResultCard label="Pain Scale" value={questionnaire?.painScale || "N/A"} />
            <ResultCard label="Heart Racing" value={questionnaire?.heartRacing || "N/A"} />
            <ResultCard label="Fainted" value={questionnaire?.fainted || "N/A"} />
            <ResultCard label="Family Heart Disease" value={questionnaire?.familyHeartDisease || "N/A"} />
            <ResultCard label="Alcohol" value={questionnaire?.alcohol || "N/A"} />
            <ResultCard label="Pain Right Now" value={questionnaire?.painNow || "N/A"} />
            <ResultCard label="Symptoms" value={formatArray(questionnaire?.symptoms)} wide />
            <ResultCard label="Medical History" value={formatArray(questionnaire?.medicalHistory)} wide />
          </ReportSection>

          <div className="mt-8 rounded-xl border bg-yellow-50 p-5 text-sm font-medium text-slate-700">
            <b>Note:</b> This report is generated for prototype screening and academic demonstration purposes.
            It should not be used as a medical diagnosis without confirmation by a qualified healthcare professional.
          </div>

          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <button
              onClick={() => router.push("/measurement")}
              className="w-full rounded-lg bg-slate-700 p-4 font-bold text-white hover:bg-slate-800"
            >
              Back to Measurement
            </button>

            <button
              onClick={() => router.push("/thermal-processing")}
              className="w-full rounded-lg bg-blue-700 p-4 font-bold text-white hover:bg-blue-800"
            >
              Back to Thermal Processing
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full rounded-lg bg-emerald-600 p-4 font-bold text-white hover:bg-emerald-700"
            >
              Start New Scan
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function ReportSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">{children}</div>
    </section>
  );
}

function ResultCard({
  label,
  value,
  highlight = false,
  wide = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-blue-300 bg-blue-50" : "bg-slate-50"
      } ${wide ? "md:col-span-3" : ""}`}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 break-words text-xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function formatArray(value?: string[] | string) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "N/A";
  return value || "N/A";
}