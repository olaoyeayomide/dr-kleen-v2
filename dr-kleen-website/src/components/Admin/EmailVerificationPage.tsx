import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { adminApiService, EmailVerificationResponse } from '../../services/adminApi';

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error' | 'invalid-token'>('verifying');
  const [verificationData, setVerificationData] = useState<EmailVerificationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setVerificationStatus('invalid-token');
      setErrorMessage('No verification token provided in the URL.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      setVerificationStatus('verifying');
      const response = await adminApiService.verifyEmail(token);
      setVerificationData(response);
      setVerificationStatus('success');
    } catch (error: any) {
      console.error('Email verification error:', error);
      
      if (error.message.includes('Invalid or expired')) {
        setVerificationStatus('invalid-token');
        setErrorMessage('The verification link is invalid or has expired.');
      } else if (error.message.includes('Token has expired')) {
        setVerificationStatus('invalid-token');
        setErrorMessage('The verification token has expired. Please request a new verification email.');
      } else {
        setVerificationStatus('error');
        setErrorMessage(error.message || 'Email verification failed. Please try again.');
      }
    }
  };

  const renderVerificationStatus = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Verifying Your Email</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Email Verified Successfully!</h2>
            
            {verificationData && (
              <div className="mt-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-sm text-green-700">
                    <strong>Welcome, {verificationData.user.full_name}!</strong>
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    {verificationData.message}
                  </p>
                </div>
                
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Account Details:</strong>
                  </p>
                  <div className="text-sm text-blue-600 mt-2 text-left">
                    <p>• Email: {verificationData.user.email}</p>
                    <p>• Role: {verificationData.user.role}</p>
                    <p>• Status: Active</p>
                    <p>• Registration: {new Date(verificationData.user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <Link
                to="/admin/login"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Access Admin Dashboard
              </Link>
            </div>
          </div>
        );

      case 'invalid-token':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Invalid Verification Link</h2>
            
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-700">
                <strong>Verification Failed</strong>
              </p>
              <p className="text-sm text-yellow-600 mt-2">
                {errorMessage}
              </p>
            </div>
            
            <div className="mt-6 space-y-3">
              <p className="text-sm text-gray-600">
                If you believe this is an error, please try registering again or contact support.
              </p>
              <div className="flex space-x-3 justify-center">
                <Link
                  to="/admin/register"
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register Again
                </Link>
                <Link
                  to="/admin/login"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Verification Failed</h2>
            
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-700">
                <strong>Something went wrong</strong>
              </p>
              <p className="text-sm text-red-600 mt-2">
                {errorMessage}
              </p>
            </div>
            
            <div className="mt-6 space-y-3">
              <p className="text-sm text-gray-600">
                Please try again or contact support if the problem persists.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
                <Link
                  to="/admin/login"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {renderVerificationStatus()}
        </div>
        
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Dr. Kleen Website
          </Link>
        </div>
      </div>
    </div>
  );
}