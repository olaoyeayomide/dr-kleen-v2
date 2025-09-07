import React, { useState, useEffect } from "react";
import {
  Mail,
  Clock,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface Email {
  id: number;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  html_content: string;
  email_type: string;
  verification_token: string | null;
  status: string;
  created_at: string;
  verification_url?: string | null;
}

interface EmailViewerProps {
  userEmail?: string;
}

export default function EmailViewer({ userEmail }: EmailViewerProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [checkingEmail, setCheckingEmail] = useState("");

  const fetchEmails = async (email?: string) => {
    try {
      setLoading(true);
      setError(null);

      const emailParam = email || checkingEmail;
      if (!emailParam) {
        throw new Error("Email address is required");
      }

      const supabaseUrl =
        import.meta.env.VITE_SUPABASE_URL ||
        "https://rrremqkkrmgjwmvwofzk.supabase.co";
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
        | string
        | undefined;

      // Debug: verify envs are present (masked)
      try {
        const maskedKey = supabaseAnonKey
          ? `${supabaseAnonKey.slice(0, 6)}...len:${supabaseAnonKey.length}`
          : "<missing>";
        console.debug("[EmailViewer] Supabase env check", {
          supabaseUrl,
          anonKeyPresent: Boolean(supabaseAnonKey),
          anonKeyMasked: maskedKey,
        });
        if (supabaseUrl.includes("localhost:5173")) {
          console.warn(
            "[EmailViewer] VITE_SUPABASE_URL appears to point to your frontend dev server (localhost:5173). It must be your Supabase project URL, e.g. https://xyzcompany.supabase.co"
          );
        }
      } catch (e) {
        // no-op
      }

      const url = `${supabaseUrl}/functions/v1/email-display?email=${encodeURIComponent(
        emailParam
      )}`;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (supabaseAnonKey) {
        headers["Authorization"] = `Bearer ${supabaseAnonKey}`;
        headers["apikey"] = supabaseAnonKey;
      }

      const response = await fetch(url, { method: "GET", headers });

      // Try to parse JSON safely; tolerate empty bodies and mislabelled content types
      let data: any = null;
      const contentType = response.headers.get("content-type") || "";
      let rawText: string | null = null;
      try {
        if (contentType.includes("application/json")) {
          // Some servers send application/json with empty body → response.json() throws
          rawText = await response.text();
          data = rawText ? JSON.parse(rawText) : null;
        } else {
          rawText = await response.text();
          // If it looks like JSON, parse it; otherwise leave as text
          if (rawText && rawText.trim().startsWith("{")) {
            data = JSON.parse(rawText);
          }
        }
      } catch (e) {
        throw new Error(
          `Invalid JSON from server${
            rawText ? `: ${rawText.slice(0, 200)}` : ""
          }`
        );
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Unauthorized: missing or invalid Supabase anon key. Ensure .env has VITE_SUPABASE_* and you restarted the dev server."
          );
        }
        const details =
          (data && (data.error?.message || data.message)) || rawText || "";
        throw new Error(
          `Failed to fetch emails (HTTP ${response.status})${
            details ? `: ${details}` : ""
          }`
        );
      }

      setEmails(data.data?.emails || []);
    } catch (err) {
      console.error("Error fetching emails:", err);
      setError(err instanceof Error ? err.message : "Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1) Use prop if provided
    if (userEmail) {
      fetchEmails(userEmail);
      return;
    }
    // 2) Otherwise, check URL query param ?email=
    try {
      const params = new URLSearchParams(window.location.search);
      const emailFromQuery = params.get("email");
      if (emailFromQuery) {
        setCheckingEmail(emailFromQuery);
        fetchEmails(emailFromQuery);
      }
    } catch {
      // ignore
    }
  }, [userEmail]);

  const handleVerificationClick = (email: Email) => {
    if (email.verification_token) {
      const verificationUrl = `/admin/verify-email?token=${email.verification_token}`;
      window.open(verificationUrl, "_blank");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "ready_to_send":
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "sent":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getEmailTypeIcon = (type: string) => {
    switch (type) {
      case "verification":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "welcome":
        return <Mail className="h-4 w-4 text-green-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Mail className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Email Viewer</h1>
          </div>
          <p className="text-lg text-gray-600">
            Access your verification and system emails
          </p>
        </div>

        {/* Email Input */}
        {!userEmail && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter your email address to view emails
                </label>
                <input
                  type="email"
                  id="email"
                  value={checkingEmail}
                  onChange={(e) => setCheckingEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => fetchEmails()}
                  disabled={loading || !checkingEmail}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  {loading ? "Loading..." : "Load Emails"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Emails List */}
        {!loading && emails.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email List */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Emails ({emails.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedEmail?.id === email.id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getEmailTypeIcon(email.email_type)}
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {email.subject}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          To: {email.recipient_name} ({email.recipient_email})
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Date(email.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            email.status
                          )}`}
                        >
                          {email.status}
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    {email.email_type === "verification" &&
                      email.verification_token && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerificationClick(email);
                            }}
                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Verify Email Now
                          </button>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>

            {/* Email Preview */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedEmail ? "Email Preview" : "Select an Email"}
                </h2>
              </div>
              <div className="p-6">
                {selectedEmail ? (
                  <div>
                    {/* Email Details */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            Subject:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {selectedEmail.subject}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">To:</span>
                          <span className="ml-2 text-gray-900">
                            {selectedEmail.recipient_name} (
                            {selectedEmail.recipient_email})
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Type:
                          </span>
                          <span className="ml-2 text-gray-900 capitalize">
                            {selectedEmail.email_type}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Date:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {new Date(
                              selectedEmail.created_at
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Verification Actions */}
                      {selectedEmail.email_type === "verification" &&
                        selectedEmail.verification_token && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleVerificationClick(selectedEmail)
                                }
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Verify Email Now
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `${window.location.origin}/admin/verify-email?token=${selectedEmail.verification_token}`
                                  );
                                  alert(
                                    "Verification link copied to clipboard!"
                                  );
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                              >
                                Copy Link
                              </button>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Email Content */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                        Email Content
                      </div>
                      <div
                        className="p-4 max-h-96 overflow-y-auto"
                        dangerouslySetInnerHTML={{
                          __html: selectedEmail.html_content,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an email from the list to preview its content</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Emails Found */}
        {!loading && emails.length === 0 && (checkingEmail || userEmail) && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Emails Found
            </h3>
            <p className="text-gray-600">
              No emails found for {userEmail || checkingEmail}. Try registering
              first or check the email address.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
