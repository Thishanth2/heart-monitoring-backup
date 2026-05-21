'use client';

import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: string;
  status: 'normal' | 'warning' | 'critical';
  normalRange: string;
}

export default function MetricCard({ 
  title, 
  value, 
  unit, 
  icon, 
  status,
  normalRange 
}: MetricCardProps) {
  const statusColors = {
    normal: 'border-green-500 bg-green-50 dark:bg-green-950',
    warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
    critical: 'border-red-500 bg-red-50 dark:bg-red-950'
  };

  const statusTextColors = {
    normal: 'text-green-700 dark:text-green-300',
    warning: 'text-yellow-700 dark:text-yellow-300',
    critical: 'text-red-700 dark:text-red-300'
  };

  const statusDotColors = {
    normal: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500'
  };

  return (
    <div className={`rounded-2xl border-2 p-6 shadow-lg transition-all hover:shadow-xl ${statusColors[status]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{icon}</span>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {title}
            </h3>
          </div>
          
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-gray-900 dark:text-white">
                {value}
              </span>
              <span className="text-2xl font-medium text-gray-600 dark:text-gray-400">
                {unit}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${statusDotColors[status]} animate-pulse`}></span>
            <span className={`text-sm font-medium ${statusTextColors[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Normal: {normalRange}
          </div>
        </div>
      </div>
    </div>
  );
}
