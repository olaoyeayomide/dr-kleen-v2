import React from 'react';
import { DashboardData } from '../../../services/adminApi';

interface AnalyticsSectionProps {
  dashboardData: DashboardData | null;
}

export default function AnalyticsSection({ dashboardData }: AnalyticsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Detailed business analytics and performance reports</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <i className="fas fa-download mr-2"></i>
          Export Report
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mb-4">
            <i className="fas fa-chart-bar"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Advanced Analytics</h3>
          <p className="text-gray-500">This section will provide detailed analytics, charts, and business intelligence reports.</p>
        </div>
      </div>
    </div>
  );
}