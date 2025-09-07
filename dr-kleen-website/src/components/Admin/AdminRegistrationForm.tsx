import React, { useState } from 'react';
import { adminApiService, AdminRegistrationResponse } from '../../services/adminApi';
import { Link } from 'react-router-dom';

export default function AdminRegistrationForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<AdminRegistrationResponse | null>(null);
  const [registrationLimitReached, setRegistrationLimitReached] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation (8+ chars, mixed case, numbers, symbols)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, numbers, and symbols';
      }
    }

    // Full name validation
    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors as user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setRegistrationLimitReached(false);
    setServerError(null);
    setErrors({});
    setDebugInfo(null);

    try {
      console.log('🔄 Starting admin registration request...');
      
      const response = await adminApiService.registerAdmin(
        formData.email,
        formData.password,
        formData.full_name
      );
      
      console.log('✅ Registration successful:', response);
      setRegistrationSuccess(response);
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      // Log detailed error information for debugging
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        formData: { email: formData.email, full_name: formData.full_name } // Don't log password
      };
      setDebugInfo(errorDetails);
      console.log('🔍 Debug info:', errorDetails);
      
      // Handle specific error responses from backend
      try {
        // Try to parse detailed error response
        const errorMessage = error.message;
        
        // Check for specific error patterns and codes
        if (errorMessage.includes('Maximum admin limit reached') || 
            errorMessage.includes('ADMIN_LIMIT_REACHED') ||
            errorMessage.includes('admin limit')) {
          console.log('🚫 Admin limit reached');
          setRegistrationLimitReached(true);
          return;
        }
        
        if (errorMessage.includes('Email already exists') ||
            errorMessage.includes('EMAIL_ALREADY_EXISTS')) {
          console.log('📧 Email already exists');
          setErrors({ email: 'This email address is already registered as an admin account.' });
          return;
        }
        
        if (errorMessage.includes('Invalid email format') ||
            errorMessage.includes('INVALID_EMAIL_FORMAT')) {
          console.log('📧 Invalid email format');
          setErrors({ email: 'Please enter a valid email address.' });
          return;
        }
        
        if (errorMessage.includes('Password requirements not met') ||
            errorMessage.includes('WEAK_PASSWORD')) {
          console.log('🔐 Weak password');
          setErrors({ password: 'Password must be at least 8 characters with uppercase, lowercase, numbers, and symbols.' });
          return;
        }
        
        if (errorMessage.includes('VALIDATION_ERROR')) {
          console.log('✏️ Validation error');
          setErrors({ general: 'Please fill in all required fields correctly.' });
          return;
        }
        
        if (errorMessage.includes('DATABASE_CONNECTION_ERROR') ||
            errorMessage.includes('DATABASE_ERROR')) {
          console.log('🗄️ Database error');
          setServerError('Database connection error. Please try again in a few moments.');
          return;
        }
        
        if (errorMessage.includes('NETWORK_ERROR') ||
            errorMessage.includes('Failed to fetch')) {
          console.log('🌐 Network error');
          setServerError('Network connection error. Please check your internet connection and try again.');
          return;
        }
        
        if (errorMessage.includes('USER_CREATION_FAILED')) {
          console.log('👤 User creation failed');
          setServerError('Failed to create admin account. Please try again later.');
          return;
        }
        
        if (errorMessage.includes('SERVER_CONFIGURATION_ERROR')) {
          console.log('⚙️ Server configuration error');
          setServerError('Server configuration error. Please contact support.');
          return;
        }
        
        // Handle HTTP status-based errors
        if (errorMessage.includes('HTTP 401')) {
          console.log('🔒 Authentication error');
          setServerError('Authentication error. Please refresh the page and try again.');
          return;
        }
        
        if (errorMessage.includes('HTTP 403')) {
          console.log('🚫 Authorization error');
          setServerError('Authorization error. You may not have permission to perform this action.');
          return;
        }
        
        if (errorMessage.includes('HTTP 503')) {
          console.log('🚧 Service unavailable');
          setServerError('Service temporarily unavailable. Please try again later.');
          return;
        }
        
        // Generic fallback error
        console.log('❓ Generic error');
        setServerError(errorMessage || 'Registration failed. Please try again.');
        
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        setServerError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationLimitReached) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Registration Limit Reached</h2>
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-700">
                  <strong>Admin slots full (2/2)</strong>
                </p>
                <p className="text-sm text-red-600 mt-2">
                  The maximum number of admin users has been reached. No new registrations are allowed at this time.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  to="/admin/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Registration Successful!</h2>
              <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-700">
                  <strong>Welcome, {registrationSuccess.email}!</strong>
                </p>
                <p className="text-sm text-green-600 mt-2">
                  {registrationSuccess.message}
                </p>
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-700">
                  <strong>📧 Important: Check Your Email</strong>
                </p>
                <div className="text-sm text-blue-600 mt-2 space-y-2">
                  <p>We've sent a verification email to <strong>{registrationSuccess.email}</strong></p>
                  <div className="bg-white border border-blue-200 rounded p-3 mt-3">
                    <p className="font-medium text-blue-800 mb-2">🚀 Quick Access Options:</p>
                    <div className="space-y-2">
                      <a 
                        href={`/admin/emails?email=${encodeURIComponent(registrationSuccess.email)}`}
                        className="block w-full text-center py-2 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📧 View Your Verification Email
                      </a>
                      <p className="text-xs text-blue-600 text-center">
                        Can't access your email? Use the link above to view your verification message
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-700">
                  <strong>⚡ Next Steps:</strong>
                </p>
                <ol className="text-sm text-yellow-600 mt-2 text-left space-y-1 list-decimal list-inside">
                  <li>Click the verification link in your email (or use the button above)</li>
                  <li>Complete email verification to activate your account</li>
                  <li>Return here to log in with your verified account</li>
                  <li>Start managing Dr. Kleen's admin portal!</li>
                </ol>
              </div>
              <div className="mt-6 flex space-x-3">
                <Link
                  to="/admin/login"
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  🔐 Go to Login
                </Link>
                <a
                  href={`/admin/emails?email=${encodeURIComponent(registrationSuccess.email)}`}
                  className="flex-1 flex justify-center py-2 px-4 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📧 View Emails
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Register Admin Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create a new admin account for Dr. Kleen
            <br />
            <span className="text-blue-600">Maximum 2 admin accounts allowed</span>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Validation Error</h3>
                  <p className="text-sm text-red-700 mt-1">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Server Error</h3>
                  <p className="text-sm text-red-700 mt-1">{serverError}</p>
                </div>
              </div>
            </div>
          )}

          {debugInfo && process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative text-xs" role="alert">
              <details>
                <summary className="font-medium cursor-pointer">🔍 Debug Information (Development Only)</summary>
                <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
              </details>
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.full_name ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleInputChange}
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <div className="mt-1 text-xs text-gray-500">
                Must be 8+ characters with uppercase, lowercase, numbers, and symbols
              </div>
            </div>
          </div>

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
                  Registering...
                </>
              ) : (
                'Register Admin Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/admin/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}