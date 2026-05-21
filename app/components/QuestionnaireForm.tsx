'use client';

import { useState } from 'react';

interface QuestionnaireFormProps {
  onSubmit: (answers: Record<string, string>) => void;
  onBack: () => void;
}

interface Question {
  id: string;
  question: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 'chestPain',
    question: 'Do you experience chest pain or discomfort recently?',
    options: [
      'No',
      'Mild or occasional discomfort',
      'Yes, especially during activity',
      'Yes, even at rest',
    ],
  },
  {
    id: 'painSpread',
    question: 'Does the pain spread to your arm, jaw, neck, or back?',
    options: [
      'No pain at all',
      'Yes, but unclear pattern',
      'Yes (especially left arm/jaw)',
    ],
  },
  {
    id: 'shortnessOfBreath',
    question: 'Do you feel shortness of breath, especially during activity or rest?',
    options: ['No', 'Yes, during activity', 'Yes, even at rest'],
  },
  {
    id: 'heartRacing',
    question: 'Do you feel your heart racing, skipping, or beating irregularly?',
    options: [
      'No',
      'Yes - occasionally',
      'Yes, with dizziness/fainting',
    ],
  },
  {
    id: 'dizzyFaint',
    question: 'Do you feel dizzy, faint, or unusually tired?',
    options: [
      'No',
      'Yes, fatigue',
      'Yes, fainting',
      'Yes, dizziness or near fainting',
    ],
  },
  {
    id: 'symptomsWorsen',
    question: 'Do symptoms worsen with exertion and improve with rest?',
    options: ['No', 'No - even at rest', 'Yes'],
  },
];

export default function QuestionnaireForm({
  onSubmit,
  onBack,
}: QuestionnaireFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSelectAnswer = (answer: string) => {
    const questionId = QUESTIONS[currentQuestion].id;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    // Clear error
    if (errors[questionId]) {
      setErrors((prev) => ({
        ...prev,
        [questionId]: '',
      }));
    }
  };

  const handleNext = () => {
    const questionId = QUESTIONS[currentQuestion].id;
    if (!answers[questionId]) {
      setErrors((prev) => ({
        ...prev,
        [questionId]: 'Please select an answer',
      }));
      return;
    }

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const progressPercentage = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentQuestion];
  const currentAnswer = answers[question.id] || '';

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Cardiac Health Questionnaire
        </h2>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((option) => (
            <label key={option} className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition duration-200"
              style={{
                borderColor: currentAnswer === option ? '#2563eb' : '#e5e7eb',
                backgroundColor: currentAnswer === option ? '#eff6ff' : 'transparent',
              }}
            >
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={currentAnswer === option}
                onChange={() => handleSelectAnswer(option)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-3 text-gray-700">{option}</span>
            </label>
          ))}
        </div>

        {errors[question.id] && (
          <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handlePrevious}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          {currentQuestion === QUESTIONS.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
}
