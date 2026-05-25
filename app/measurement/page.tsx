"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type SensorData = {
  patientName?: string;
  measurementStatus?: string;
  message?: string;
  countdown?: number;
  fingerStatus?: string;
  redValue?: number;
  irValue?: number;
  heartRate?: number;
  spo2?: number;
  perfusionIndex?: number;
};

const BACKEND_URL = "http://10.54.16.137:5000/api/latest-sensor";

export default function MeasurementPage() {
  const router = useRouter();
  const lastMaxData = useRef<SensorData | null>(null);

  const [data, setData] = useState<SensorData | null>(null);
  const [status, setStatus] = useState("Waiting for MAX30102 sensor data...");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(BACKEND_URL);
        const latest = await res.json();

        if (!latest || !latest.measurementStatus) return;

        if (latest.measurementStatus === "thermal_live") {
          if (lastMaxData.current) {
            setData(lastMaxData.current);
            setStatus(lastMaxData.current.message ?? "MAX30102 measurement completed");
          }
          return;
        }

        lastMaxData.current = latest;
        setData(latest);
        setStatus(latest.message ?? "Live MAX30102 data received");
      } catch {
        setStatus("Backend not connected");
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const isCompleted = data?.measurementStatus === "completed";
  const isMeasuring = data?.measurementStatus === "measuring";
  const isWaiting = data?.measurementStatus === "waiting";

  const saveAndContinue = async () => {
    if (!data || !isCompleted) return;

    try {
      setSaving(true);

      await addDoc(collection(db, "sensor_readings"), {
        patientName: data.patientName ?? "Unknown",
        measurementStatus: data.measurementStatus,
        fingerStatus: data.fingerStatus ?? "",
        redValue: data.redValue ?? 0,
        irValue: data.irValue ?? 0,
        heartRate: data.heartRate ?? 0,
        spo2: data.spo2 ?? 0,
        perfusionIndex: data.perfusionIndex ?? 0,
        createdAt: serverTimestamp(),
      });

      router.push("/thermal-processing");
    } catch (error) {
      console.error(error);
      alert("Failed to save MAX30102 result.");
    } finally {
      setSaving(false);
    }
  };

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
              Measurement completed. You can continue to thermal processing.
            </p>
          )}

          {!data && (
            <p className="text-xl font-bold text-gray-600">
              Waiting for Pico data...
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

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <button
            onClick={() => router.push("/questionnaire")}
            className="w-full rounded-xl bg-gray-700 p-4 font-bold text-white hover:bg-gray-800"
          >
            Back to Questionnaire
          </button>

          <button
            onClick={saveAndContinue}
            disabled={!isCompleted || saving}
            className="w-full rounded-xl bg-red-600 p-4 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save & Continue to Thermal Processing"}
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