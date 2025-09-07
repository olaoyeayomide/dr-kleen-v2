import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApiService } from "../../services/adminApi";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors as user types
    if (errors[name]) {
      setErrors((prev) => {
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
    setServerError(null);
    setErrors({});
    setDebugInfo(null);
    setShowEmailPreview(false);

    try {
      console.log("🔄 Starting admin login request...");

      const response = await adminApiService.login(
        formData.email,
        formData.password
      );

      console.log("✅ Login successful:", response);

      // Update auth context
      await login(formData.email, formData.password);

      // Navigate to dashboard
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("❌ Login error:", error);

      // Log detailed error information for debugging
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        formData: { email: formData.email }, // Don't log password
      };
      setDebugInfo(errorDetails);
      console.log("🔍 Debug info:", errorDetails);

      // Handle specific error responses from backend
      try {
        const errorMessage = error.message;

        // Check for specific error patterns and codes
        if (
          errorMessage.includes("Invalid credentials") ||
          errorMessage.includes("INVALID_CREDENTIALS") ||
          errorMessage.includes("Invalid email or password")
        ) {
          console.log("🔐 Invalid credentials");
          setErrors({
            general:
              "Invalid email or password. Please check your credentials and try again.",
          });
          return;
        }

        if (
          errorMessage.includes("Account not verified") ||
          errorMessage.includes("EMAIL_NOT_VERIFIED") ||
          errorMessage.includes("not verified")
        ) {
          console.log("📧 Email not verified");
          setServerError(
            "Email not verified. Please check your email for the verification link."
          );
          setShowEmailPreview(true);
          return;
        }

        if (
          errorMessage.includes("Account not found") ||
          errorMessage.includes("USER_NOT_FOUND") ||
          errorMessage.includes("not found")
        ) {
          console.log("👤 Account not found");
          setErrors({
            email: "No admin account found with this email address.",
          });
          return;
        }

        if (
          errorMessage.includes("Account inactive") ||
          errorMessage.includes("ACCOUNT_INACTIVE") ||
          errorMessage.includes("inactive")
        ) {
          console.log("🚫 Account inactive");
          setServerError(
            "Account is inactive. Please contact support for assistance."
          );
          return;
        }

        if (
          errorMessage.includes("Account temporarily locked") ||
          errorMessage.includes("ACCOUNT_LOCKED") ||
          errorMessage.includes("locked")
        ) {
          console.log("🔒 Account locked");
          setServerError(
            "Account temporarily locked due to multiple failed login attempts. Please try again later."
          );
          return;
        }

        if (
          errorMessage.includes("DATABASE_CONNECTION_ERROR") ||
          errorMessage.includes("DATABASE_ERROR")
        ) {
          console.log("🗄️ Database error");
          setServerError(
            "Database connection error. Please try again in a few moments."
          );
          return;
        }

        if (
          errorMessage.includes("NETWORK_ERROR") ||
          errorMessage.includes("Failed to fetch")
        ) {
          console.log("🌐 Network error");
          setServerError(
            "Network connection error. Please check your internet connection and try again."
          );
          return;
        }

        if (errorMessage.includes("SERVER_CONFIGURATION_ERROR")) {
          console.log("⚙️ Server configuration error");
          setServerError("Server configuration error. Please contact support.");
          return;
        }

        // Handle HTTP status-based errors
        if (errorMessage.includes("HTTP 401")) {
          console.log("🔒 Authentication error");
          setErrors({
            general:
              "Authentication failed. Please check your email and password.",
          });
          return;
        }

        if (errorMessage.includes("HTTP 403")) {
          console.log("🚫 Authorization error");
          setServerError("Access denied. You may not have admin privileges.");
          return;
        }

        if (errorMessage.includes("HTTP 503")) {
          console.log("🚧 Service unavailable");
          setServerError(
            "Service temporarily unavailable. Please try again later."
          );
          return;
        }

        // Generic fallback error
        console.log("❓ Generic error");
        setServerError(errorMessage || "Login failed. Please try again.");
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError);
        setServerError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEmailPreview = () => {
    const url = `https://rrremqkkrmgjwmvwofzk.supabase.co/functions/v1/email-display?email=${encodeURIComponent(
      formData.email
    )}`;
    window.open(
      url,
      "_blank",
      "width=800,height=600,scrollbars=yes,resizable=yes"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access Dr. Kleen admin dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Login Failed
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {serverError && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Server Error
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{serverError}</p>

                  {showEmailPreview && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={openEmailPreview}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        📧 View Verification Email
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {debugInfo && process.env.NODE_ENV === "development" && (
            <div
              className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative text-xs"
              role="alert"
            >
              <details>
                <summary className="font-medium cursor-pointer">
                  🔍 Debug Information (Development Only)
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.email ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your admin email address"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
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
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/admin/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Need to register an admin account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
