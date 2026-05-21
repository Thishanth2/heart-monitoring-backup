"use client";

import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";

type SensorData = {
  patientName?: string;
  measurementStatus?: string;
  avgTemp?: number;
  maxTemp?: number;
  minTemp?: number;
  deltaTemp?: number;
  thermalPixels?: number[];
};

type RoiResult = {
  fingertipTemp: number;
  palmTemp: number;
  deltaT: number;
  circulationStatus: string;
};

export default function ThermalProcessingPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [data, setData] = useState<SensorData | null>(null);
  const [roiResult, setRoiResult] = useState<RoiResult | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<{ x: number; y: number }[]>([]);
  const [status, setStatus] = useState("Waiting for thermal data from Pico...");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "sensor_readings"),
      (snapshot) => {
        if (snapshot.empty) {
          setStatus("No sensor data found.");
          return;
        }

        let latest: SensorData | null = null;

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" || change.type === "modified") {
            latest = change.doc.data() as SensorData;
          }
        });

        if (latest?.thermalPixels && latest.thermalPixels.length === 64) {
          setData(latest);
          setStatus("Live thermal camera active");
        }
      },
      (error) => {
        setStatus("Firebase error: " + error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    drawThermal();
  }, [data, selectedPoints]);

  function drawThermal() {
    if (!data?.thermalPixels) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 400;
    const cell = size / 8;

    canvas.width = size;
    canvas.height = size;

    const pixels = data.thermalPixels;
    const min = Math.min(...pixels);
    const max = Math.max(...pixels);

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const value = pixels[row * 8 + col];
        const normalized = (value - min) / (max - min || 1);

        ctx.fillStyle = getHeatColor(normalized);
        ctx.fillRect(col * cell, row * cell, cell, cell);
      }
    }

    drawFingerGuide(ctx);

    selectedPoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = index === 0 ? "white" : "cyan";
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  function handleCanvasClick(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!data?.thermalPixels) return;

    if (selectedPoints.length >= 2) {
      setSelectedPoints([]);
      setRoiResult(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newPoints = [...selectedPoints, { x, y }];
    setSelectedPoints(newPoints);

    if (newPoints.length === 2) {
      calculateRoi(newPoints);
    }
  }

  function calculateRoi(points: { x: number; y: number }[]) {
    if (!data?.thermalPixels) return;

    const fingertipTemp = getRoiAverage(data.thermalPixels, points[0].x, points[0].y);
    const palmTemp = getRoiAverage(data.thermalPixels, points[1].x, points[1].y);

    const deltaT = Number((palmTemp - fingertipTemp).toFixed(2));

    let circulationStatus = "Good circulation";

    if (deltaT > 3) {
      circulationStatus = "Possible poor circulation";
    } else if (deltaT > 1.5) {
      circulationStatus = "Moderate circulation";
    }

    setRoiResult({
      fingertipTemp,
      palmTemp,
      deltaT,
      circulationStatus,
    });

    setStatus("Thermal ROI measurement completed");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-gray-900">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-red-700">
          Thermal Processing
        </h1>

        <p className="mt-2 font-semibold text-gray-700">{status}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-black p-4">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="mx-auto cursor-crosshair rounded-lg border border-white"
            />

            <p className="mt-3 text-center text-sm font-semibold text-white">
              Place 4 fingers inside white guides. Click fingertip first, then palm area.
            </p>
          </div>

          <div>
            <div className="rounded-xl border bg-blue-50 p-5">
              <h2 className="text-xl font-bold text-blue-800">
                Live Thermal Values
              </h2>

              <div className="mt-4 grid gap-3">
                <Card title="Patient" value={data?.patientName ?? "Waiting"} />
                <Card title="Minimum Temperature" value={`${data?.minTemp ?? 0} °C`} />
                <Card title="Maximum Temperature" value={`${data?.maxTemp ?? 0} °C`} />
                <Card title="Average Temperature" value={`${data?.avgTemp ?? 0} °C`} />
                <Card title="Delta Temperature" value={`${data?.deltaTemp ?? 0} °C`} />
              </div>
            </div>

            <div className="mt-5 rounded-xl border bg-green-50 p-5">
              <h2 className="text-xl font-bold text-green-800">
                ROI Result
              </h2>

              <div className="mt-4 grid gap-3">
                <Card
                  title="Fingertip Temperature"
                  value={`${roiResult?.fingertipTemp ?? 0} °C`}
                />
                <Card
                  title="Palm Temperature"
                  value={`${roiResult?.palmTemp ?? 0} °C`}
                />
                <Card
                  title="Delta T"
                  value={`${roiResult?.deltaT ?? 0} °C`}
                />
                <Card
                  title="Circulation Status"
                  value={roiResult?.circulationStatus ?? "Waiting"}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <button
            onClick={() => router.push("/measurement")}
            className="w-full rounded-xl bg-gray-700 p-4 font-bold text-white hover:bg-gray-800"
          >
            Back to Measurement
          </button>

          <button
            disabled={!roiResult}
            onClick={() => router.push("/final-result")}
            className="w-full rounded-xl bg-green-600 p-4 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Continue to Final Result
          </button>
        </div>
      </div>
    </main>
  );
}

function getRoiAverage(pixels: number[], x: number, y: number) {
  const size = 400;
  const cell = size / 8;

  const col = Math.min(7, Math.max(0, Math.floor(x / cell)));
  const row = Math.min(7, Math.max(0, Math.floor(y / cell)));

  const values: number[] = [];

  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        values.push(pixels[r * 8 + c]);
      }
    }
  }

  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Number(avg.toFixed(2));
}

function getHeatColor(value: number) {
  const r = Math.floor(255 * value);
  const g = Math.floor(90 * (1 - Math.abs(value - 0.5) * 2));
  const b = Math.floor(255 * (1 - value));

  return `rgb(${r}, ${g}, ${b})`;
}

function drawFingerGuide(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);

  const fingers = [95, 165, 235, 305];

  fingers.forEach((x) => {
    ctx.beginPath();
    ctx.ellipse(x, 100, 25, 75, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.strokeStyle = "cyan";
  ctx.strokeRect(65, 235, 270, 110);

  ctx.setLineDash([]);
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-sm font-bold text-gray-600">{title}</p>
      <p className="mt-1 text-2xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}