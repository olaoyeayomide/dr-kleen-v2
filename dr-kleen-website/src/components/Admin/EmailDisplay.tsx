import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function EmailDisplay() {
  const [searchParams] = useSearchParams();
  const [emailContent, setEmailContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    const fetchEmail = async () => {
      if (!email && !token) {
        setError('No email or token provided');
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams();
        if (email) params.set('email', email);
        if (token) params.set('token', token);

        const response = await fetch(`https://rrremqkkrmgjwmvwofzk.supabase.co/functions/v1/email-display?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch email');
        }

        const content = await response.text();
        setEmailContent(content);
      } catch (err) {
        console.error('Failed to fetch email:', err);
        setError('Failed to load email content');
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [email, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading email...</p>
        </div>
      </div>
    );
  }

  if (error || !emailContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Email Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">{error || 'The requested email could not be found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-gray-900">📧 Email Preview</h1>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✅ Ready to Send
            </span>
            <button
              onClick={() => window.close()}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div 
          className="bg-white rounded-lg shadow-sm border"
          dangerouslySetInnerHTML={{ __html: emailContent }}
        />
      </div>
      
      <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-6">
        <p className="text-sm text-gray-500 text-center">
          💡 <strong>Note:</strong> This is a preview of the email that would be sent. In production, this email would be delivered to the recipient's inbox.
        </p>
      </div>
    </div>
  );
}