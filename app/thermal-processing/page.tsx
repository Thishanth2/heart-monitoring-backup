"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SensorData = {
  patientName?: string;
  measurementStatus?: string;
  thermalPixels?: number[];
  avgTemp?: number;
  maxTemp?: number;
  minTemp?: number;
  deltaTemp?: number;
};

export default function ThermalProcessingPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const latestFrameRef = useRef<SensorData | null>(null);

  const [data, setData] = useState<SensorData | null>(null);
  const [roiPoints, setRoiPoints] = useState<{ row: number; col: number }[]>([]);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState("Waiting for thermal camera data...");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://10.54.16.137:5000/api/latest-sensor");
        const latest = await res.json();

        if (latest?.thermalPixels && latest.thermalPixels.length === 64) {
          latestFrameRef.current = latest;
          setData(latest);
          setStatus("Live thermal camera active");
        }
      } catch {
        setStatus("Backend not connected");
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let animationId: number;

    const animate = () => {
      drawCanvas();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [roiPoints, result]);

  function drawCanvas() {
    const frame = latestFrameRef.current;

    if (!frame?.thermalPixels) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;

    const pixels = frame.thermalPixels;
    const min = Math.min(...pixels);
    const max = Math.max(...pixels);

    const imageData = ctx.createImageData(size, size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const gx = (x / size) * 7;
        const gy = (y / size) * 7;

        const temp = bilinearInterpolate(pixels, gx, gy);
        const normalized = (temp - min) / (max - min || 1);
        const [r, g, b] = getHeatRGB(normalized);

        const index = (y * size + x) * 4;

        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    roiPoints.forEach((p, index) => {
      const cell = size / 8;
      ctx.strokeStyle = index === 0 ? "white" : "cyan";
      ctx.lineWidth = 4;
      ctx.strokeRect(p.col * cell, p.row * cell, cell, cell);
    });
  }

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    const frame = latestFrameRef.current;

    if (!frame?.thermalPixels || result) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cell = rect.width / 8;

    const col = Math.floor((e.clientX - rect.left) / cell);
    const row = Math.floor((e.clientY - rect.top) / cell);

    const newPoints = [...roiPoints, { row, col }];
    setRoiPoints(newPoints);

    if (newPoints.length === 1) {
      setStatus("Fingertip selected. Now click palm/bottom area.");
    }

    if (newPoints.length === 2) {
      const fingertipTemp = getRoiAverage(frame.thermalPixels, newPoints[0].row, newPoints[0].col);
      const palmTemp = getRoiAverage(frame.thermalPixels, newPoints[1].row, newPoints[1].col);
      const deltaT = Number((palmTemp - fingertipTemp).toFixed(2));
      const circulationStatus = getCirculationStatus(deltaT);

      const finalResult = {
        patientName: frame.patientName || "Unknown",
        fingertipTemp: Number(fingertipTemp.toFixed(2)),
        palmTemp: Number(palmTemp.toFixed(2)),
        deltaT,
        circulationStatus,
      };

      setResult(finalResult);
      setStatus("Thermal measurement completed");

      await fetch("http://10.54.16.137:5000/api/thermal-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(finalResult)
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-gray-900">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-red-700">
          Thermal Processing
        </h1>

        <p className="mt-2 font-semibold text-gray-700">{status}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-black p-4">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="mx-auto h-[400px] w-[400px] cursor-crosshair rounded-lg"
            />

            <p className="mt-3 text-center text-sm font-semibold text-white">
              Click 1: Fingertip ROI | Click 2: Palm/Bottom ROI
            </p>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border bg-blue-50 p-5">
              <h2 className="text-xl font-bold text-blue-800">
                Live Thermal Camera
              </h2>

              <div className="mt-4 grid gap-3">
                <Card title="Minimum Temperature" value={`${data?.minTemp ?? 0} °C`} />
                <Card title="Maximum Temperature" value={`${data?.maxTemp ?? 0} °C`} />
                <Card title="Average Temperature" value={`${data?.avgTemp ?? 0} °C`} />
                <Card title="Delta Temperature" value={`${data?.deltaTemp ?? 0} °C`} />
              </div>
            </div>

            <div className="rounded-xl border bg-green-50 p-5">
              <h2 className="text-xl font-bold text-green-800">
                ROI Result
              </h2>

              <div className="mt-4 grid gap-3">
                <Card title="Fingertip Temperature" value={`${result?.fingertipTemp ?? 0} °C`} />
                <Card title="Palm Temperature" value={`${result?.palmTemp ?? 0} °C`} />
                <Card title="Delta T" value={`${result?.deltaT ?? 0} °C`} />
                <Card title="Circulation Status" value={result?.circulationStatus ?? "Waiting"} />
              </div>
            </div>

            <button
              onClick={() => {
                setRoiPoints([]);
                setResult(null);
                setStatus("Live thermal camera active. Click fingertip ROI first.");
              }}
              className="w-full rounded-xl bg-orange-600 p-4 font-bold text-white hover:bg-orange-700"
            >
              Reset ROI Selection
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <button
            onClick={() => router.push("/measurement")}
            className="w-full rounded-xl bg-gray-700 p-4 font-bold text-white"
          >
            Back to Measurement
          </button>

          <button
            disabled={!result}
            onClick={() => router.push("/final-result")}
            className="w-full rounded-xl bg-green-600 p-4 font-bold text-white disabled:bg-gray-400"
          >
            Continue to Final Result
          </button>
        </div>
      </div>
    </main>
  );
}

function bilinearInterpolate(pixels: number[], x: number, y: number) {
  const x1 = Math.floor(x);
  const y1 = Math.floor(y);
  const x2 = Math.min(x1 + 1, 7);
  const y2 = Math.min(y1 + 1, 7);

  const q11 = pixels[y1 * 8 + x1];
  const q21 = pixels[y1 * 8 + x2];
  const q12 = pixels[y2 * 8 + x1];
  const q22 = pixels[y2 * 8 + x2];

  const fx = x - x1;
  const fy = y - y1;

  const top = q11 * (1 - fx) + q21 * fx;
  const bottom = q12 * (1 - fx) + q22 * fx;

  return top * (1 - fy) + bottom * fy;
}

function getRoiAverage(pixels: number[], row: number, col: number) {
  let sum = 0;
  let count = 0;

  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        sum += pixels[r * 8 + c];
        count++;
      }
    }
  }

  return sum / count;
}

function getCirculationStatus(deltaT: number) {
  if (deltaT <= 1.5) return "Good circulation";
  if (deltaT <= 3) return "Moderate circulation";
  return "Possible poor circulation";
}

function getHeatRGB(value: number): [number, number, number] {
  const v = Math.max(0, Math.min(1, value));

  if (v < 0.25) return [0, Math.floor(255 * v * 4), 255];
  if (v < 0.5) return [0, 255, Math.floor(255 * (1 - (v - 0.25) * 4))];
  if (v < 0.75) return [Math.floor(255 * (v - 0.5) * 4), 255, 0];

  return [255, Math.floor(255 * (1 - (v - 0.75) * 4)), 0];
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-sm font-bold text-gray-600">{title}</p>
      <p className="mt-1 text-2xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}