'use client';

interface ResultsScreenProps {
  patientData: {
    patientName?: string;
    nic?: string;
    age?: string;
    gender?: string;
    totalScore: number;
    hasRedFlag: boolean;
    riskLevel: string;
    recommendations: string;
  };
  onRestart: () => void;
}

export default function ResultsScreen({
  patientData,
  onRestart,
}: ResultsScreenProps) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'IMMEDIATE':
        return 'from-red-500 to-red-600';
      case 'URGENT':
        return 'from-yellow-500 to-yellow-600';
      case 'CONSULTATION':
        return 'from-orange-500 to-orange-600';
      case 'MONITOR':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRiskBgColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'IMMEDIATE':
        return 'bg-red-50';
      case 'URGENT':
        return 'bg-yellow-50';
      case 'CONSULTATION':
        return 'bg-orange-50';
      case 'MONITOR':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getRiskBorderColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'IMMEDIATE':
        return 'border-red-300';
      case 'URGENT':
        return 'border-yellow-300';
      case 'CONSULTATION':
        return 'border-orange-300';
      case 'MONITOR':
        return 'border-green-300';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Assessment Complete
        </h1>
        <p className="text-gray-600">
          {patientData.patientName ? `Detailed Results for ${patientData.patientName}` : 'Your Assessment Results'}
        </p>
      </div>

      {/* Patient Information */}
      {patientData.patientName && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Patient Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold text-gray-800">
                {patientData.patientName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="text-lg font-semibold text-gray-800">
                {patientData.age} years
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="text-lg font-semibold text-gray-800">
                {patientData.gender}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">NIC</p>
              <p className="text-lg font-semibold text-gray-800">
                {patientData.nic}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Assessment Result */}
      <div
        className={`rounded-lg p-8 mb-8 border-2 ${getRiskBgColor(
          patientData.riskLevel
        )} ${getRiskBorderColor(patientData.riskLevel)}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Risk Assessment</h2>
          <div
            className={`bg-gradient-to-r ${getRiskColor(
              patientData.riskLevel
            )} text-white font-bold py-2 px-6 rounded-full text-sm`}
          >
            {patientData.riskLevel}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Total Risk Score</p>
          <div className="text-5xl font-bold text-gray-800">
            {patientData.totalScore}
          </div>
          <p className="text-xs text-gray-600 mt-1">out of 18 possible points</p>
        </div>

        {patientData.hasRedFlag && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-800 font-semibold">
              ⚠️ Critical Symptoms Detected
            </p>
            <p className="text-red-700 text-sm mt-1">
              One or more red flag symptoms have been identified. Immediate
              medical attention is recommended.
            </p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-8 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recommendations
        </h3>
        <div className="text-base text-gray-700 whitespace-pre-line leading-relaxed">
          {patientData.recommendations}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onRestart}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
        >
          Start New Assessment
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-200"
        >
          Print Results
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          ⚠️ DISCLAIMER: This questionnaire is for informational purposes only
          and is not a substitute for professional medical advice. Always
          consult with a qualified healthcare provider for proper diagnosis and
          treatment.
        </p>
      </div>
    </div>
  );
}
