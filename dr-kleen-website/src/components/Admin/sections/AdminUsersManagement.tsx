import React, { useState, useEffect } from 'react';
import { adminApiService, AdminUsersData, AdminUser } from '../../../services/adminApi';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';

export default function AdminUsersManagement() {
  const { adminUser } = useAdminAuth();
  const [adminUsersData, setAdminUsersData] = useState<AdminUsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ user: AdminUser; show: boolean }>({ user: {} as AdminUser, show: false });

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminApiService.getAdminUsers();
      setAdminUsersData(data);
    } catch (error: any) {
      console.error('Failed to load admin users:', error);
      setError(error.message || 'Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (deletingUserId || !adminUser) return;

    // Prevent admin from deleting themselves
    if (userId === adminUser.id) {
      setError('You cannot delete your own account');
      return;
    }

    try {
      setDeletingUserId(userId);
      setError('');
      
      await adminApiService.deleteAdminUser(userId);
      
      // Reload the admin users list
      await loadAdminUsers();
      
      // Close confirmation dialog
      setShowDeleteConfirm({ user: {} as AdminUser, show: false });
      
    } catch (error: any) {
      console.error('Failed to delete admin user:', error);
      setError(error.message || 'Failed to delete admin user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (user: AdminUser) => {
    if (!user.is_email_verified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending Verification
        </span>
      );
    } else if (user.is_active && user.is_email_verified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Inactive
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Users Management</h1>
            <p className="text-gray-600">View and manage admin user accounts</p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Users Management</h1>
          <p className="text-gray-600">View and manage admin user accounts. Maximum 2 admin accounts allowed.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadAdminUsers}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <i className="fas fa-refresh mr-2"></i>
            Refresh
          </button>
          <a
            href="/admin/register"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center"
          >
            <i className="fas fa-user-plus mr-2"></i>
            Register New Admin
          </a>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {adminUsersData ? (
            <>
              {/* Admin Stats */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{adminUsersData.count.total}</div>
                    <div className="text-sm text-gray-500">Total Admins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{adminUsersData.count.active}</div>
                    <div className="text-sm text-gray-500">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{adminUsersData.count.pending_verification}</div>
                    <div className="text-sm text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{adminUsersData.count.max_allowed}</div>
                    <div className="text-sm text-gray-500">Max Allowed</div>
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <span className={`text-sm font-medium ${
                    adminUsersData.count.total >= adminUsersData.count.max_allowed 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {adminUsersData.count.total >= adminUsersData.count.max_allowed 
                      ? 'Admin slots full' 
                      : `${adminUsersData.count.max_allowed - adminUsersData.count.total} slot(s) available`
                    }
                  </span>
                </div>
              </div>

              {/* Admin Users List */}
              <div className="overflow-hidden">
                {adminUsersData.users.length > 0 ? (
                  <div className="space-y-4">
                    {adminUsersData.users.map((user) => (
                      <div key={user.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                user.id === adminUser?.id ? 'bg-blue-500' : 'bg-gray-400'
                              }`}>
                                {user.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {user.full_name}
                                    {user.id === adminUser?.id && (
                                      <span className="ml-2 text-xs text-blue-600">(You)</span>
                                    )}
                                  </h4>
                                  {getStatusBadge(user)}
                                </div>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <div className="text-xs text-gray-400 mt-1 space-y-1">
                                  <div>Role: {user.role}</div>
                                  <div>Created: {formatDate(user.created_at)}</div>
                                  {user.last_login && (
                                    <div>Last Login: {formatDate(user.last_login)}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex items-center space-x-2">
                            {user.id !== adminUser?.id && (
                              <button
                                onClick={() => setShowDeleteConfirm({ user, show: true })}
                                disabled={deletingUserId === user.id}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingUserId === user.id ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Deleting...
                                  </>
                                ) : (
                                  'Delete'
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl text-gray-300 mb-4">
                      <i className="fas fa-users-cog"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Admin Users Found</h3>
                    <p className="text-gray-500 mb-6">Get started by registering the first admin user.</p>
                    <a
                      href="/admin/register"
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center"
                    >
                      <i className="fas fa-user-plus mr-2"></i>
                      Register First Admin
                    </a>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Failed to load admin users.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Admin User</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the admin user 
                  <span className="font-semibold">{showDeleteConfirm.user.full_name}</span>?
                </p>
                <p className="text-sm text-red-600 mt-2">
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 px-7 py-3">
                <button
                  onClick={() => setShowDeleteConfirm({ user: {} as AdminUser, show: false })}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm.user.id)}
                  disabled={deletingUserId === showDeleteConfirm.user.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingUserId === showDeleteConfirm.user.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}