'use client';

import { useState, useEffect } from 'react';
import PatientInfoForm from '@/app/components/PatientInfoForm';
import QuestionnaireForm from '@/app/components/QuestionnaireForm';
import ResultsScreen from '@/app/components/ResultsScreen';
import MetricCard from '@/app/components/MetricCard';

const RED_FLAG_ANSWERS = {
  chestPain: 'Yes, even at rest',
  painSpread: 'Yes (especially left arm/jaw)',
  shortnessOfBreath: 'Yes, even at rest',
  heartRacing: 'Yes, with dizziness/fainting',
  dizzyFaint: ['Yes, dizziness or near fainting', 'Yes, fainting'],
  symptomsWorsen: 'Yes',
};

const ANSWER_WEIGHTS: Record<string, Record<string, number>> = {
  chestPain: {
    'Yes, especially during activity': 2,
    'Yes, even at rest': 3,
    'Mild or occasional discomfort': 1,
    'No': 0,
  },
  painSpread: {
    'Yes (especially left arm/jaw)': 3,
    'Yes, but unclear pattern': 1,
    'No pain at all': 0,
  },
  shortnessOfBreath: {
    'Yes, during activity': 2,
    'Yes, even at rest': 3,
    'No': 0,
  },
  heartRacing: {
    'Yes - occasionally': 1,
    'Yes, with dizziness/fainting': 3,
    'No': 0,
  },
  dizzyFaint: {
    'Yes, dizziness or near fainting': 3,
    'Yes, fainting': 2,
    'Yes, fatigue': 1,
    'No': 0,
  },
  symptomsWorsen: {
    'Yes': 3,
    'No - even at rest': 2,
    'No': 1,
  },
};

interface HealthMetrics {
  heartRate: number;
  oxygenLevel: number;
  respiratoryRate: number;
  perfusionIndex: number;
}

function calculateScoring(answers: Record<string, string>): {
  totalScore: number;
  hasRedFlag: boolean;
  riskLevel: string;
  recommendations: string;
} {
  let totalScore = 0;
  let hasRedFlag = false;

  Object.entries(answers).forEach(([key, value]) => {
    const weights = ANSWER_WEIGHTS[key];
    if (weights && weights[value] !== undefined) {
      totalScore += weights[value];
    }

    if (key === 'dizzyFaint') {
      if (
        value === 'Yes, dizziness or near fainting' ||
        value === 'Yes, fainting'
      ) {
        hasRedFlag = true;
      }
    } else if (
      value === RED_FLAG_ANSWERS[key as keyof typeof RED_FLAG_ANSWERS]
    ) {
      hasRedFlag = true;
    }
  });

  let riskLevel: string;
  let recommendations: string;

  if (totalScore >= 8 || hasRedFlag) {
    riskLevel = 'IMMEDIATE';
    recommendations =
      '🔴 IMMEDIATE TREATMENT REQUIRED\n\nYou must seek immediate medical attention. Please go to the nearest emergency room or call an ambulance immediately. Do not delay. Your symptoms indicate a potentially serious cardiac condition.';
  } else if (totalScore >= 4 && totalScore < 8) {
    riskLevel = 'URGENT';
    recommendations =
      '🟡 CONSULT A DOCTOR AS SOON AS POSSIBLE\n\nYou should contact your doctor immediately or visit an urgent care facility today. Do not ignore these symptoms. Your risk profile warrants professional medical evaluation.';
  } else if (totalScore > 0 && totalScore < 4) {
    riskLevel = 'CONSULTATION';
    recommendations =
      '🟡 CONSULT A DOCTOR\n\nSchedule a doctor\'s appointment at your earliest convenience. While your risk is moderate, professional evaluation is recommended to rule out any underlying conditions.';
  } else {
    riskLevel = 'MONITOR';
    recommendations =
      '🟢 LOWER RISK - MONITOR YOUR HEALTH\n\nYour current risk profile is low. Continue monitoring your health and maintain a healthy lifestyle. Seek medical attention if symptoms develop.';
  }

  return {
    totalScore,
    hasRedFlag,
    riskLevel,
    recommendations,
  };
}

