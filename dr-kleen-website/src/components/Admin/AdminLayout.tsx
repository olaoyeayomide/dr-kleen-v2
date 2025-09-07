import React, { useState } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  name: string;
  icon: string;
  path: string;
  badge?: number;
}

interface AdminLayoutState {
  activeSection: string;
  sidebarOpen: boolean;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { adminUser, logout } = useAdminAuth();
  const [state, setState] = useState<AdminLayoutState>({
    activeSection: 'dashboard',
    sidebarOpen: true
  });

  const navigationItems: NavItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-chart-line', path: '/admin' },
    { id: 'inquiries', name: 'Inquiries', icon: 'fas fa-envelope', path: '/admin/inquiries', badge: 0 },
    { id: 'bookings', name: 'Bookings', icon: 'fas fa-calendar-check', path: '/admin/bookings' },
    { id: 'services', name: 'Services', icon: 'fas fa-tools', path: '/admin/services' },
    { id: 'products', name: 'Products', icon: 'fas fa-box', path: '/admin/products' },
    { id: 'testimonials', name: 'Testimonials', icon: 'fas fa-comments', path: '/admin/testimonials' },
    { id: 'content', name: 'Content', icon: 'fas fa-edit', path: '/admin/content' },
    { id: 'analytics', name: 'Analytics', icon: 'fas fa-chart-bar', path: '/admin/analytics' },
    { id: 'users', name: 'Admin Users', icon: 'fas fa-users-cog', path: '/admin/users' },
    { id: 'settings', name: 'Settings', icon: 'fas fa-cog', path: '/admin/settings' }
  ];

  const handleNavigation = (sectionId: string) => {
    setState(prev => ({ ...prev, activeSection: sectionId }));
  };

  const toggleSidebar = () => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${state.sidebarOpen ? 'w-64' : 'w-16'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-shield-alt text-white text-sm"></i>
            </div>
            {state.sidebarOpen && (
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">Dr. Kleen</h1>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          <div className="px-3">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center px-3 py-2 mb-1 text-left rounded-lg transition-colors duration-200 ${
                  state.activeSection === item.id
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <i className={`${item.icon} w-5`}></i>
                {state.sidebarOpen && (
                  <>
                    <span className="ml-3 font-medium">{item.name}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <i className="fas fa-bars text-lg"></i>
              </button>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-800 capitalize">
                  {state.activeSection === 'dashboard' ? 'Dashboard Overview' : state.activeSection}
                </h2>
                <p className="text-sm text-gray-600">Manage your Dr. Kleen business</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <i className="fas fa-bell"></i>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <i className="fas fa-plus mr-2"></i>
                  Quick Add
                </button>
              </div>

              {/* Admin Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{adminUser?.full_name}</p>
                  <p className="text-xs text-gray-500">{adminUser?.role}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={handleLogout}
                    className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors"
                    title="Sign Out"
                  >
                    <i className="fas fa-user text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {React.cloneElement(children as React.ReactElement, { activeSection: state.activeSection })}
          </div>
        </main>
      </div>
    </div>
  );
}