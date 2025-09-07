import React, { useState, useEffect } from 'react';
import { adminApiService } from '../../../services/adminApi';
import { Booking } from '../../../types';

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({ status: '' });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getEntityData('bookings');
      setBookings(data);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setError(err.message);
      
      // Mock data for demo
      const mockBookings: Booking[] = [
        {
          id: 1,
          customer_name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '(555) 123-4567',
          service_type: 'Residential Deep Cleaning',
          booking_date: '2025-01-28',
          status: 'confirmed',
          created_at: '2025-01-25T09:30:00Z'
        },
        {
          id: 2,
          customer_name: 'Emily Davis',
          email: 'emily.davis@company.com',
          phone: '(555) 987-6543',
          service_type: 'Office Cleaning',
          booking_date: '2025-01-30',
          status: 'pending',
          created_at: '2025-01-24T14:20:00Z'
        },
        {
          id: 3,
          customer_name: 'Michael Johnson',
          email: 'michael.j@email.com',
          phone: '(555) 456-7890',
          service_type: 'Carpet Cleaning',
          booking_date: '2025-01-26',
          status: 'completed',
          created_at: '2025-01-20T11:15:00Z'
        },
        {
          id: 4,
          customer_name: 'Sarah Wilson',
          email: 'sarah.wilson@email.com',
          service_type: 'Window Cleaning',
          booking_date: '2025-02-01',
          status: 'cancelled',
          created_at: '2025-01-22T16:45:00Z'
        }
      ];
      setBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBooking = async (id: number, updateData: Partial<Booking>) => {
    try {
      const updated = await adminApiService.updateEntity('bookings', id, updateData);
      setBookings(prev => prev.map(booking => 
        booking.id === id ? { ...booking, ...updated } : booking
      ));
      setShowModal(false);
      setSelectedBooking(null);
    } catch (err: any) {
      console.error('Failed to update booking:', err);
      alert('Failed to update booking: ' + err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'fas fa-clock';
      case 'confirmed': return 'fas fa-check';
      case 'in_progress': return 'fas fa-spinner';
      case 'completed': return 'fas fa-check-circle';
      case 'cancelled': return 'fas fa-times-circle';
      default: return 'fas fa-question';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Manage customer bookings and appointments</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <i className="fas fa-plus mr-2"></i>
          New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ status: '' })}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            <span>Using demo data: {error}</span>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                      <div className="text-sm text-gray-500">{booking.email}</div>
                      {booking.phone && <div className="text-sm text-gray-500">{booking.phone}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{booking.service_type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'Not specified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status || 'pending')}`}>
                      <i className={`${getStatusIcon(booking.status || 'pending')} mr-1`}></i>
                      {booking.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.created_at || '').toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowModal(true);
                        }}
                        className="text-primary hover:text-primary/80"
                        title="Edit booking"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="text-blue-600 hover:text-blue-800" title="View details">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="text-red-600 hover:text-red-800" title="Cancel booking">
                        <i className="fas fa-ban"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Booking</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={selectedBooking.status || 'pending'}
                    onChange={(e) => setSelectedBooking(prev => prev ? { ...prev, status: e.target.value } : null)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking Date</label>
                  <input
                    type="date"
                    value={selectedBooking.booking_date || ''}
                    onChange={(e) => setSelectedBooking(prev => prev ? { ...prev, booking_date: e.target.value } : null)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleUpdateBooking(selectedBooking.id!, selectedBooking)}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedBooking(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => {
          const count = bookings.filter(b => (b.status || 'pending') === status).length;
          const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
          };
          
          return (
            <div key={status} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${colors[status as keyof typeof colors]}`}>
                  <i className={getStatusIcon(status)}></i>
                </div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}