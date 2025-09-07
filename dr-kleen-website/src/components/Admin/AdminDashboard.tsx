import React from 'react';
import { AdminAuthProvider, AdminRoute } from '../../contexts/AdminAuthContext';
import AdminLayout from './AdminLayout';
import ComprehensiveAdminDashboard from './ComprehensiveAdminDashboard';

const AdminDashboard: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminRoute>
        <AdminLayout>
          <ComprehensiveAdminDashboard />
        </AdminLayout>
      </AdminRoute>
    </AdminAuthProvider>
  );
};

export default AdminDashboard;