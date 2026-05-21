"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

type SensorData = {
  measurementStatus?: string;
  message?: string;
  countdown?: number;
  fingerStatus?: string;
  redValue?: number;
  irValue?: number;
  heartRate?: number;
  spo2?: number;
  perfusionIndex?: number;
  avgTemp?: number;
  maxTemp?: number;
  minTemp?: number;
  deltaTemp?: number;
};

export default function MeasurementPage() {
  const router = useRouter();

  const [data, setData] = useState<SensorData | null>(null);
  const [status, setStatus] = useState("Waiting for sensor data...");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "sensor_readings"),
      (snapshot) => {
        if (snapshot.empty) {
          setStatus("No data found");
          return;
        }

        let latest: SensorData | null = null;

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" || change.type === "modified") {
            latest = change.doc.data() as SensorData;
          }
        });

        if (latest) {
          setData(latest);
          setStatus(latest.message ?? "Live sensor data received");
        }
      },
      (error) => {
        console.error(error);
        setStatus("Firebase error: " + error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  const isCompleted = data?.measurementStatus === "completed";
  const isMeasuring = data?.measurementStatus === "measuring";
  const isWaiting = data?.measurementStatus === "waiting";

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold text-red-600">
          MAX30102 Measurement
        </h1>

        <p className="mt-2 text-gray-600">{status}</p>

        <div className="mt-4 rounded-xl border bg-red-50 p-4">
          {isWaiting && (
            <p className="text-xl font-bold text-red-600">
              Place your finger on the MAX30102 sensor
            </p>
          )}

          {isMeasuring && (
            <p className="text-xl font-bold text-blue-600">
              Keep your finger still... {data?.countdown ?? 0}s remaining
            </p>
          )}

          {isCompleted && (
            <p className="text-xl font-bold text-green-600">
              Measurement completed
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card title="Finger Status" value={data?.fingerStatus ?? "Waiting"} />
          <Card title="Heart Rate" value={`${data?.heartRate ?? 0} BPM`} />
          <Card title="SpO₂" value={`${data?.spo2 ?? 0} %`} />
          <Card title="Perfusion Index" value={`${data?.perfusionIndex ?? 0} %`} />
          <Card title="Red Value" value={data?.redValue ?? 0} />
          <Card title="IR Value" value={data?.irValue ?? 0} />
        </div>

        <h2 className="mt-8 text-2xl font-bold text-gray-800">
          Thermal Summary
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card title="Average Temperature" value={`${data?.avgTemp ?? 0} °C`} />
          <Card title="Max Temperature" value={`${data?.maxTemp ?? 0} °C`} />
          <Card title="Min Temperature" value={`${data?.minTemp ?? 0} °C`} />
          <Card title="Delta Temperature" value={`${data?.deltaTemp ?? 0} °C`} />
        </div>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <button
            onClick={() => router.push("/questionnaire")}
            className="w-full rounded-xl bg-gray-700 p-4 font-bold text-white hover:bg-gray-800"
          >
            Back to Questionnaire
          </button>

          <button
            onClick={() => router.push("/thermal-processing")}
            disabled={!isCompleted}
            className="w-full rounded-xl bg-red-600 p-4 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Continue to Thermal Processing
          </button>

          <button
            onClick={() => router.push("/final-result")}
            className="w-full rounded-xl bg-green-600 p-4 font-bold text-white hover:bg-green-700"
          >
            View Final Result
          </button>
        </div>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}