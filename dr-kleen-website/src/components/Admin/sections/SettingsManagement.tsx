import React from 'react';

export default function SettingsManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">System settings and configuration</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mb-4">
            <i className="fas fa-cog"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">System Settings</h3>
          <p className="text-gray-500">This section will allow you to configure system settings and preferences.</p>
        </div>
      </div>
    </div>
  );
}