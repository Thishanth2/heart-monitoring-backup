"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function QuestionnairePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    gender: "",
    age: "",
    chestPain: "",
    painLocation: "",
    painStart: "",
    suddenOrGradual: "",
    activityAtTime: "",
    painRadiation: "",
    painDuration: "",
    hadBefore: "",
    symptoms: [] as string[],
    painScale: "",
    heartRacing: "",
    fainted: "",
    medicalHistory: [] as string[],
    familyHeartDisease: "",
    alcohol: "",
    painNow: "",
  });

  const [saving, setSaving] = useState(false);

  const risk = useMemo(() => calculateRisk(form), [form]);

  const handleCheckbox = (field: "symptoms" | "medicalHistory", value: string) => {
    const current = form[field];

    if (current.includes(value)) {
      setForm({
        ...form,
        [field]: current.filter((item) => item !== value),
      });
    } else {
      setForm({
        ...form,
        [field]: [...current, value],
      });
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.gender || !form.age) {
      alert("Please fill Name, Gender and Age.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "questionnaires"), {
        ...form,
        riskResult: risk,
        createdAt: serverTimestamp(),
      });

      localStorage.setItem("patientName", form.name);
      localStorage.setItem("questionnaireRisk", JSON.stringify(risk));

      alert("Questionnaire saved successfully.");
      router.push("/measurement");
    } catch (error) {
      console.error(error);
      alert("Failed to save questionnaire.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-gray-900">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-red-700">
          Patient Cardiac Questionnaire
        </h1>

        <p className="mt-2 text-base font-medium text-gray-700">
          Please complete the following details before measurement.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />

          <Select
            label="Gender"
            value={form.gender}
            options={["Male", "Female", "Other"]}
            onChange={(v) => setForm({ ...form, gender: v })}
          />

          <Input
            label="Age"
            type="number"
            value={form.age}
            onChange={(v) => setForm({ ...form, age: v })}
          />

          <Select
            label="Do you have chest pain?"
            value={form.chestPain}
            options={["No", "Yes", "Sometimes"]}
            onChange={(v) => setForm({ ...form, chestPain: v })}
          />

          <Input
            label="Where exactly is the pain?"
            placeholder="Example: center chest, left side..."
            value={form.painLocation}
            onChange={(v) => setForm({ ...form, painLocation: v })}
          />

          <Input
            label="When did it start?"
            placeholder="Example: today morning, 2 days ago..."
            value={form.painStart}
            onChange={(v) => setForm({ ...form, painStart: v })}
          />

          <Select
            label="Was it sudden or gradual?"
            value={form.suddenOrGradual}
            options={["Sudden", "Gradual", "Not sure"]}
            onChange={(v) => setForm({ ...form, suddenOrGradual: v })}
          />

          <Input
            label="What were you doing at that time?"
            placeholder="Example: walking, resting, exercising..."
            value={form.activityAtTime}
            onChange={(v) => setForm({ ...form, activityAtTime: v })}
          />

          <Select
            label="Does the pain go to arm, neck or jaw?"
            value={form.painRadiation}
            options={["No", "Left arm", "Right arm", "Neck", "Jaw", "Back"]}
            onChange={(v) => setForm({ ...form, painRadiation: v })}
          />

          <Input
            label="How long does it last?"
            placeholder="Example: 5 minutes, 30 minutes..."
            value={form.painDuration}
            onChange={(v) => setForm({ ...form, painDuration: v })}
          />

          <Select
            label="Have you had this before?"
            value={form.hadBefore}
            options={["No", "Yes", "Not sure"]}
            onChange={(v) => setForm({ ...form, hadBefore: v })}
          />

          <Select
            label="How bad is the pain? (1–10)"
            value={form.painScale}
            options={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
            onChange={(v) => setForm({ ...form, painScale: v })}
          />

          <Select
            label="Do you feel your heart racing?"
            value={form.heartRacing}
            options={["No", "Yes", "Sometimes"]}
            onChange={(v) => setForm({ ...form, heartRacing: v })}
          />

          <Select
            label="Have you ever fainted?"
            value={form.fainted}
            options={["No", "Yes", "Almost fainted"]}
            onChange={(v) => setForm({ ...form, fainted: v })}
          />

          <Select
            label="Anyone in your family had heart disease?"
            value={form.familyHeartDisease}
            options={["No", "Yes", "Not sure"]}
            onChange={(v) => setForm({ ...form, familyHeartDisease: v })}
          />

          <Select
            label="Do you drink alcohol?"
            value={form.alcohol}
            options={["No", "Occasionally", "Frequently"]}
            onChange={(v) => setForm({ ...form, alcohol: v })}
          />

          <Select
            label="Are you having pain right now?"
            value={form.painNow}
            options={["No", "Yes", "Mild pain", "Severe pain"]}
            onChange={(v) => setForm({ ...form, painNow: v })}
          />
        </div>

        <CheckboxGroup
          title="Do you have symptoms like:"
          options={[
            "Sweating",
            "Vomiting",
            "Shortness of breath",
            "Palpitations",
            "Dizziness",
            "Unusual tiredness",
          ]}
          selected={form.symptoms}
          onChange={(v) => handleCheckbox("symptoms", v)}
        />

        <CheckboxGroup
          title="Past Medical History:"
          options={[
            "High blood pressure",
            "Diabetes",
            "High cholesterol",
            "Previous heart problems",
            "Asthma",
            "No known medical history",
          ]}
          selected={form.medicalHistory}
          onChange={(v) => handleCheckbox("medicalHistory", v)}
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <button
            onClick={() => router.push("/")}
            className="rounded-xl bg-gray-700 p-4 text-lg font-bold text-white hover:bg-gray-800"
          >
            Back
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-xl bg-red-600 p-4 text-lg font-bold text-white hover:bg-red-700 disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save & Continue to Measurement"}
          </button>

          <RiskCard risk={risk} />
        </div>
      </div>
    </main>
  );
}

function calculateRisk(form: any) {
  let score = 0;
  const reasons: string[] = [];

  const age = Number(form.age);

  if (age >= 60) {
    score += 10;
    reasons.push("Age above 60");
  } else if (age >= 45) {
    score += 6;
    reasons.push("Age above 45");
  }

  if (form.chestPain === "Yes") {
    score += 18;
    reasons.push("Chest pain present");
  } else if (form.chestPain === "Sometimes") {
    score += 10;
    reasons.push("Occasional chest pain");
  }

  if (form.painNow === "Severe pain") {
    score += 20;
    reasons.push("Severe pain right now");
  } else if (form.painNow === "Yes") {
    score += 15;
    reasons.push("Pain right now");
  } else if (form.painNow === "Mild pain") {
    score += 8;
    reasons.push("Mild pain right now");
  }

  if (["Left arm", "Neck", "Jaw", "Back"].includes(form.painRadiation)) {
    score += 15;
    reasons.push("Pain spreading to arm/neck/jaw/back");
  }

  if (form.suddenOrGradual === "Sudden") {
    score += 10;
    reasons.push("Sudden onset pain");
  }

  const painScale = Number(form.painScale);
  if (painScale >= 8) {
    score += 15;
    reasons.push("High pain score");
  } else if (painScale >= 5) {
    score += 8;
    reasons.push("Moderate pain score");
  }

  if (form.symptoms.includes("Shortness of breath")) {
    score += 15;
    reasons.push("Shortness of breath");
  }

  if (form.symptoms.includes("Sweating")) {
    score += 10;
    reasons.push("Sweating");
  }

  if (form.symptoms.includes("Vomiting")) {
    score += 8;
    reasons.push("Vomiting");
  }

  if (form.symptoms.includes("Palpitations")) {
    score += 8;
    reasons.push("Palpitations");
  }

  if (form.heartRacing === "Yes") {
    score += 8;
    reasons.push("Heart racing");
  } else if (form.heartRacing === "Sometimes") {
    score += 4;
    reasons.push("Occasional heart racing");
  }

  if (form.fainted === "Yes") {
    score += 12;
    reasons.push("Previous fainting");
  } else if (form.fainted === "Almost fainted") {
    score += 8;
    reasons.push("Near fainting");
  }

  const medicalRisks = [
    "High blood pressure",
    "Diabetes",
    "High cholesterol",
    "Previous heart problems",
  ];

  medicalRisks.forEach((risk) => {
    if (form.medicalHistory.includes(risk)) {
      score += 8;
      reasons.push(risk);
    }
  });

  if (form.familyHeartDisease === "Yes") {
    score += 8;
    reasons.push("Family history of heart disease");
  }

  if (form.alcohol === "Frequently") {
    score += 5;
    reasons.push("Frequent alcohol use");
  }

  const percentage = Math.min(score, 100);

  let level = "Low Risk";
  let color = "bg-green-100 text-green-800 border-green-400";
  let bar = "bg-green-600";

  if (percentage >= 70) {
    level = "High Risk";
    color = "bg-red-100 text-red-800 border-red-400";
    bar = "bg-red-600";
  } else if (percentage >= 40) {
    level = "Medium Risk";
    color = "bg-yellow-100 text-yellow-800 border-yellow-400";
    bar = "bg-yellow-500";
  }

  return {
    score,
    percentage,
    level,
    color,
    bar,
    reasons,
  };
}

function RiskCard({ risk }: { risk: any }) {
  return (
    <div className={`rounded-xl border-2 p-4 ${risk.color}`}>
      <p className="text-sm font-bold">Questionnaire Risk Level</p>

      <div className="mt-2 flex items-end justify-between">
        <h2 className="text-2xl font-extrabold">{risk.level}</h2>
        <p className="text-3xl font-extrabold">{risk.percentage}%</p>
      </div>

      <div className="mt-3 h-3 w-full rounded-full bg-white">
        <div
          className={`h-3 rounded-full ${risk.bar}`}
          style={{ width: `${risk.percentage}%` }}
        />
      </div>

      <p className="mt-3 text-xs font-semibold">
        Based on selected symptoms and medical history.
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-base font-bold text-gray-900">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-400 bg-white p-3 text-base font-medium text-gray-900 placeholder-gray-500 focus:border-red-600 focus:outline-none"
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-base font-bold text-gray-900">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-400 bg-white p-3 text-base font-medium text-gray-900 focus:border-red-600 focus:outline-none"
      >
        <option value="">Select option</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxGroup({
  title,
  options,
  selected,
  onChange,
}: {
  title: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-8 rounded-xl border border-gray-300 bg-slate-50 p-5">
      <h2 className="mb-4 text-xl font-bold text-gray-900">{title}</h2>

      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 bg-white p-3 text-base font-semibold text-gray-900 hover:bg-red-50"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onChange(option)}
              className="h-5 w-5"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}