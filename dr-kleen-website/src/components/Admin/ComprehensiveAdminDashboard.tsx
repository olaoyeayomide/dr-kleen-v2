import React, { useState, useEffect } from 'react';
import { adminApiService, DashboardData } from '../../services/adminApi';
import DashboardOverview from './sections/DashboardOverview';
import InquiriesManagement from './sections/InquiriesManagement';
import BookingsManagement from './sections/BookingsManagement';
import ServicesManagement from './sections/ServicesManagement';
import ProductsManagement from './sections/ProductsManagement';
import TestimonialsManagement from './sections/TestimonialsManagement';
import ContentManagement from './sections/ContentManagement';
import AnalyticsSection from './sections/AnalyticsSection';
import AdminUsersManagement from './sections/AdminUsersManagement';
import SettingsManagement from './sections/SettingsManagement';

interface ComprehensiveAdminDashboardProps {
  activeSection?: string;
}

export default function ComprehensiveAdminDashboard({ activeSection = 'dashboard' }: ComprehensiveAdminDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (activeSection !== 'dashboard') {
        return; // Only load dashboard data for the dashboard section
      }

      try {
        setLoading(true);
        setError(null);
        const data = await adminApiService.getDashboardOverview();
        setDashboardData(data);
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
        setDashboardData(null); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeSection, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading && activeSection === 'dashboard') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render appropriate section based on activeSection
  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardOverview 
            dashboardData={dashboardData}
            onRefresh={handleRefresh}
            error={error}
          />
        );
        
      case 'inquiries':
        return <InquiriesManagement />;
        
      case 'bookings':
        return <BookingsManagement />;
        
      case 'services':
        return <ServicesManagement onUpdate={handleRefresh} />;
        
      case 'products':
        return <ProductsManagement onUpdate={handleRefresh} />;
        
      case 'testimonials':
        return <TestimonialsManagement />;
        
      case 'content':
        return <ContentManagement />;
        
      case 'analytics':
        return <AnalyticsSection dashboardData={dashboardData} />;
        
      case 'users':
        return <AdminUsersManagement />;
        
      case 'settings':
        return <SettingsManagement />;
        
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200">
            <div className="text-center">
              <div className="text-6xl text-gray-300 mb-4">
                <i className="fas fa-construction"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Section Not Found</h3>
              <p className="text-gray-500">The requested admin section could not be found.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderSection()}
    </div>
  );
}