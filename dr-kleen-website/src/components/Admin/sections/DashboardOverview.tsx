import React from 'react';
import { DashboardData } from '../../../services/adminApi';

interface DashboardOverviewProps {
  dashboardData: DashboardData | null;
  onRefresh: () => void;
  error: string | null;
}

export default function DashboardOverview({ dashboardData, onRefresh, error }: DashboardOverviewProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <i className="fas fa-exclamation-triangle text-red-600 text-2xl mr-3"></i>
          <h3 className="text-lg font-semibold text-red-800">Unable to Load Dashboard</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <i className="fas fa-refresh mr-2"></i>
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { stats, recentActivity, chartData } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Real-time insights into your Dr. Kleen business</p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Refresh Data
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBookings || 0}</p>
              <p className="text-sm text-green-600">+{stats.recentBookings || 0} this week</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-calendar-check text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        {/* Total Inquiries */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalInquiries || 0}</p>
              <p className="text-sm text-yellow-600">{stats.newInquiries || 0} need attention</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-envelope text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>

        {/* Product Value */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inventory Value</p>
              <p className="text-3xl font-bold text-gray-900">${(stats.totalProductValue || 0).toLocaleString()}</p>
              <p className="text-sm text-red-600">{stats.lowStockProducts || 0} items low stock</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-box text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageRating || '0'}</p>
              <p className="text-sm text-green-600">{stats.recentTestimonials || 0} new reviews</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-star text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Status Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Bookings by Status</h3>
          {chartData.bookingsByStatus && Object.keys(chartData.bookingsByStatus).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(chartData.bookingsByStatus).map(([status, count]) => {
                const total = Object.values(chartData.bookingsByStatus).reduce((sum, val) => sum + val, 0);
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                const colors = {
                  pending: 'bg-yellow-500',
                  completed: 'bg-green-500',
                  cancelled: 'bg-red-500'
                };
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${colors[status as keyof typeof colors] || 'bg-gray-500'}`}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No booking data available</p>
            </div>
          )}
        </div>

        {/* Inquiries Priority Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Inquiries by Priority</h3>
          {chartData.inquiriesByPriority && Object.keys(chartData.inquiriesByPriority).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(chartData.inquiriesByPriority).map(([priority, count]) => {
                const total = Object.values(chartData.inquiriesByPriority).reduce((sum, val) => sum + val, 0);
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                const colors = {
                  high: 'bg-red-500',
                  medium: 'bg-yellow-500',
                  low: 'bg-green-500'
                };
                
                return (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${colors[priority as keyof typeof colors] || 'bg-gray-500'}`}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">{priority}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No inquiry data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">6-Month Trends</h3>
        {chartData.monthlyTrends ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">Bookings</h4>
              <div className="space-y-2">
                {chartData.monthlyTrends.bookings && chartData.monthlyTrends.bookings.length > 0 ? 
                  chartData.monthlyTrends.bookings.map((month, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{month.month}</span>
                      <span className="font-medium text-blue-600">{month.count}</span>
                    </div>
                  )) : <p className="text-gray-500 text-sm">No data available</p>
                }
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">Inquiries</h4>
              <div className="space-y-2">
                {chartData.monthlyTrends.inquiries && chartData.monthlyTrends.inquiries.length > 0 ? 
                  chartData.monthlyTrends.inquiries.map((month, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{month.month}</span>
                      <span className="font-medium text-yellow-600">{month.count}</span>
                    </div>
                  )) : <p className="text-gray-500 text-sm">No data available</p>
                }
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">Service Requests</h4>
              <div className="space-y-2">
                {chartData.monthlyTrends.serviceRequests && chartData.monthlyTrends.serviceRequests.length > 0 ? 
                  chartData.monthlyTrends.serviceRequests.map((month, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{month.month}</span>
                      <span className="font-medium text-green-600">{month.count}</span>
                    </div>
                  )) : <p className="text-gray-500 text-sm">No data available</p>
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No trend data available</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          <button className="text-sm text-primary hover:text-primary/80">
            View all activity
          </button>
        </div>
        {recentActivity && recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const typeIcons = {
                inquiry: 'fas fa-envelope text-yellow-600',
                booking: 'fas fa-calendar-check text-blue-600',
                testimonial: 'fas fa-star text-yellow-600',
                product: 'fas fa-box text-green-600'
              };
              
              return (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <i className={`${typeIcons[activity.type as keyof typeof typeIcons] || 'fas fa-info text-gray-600'} text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl text-gray-300 mb-2">
              <i className="fas fa-history"></i>
            </div>
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <i className="fas fa-plus text-blue-600 text-2xl mb-2"></i>
            <p className="text-sm font-medium text-gray-700">Add Service</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <i className="fas fa-box text-green-600 text-2xl mb-2"></i>
            <p className="text-sm font-medium text-gray-700">Add Product</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <i className="fas fa-envelope text-yellow-600 text-2xl mb-2"></i>
            <p className="text-sm font-medium text-gray-700">View Inquiries</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <i className="fas fa-chart-bar text-purple-600 text-2xl mb-2"></i>
            <p className="text-sm font-medium text-gray-700">View Reports</p>
          </button>
        </div>
      </div>
    </div>
  );
}