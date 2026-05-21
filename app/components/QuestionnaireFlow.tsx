'use client';

import { useState } from 'react';
import PatientInfoForm from './PatientInfoForm';
import QuestionnaireForm from './QuestionnaireForm';
import ResultsScreen from './ResultsScreen';

export default function QuestionnaireFlow() {
  const [step, setStep] = useState(1); // 1: PatientInfo, 2: Questionnaire, 3: Results
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
      // Calculate scoring locally
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        {step === 1 && (
          <PatientInfoForm onSubmit={handlePatientInfoSubmit} />
        )}
        {step === 2 && (
          <QuestionnaireForm
            onSubmit={handleQuestionnaireSubmit}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
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
            }}
          />
        )}
      </div>
    </div>
  );
}

// Scoring logic
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
