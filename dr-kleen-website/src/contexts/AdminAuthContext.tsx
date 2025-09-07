import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { adminApiService, AdminUser } from '../services/adminApi';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { user, valid } = await adminApiService.verifyToken();
      
      if (valid && user) {
        setAdminUser(user);
        setIsAuthenticated(true);
        return true;
      } else {
        setAdminUser(null);
        setIsAuthenticated(false);
        adminApiService.clearAdminToken();
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAdminUser(null);
      setIsAuthenticated(false);
      adminApiService.clearAdminToken();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const { user, token } = await adminApiService.login(email, password);
      
      setAdminUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    adminApiService.clearAdminToken();
    setAdminUser(null);
    setIsAuthenticated(false);
  };

  const value: AdminAuthContextType = {
    adminUser,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

// Admin route guard component
export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <AdminLoginForm />
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

// Admin login form component
function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const { login } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError({
        code: 'VALIDATION_ERROR',
        message: 'Email and password are required',
        details: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      setShowResendVerification(false);
      await login(email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error types
      if (error.name === 'ApiError' && error.message) {
        try {
          const errorData = JSON.parse(error.message);
          setError(errorData.error || errorData);
          
          // Show resend verification option for unverified emails
          if (errorData.error?.code === 'EMAIL_NOT_VERIFIED') {
            setShowResendVerification(true);
          }
        } catch (parseError) {
          console.error('Error parsing API error:', parseError);
          setError({
            code: 'PARSE_ERROR',
            message: 'An error occurred during login. Please try again.',
            suggestion: 'Please check your credentials and try again.'
          });
        }
      } else if (error.message && typeof error.message === 'string') {
        // Handle direct string messages
        setError({
          code: 'LOGIN_ERROR',
          message: error.message,
          suggestion: 'Please check your credentials and try again.'
        });
      } else {
        setError({
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred during login.',
          suggestion: 'Please try again or contact support if the problem persists.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError({
        code: 'MISSING_EMAIL',
        message: 'Email address is required to resend verification',
        field: 'email'
      });
      return;
    }

    try {
      setIsResendingVerification(true);
      setError(null);
      
      // Generate a new verification token and resend email
      const response = await fetch('/api/supabase/functions/admin-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'resend_verification',
          email: email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to resend verification email');
      }

      setVerificationEmailSent(true);
      setShowResendVerification(false);
    } catch (err: any) {
      console.error('Resend verification error:', err);
      setError({
        code: 'RESEND_ERROR',
        message: err.message || 'Failed to resend verification email',
        suggestion: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const getErrorSeverity = (errorCode: string) => {
    switch (errorCode) {
      case 'EMAIL_NOT_VERIFIED':
        return 'warning';
      case 'INVALID_CREDENTIALS':
      case 'ACCOUNT_NOT_FOUND':
        return 'error';
      case 'ACCOUNT_INACTIVE':
        return 'info';
      default:
        return 'error';
    }
  };

  const getErrorStyles = (severity: string) => {
    switch (severity) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'error':
      default:
        return 'bg-red-50 border-red-200 text-red-700';
    }
  };

  const getErrorIcon = (severity: string) => {
    switch (severity) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'error':
      default:
        return '❌';
    }
  };

  return (
    <div className="bg-white py-8 px-6 shadow rounded-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center">Admin Portal</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access the Dr. Kleen admin dashboard
        </p>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Error Display */}
        {error && (
          <div className={`border px-4 py-3 rounded relative ${getErrorStyles(getErrorSeverity(error.code))}`} role="alert">
            <div className="flex items-start">
              <span className="text-lg mr-2">{getErrorIcon(getErrorSeverity(error.code))}</span>
              <div className="flex-1">
                <div className="font-medium">{error.message}</div>
                {error.suggestion && (
                  <div className="mt-1 text-sm opacity-90">
                    💡 {error.suggestion}
                  </div>
                )}
                {error.details && (
                  <div className="mt-2 text-sm">
                    <ul className="list-disc list-inside">
                      {Object.entries(error.details).map(([field, message]) => 
                        message ? <li key={field}>{message as string}</li> : null
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Verification Email Sent Success */}
        {verificationEmailSent && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
            <div className="flex items-center">
              <span className="text-lg mr-2">✅</span>
              <div>
                <div className="font-medium">Verification email sent!</div>
                <div className="mt-1 text-sm">
                  Please check your email and click the verification link to activate your account.
                </div>
                <div className="mt-2">
                  <a 
                    href={`/admin/emails?email=${encodeURIComponent(email)}`}
                    className="text-green-600 hover:text-green-800 text-sm font-medium underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📧 View Email Content
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                error?.field === 'email' ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error?.field === 'email') setError(null);
              }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                error?.field === 'password' ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error?.field === 'password') setError(null);
              }}
            />
          </div>
        </div>

        {/* Resend Verification Button */}
        {showResendVerification && (
          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="text-sm text-yellow-800">
              <span className="font-medium">Email not verified?</span> Resend the verification link.
            </div>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResendingVerification}
              className="ml-3 text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:bg-yellow-400 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isResendingVerification ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>📧 Resend</>
              )}
            </button>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">New admin?</span>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <a
            href="/admin/register"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            📝 Register Admin Account
          </a>
          
          <a
            href="/admin/emails"
            className="w-full flex justify-center py-2 px-4 border border-blue-300 rounded-md shadow-sm bg-blue-50 text-sm font-medium text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            📧 View Email Inbox
          </a>
        </div>
      </div>
    </div>
  );
}