export default function QuestionnairePageComponent() {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'results' | 'measurement'>('results');
  const [measurementStarted, setMeasurementStarted] = useState(false);
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [patientData, setPatientData] = useState({
    patientName: '',
    nic: '',
    age: '',
    answers: {},
    totalScore: 0,
    hasRedFlag: false,
    riskLevel: '',
    recommendations: '',
  });

  const handlePatientInfoSubmit = (data: {
    patientName: string;
    nic: string;
    age: string;
  }) => {
    setPatientData((prev) => ({
      ...prev,
      ...data,
    }));
    setStep(2);
  };

  const handleQuestionnaireSubmit = async (answers: Record<string, string>) => {
    try {
      const scoring = calculateScoring(answers);
      setPatientData((prev) => ({
        ...prev,
        answers,
        totalScore: scoring.totalScore,
        hasRedFlag: scoring.hasRedFlag,
        riskLevel: scoring.riskLevel,
        recommendations: scoring.recommendations,
      }));
      setStep(3);
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  // Start measurement when switching to measurement tab
  useEffect(() => {
    if (activeTab === 'measurement' && !measurementStarted) {
      setMeasurementStarted(true);
      // Simulate starting sensors
      setTimeout(() => {
        setMetrics({
          heartRate: 72,
          oxygenLevel: 98,
          respiratoryRate: 16,
          perfusionIndex: 4.5
        });
        // Start real-time updates
        const interval = setInterval(() => {
          setMetrics({
            heartRate: Math.floor(Math.random() * (85 - 60) + 60),
            oxygenLevel: Math.floor(Math.random() * (100 - 95) + 95),
            respiratoryRate: Math.floor(Math.random() * (20 - 12) + 12),
            perfusionIndex: Math.random() * (10 - 2) + 2
          });
        }, 3000);
        return () => clearInterval(interval);
      }, 2000); // 2 second delay to simulate sensor initialization
    }
  }, [activeTab, measurementStarted]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => (window.location.href = '/')}
          className="mb-6 inline-block px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition duration-200"
        >
          ← Back to Dashboard
        </button>

        {step === 1 && <PatientInfoForm onSubmit={handlePatientInfoSubmit} />}
        {step === 2 && (
          <QuestionnaireForm
            onSubmit={handleQuestionnaireSubmit}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('results')}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'results'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Results
              </button>
              <button
                onClick={() => setActiveTab('measurement')}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'measurement'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Measurement Process
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'results' && (
              <ResultsScreen
                patientData={patientData}
                onRestart={() => {
                  setStep(1);
                  setPatientData({
                    patientName: '',
                    nic: '',
                    age: '',
                    answers: {},
                    totalScore: 0,
                    hasRedFlag: false,
                    riskLevel: '',
                    recommendations: '',
                  });
                  setActiveTab('results');
                  setMeasurementStarted(false);
                  setMetrics(null);
                }}
              />
            )}

            {activeTab === 'measurement' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Measurement Process</h2>
                {!measurementStarted && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Initializing sensors and thermal imaging...</p>
                  </div>
                )}
                {measurementStarted && !metrics && (
                  <div className="text-center py-8">
                    <div className="animate-pulse text-gray-600">Starting measurement process...</div>
                  </div>
                )}
                {metrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                      title="Heart Rate"
                      value={metrics.heartRate}
                      unit="BPM"
                      icon="❤️"
                      status={metrics.heartRate > 80 ? 'warning' : metrics.heartRate > 100 ? 'critical' : 'normal'}
                      normalRange="60-100 BPM"
                    />
                    <MetricCard
                      title="Oxygen Level"
                      value={metrics.oxygenLevel}
                      unit="%"
                      icon="🫁"
                      status={metrics.oxygenLevel < 95 ? 'warning' : metrics.oxygenLevel < 90 ? 'critical' : 'normal'}
                      normalRange="95-100%"
                    />
                    <MetricCard
                      title="Respiratory Rate"
                      value={metrics.respiratoryRate}
                      unit="RPM"
                      icon="🌬️"
                      status={metrics.respiratoryRate > 20 ? 'warning' : metrics.respiratoryRate > 25 ? 'critical' : 'normal'}
                      normalRange="12-20 RPM"
                    />
                    <MetricCard
                      title="Perfusion Index"
                      value={Math.round(metrics.perfusionIndex * 10) / 10}
                      unit="%"
                      icon="💉"
                      status={metrics.perfusionIndex < 2 ? 'warning' : metrics.perfusionIndex < 1 ? 'critical' : 'normal'}
                      normalRange="2-10%"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
