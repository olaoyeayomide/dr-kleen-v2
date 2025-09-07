/* eslint-env deno */
// Force redeploy - updated at 2025-08-28
declare const Deno: any;

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, PATCH",
    "Access-Control-Max-Age": "86400",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let email: string | null = null;

    if (req.method === "GET") {
      const url = new URL(req.url);
      email = url.searchParams.get("email");
    } else if (req.method === "POST") {
      const body = await req.json();
      email = body.email;
    }

    console.log("🚀 Function started, processing email:", email);

    // Return valid JSON if email is missing
    if (!email) {
      return new Response(
        JSON.stringify({
          data: { emails: [], count: 0, message: "Email parameter missing" },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          data: { emails: [], count: 0, message: "Invalid email format" },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("PROJECT_URL");

    // Debug: Log environment variable values (masked for security)
    console.log("🔍 Environment Variables Check:");
    console.log("PROJECT_URL present:", !!supabaseUrl);
    console.log("PROJECT_URL length:", supabaseUrl ? supabaseUrl.length : 0);
    console.log(
      "PROJECT_URL starts with https:",
      supabaseUrl ? supabaseUrl.startsWith("https://") : false
    );
    console.log("SERVICE_ROLE_KEY present:", !!serviceRoleKey);
    console.log(
      "SERVICE_ROLE_KEY length:",
      serviceRoleKey ? serviceRoleKey.length : 0
    );
    console.log(
      "SERVICE_ROLE_KEY starts with eyJ:",
      serviceRoleKey ? serviceRoleKey.startsWith("eyJ") : false
    );

    // Log first few characters of each (safe to show)
    if (supabaseUrl) {
      console.log("PROJECT_URL preview:", supabaseUrl.substring(0, 30) + "...");
    }
    if (serviceRoleKey) {
      console.log(
        "SERVICE_ROLE_KEY preview:",
        serviceRoleKey.substring(0, 30) + "..."
      );
    }

    if (!serviceRoleKey || !supabaseUrl) {
      console.error("❌ Missing environment variables:");
      console.error("SERVICE_ROLE_KEY missing:", !serviceRoleKey);
      console.error("PROJECT_URL missing:", !supabaseUrl);
      return new Response(
        JSON.stringify({
          data: { emails: [], count: 0, message: "Server configuration error" },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch emails
    console.log("🔍 About to fetch from database...");
    const dbResponse = await fetch(
      `${supabaseUrl}/rest/v1/pending_emails?recipient_email=eq.${email}&order=created_at.desc`,
      {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Database fetch completed");
    console.log("DB Response status:", dbResponse.status);
    console.log("DB Response ok:", dbResponse.ok);
    console.log("DB Response statusText:", dbResponse.statusText);

    // Check if response is ok first
    if (!dbResponse.ok) {
      console.error("❌ Database response not ok");
      throw new Error(`Database query failed: ${dbResponse.statusText}`);
    }

    console.log("🔍 Reading response as text...");
    // Read raw text first to debug
    const dbRawText = await dbResponse.text();
    console.log("DB Raw response length:", dbRawText.length);
    console.log("DB Raw response:", dbRawText);
    console.log("DB Raw response type:", typeof dbRawText);

    // Parse JSON safely
    let emails: any[] = [];
    try {
      console.log("🔍 Attempting to parse JSON...");
      if (dbRawText && dbRawText.trim()) {
        emails = JSON.parse(dbRawText);
        console.log("✅ JSON parsed successfully");
      } else {
        console.log("ℹ️ Empty response, setting emails to empty array");
        emails = [];
      }
      console.log("Parsed emails:", emails);
      console.log("Emails type:", typeof emails);
      console.log(
        "Emails length:",
        Array.isArray(emails) ? emails.length : "not an array"
      );
    } catch (e) {
      console.error("❌ JSON parse error:", e);
      console.error("Error type:", typeof e);
      console.error("Error message:", (e as Error).message);
      throw new Error(
        `Invalid JSON from database: ${
          (e as Error).message
        }. Raw response: ${dbRawText.slice(0, 200)}`
      );
    }

    // Add verification URLs
    const processedEmails = emails.map((row: any) => {
      if (row.email_type === "verification" && row.verification_token) {
        const frontendUrl = "https://ckmb5j30pjr4.space.minimax.io";
        row.verification_url = `${frontendUrl}/admin/verify-email?token=${row.verification_token}`;
      }
      return row;
    });

    return new Response(
      JSON.stringify({
        data: {
          emails: processedEmails,
          count: processedEmails.length,
          message:
            processedEmails.length > 0
              ? `Found ${processedEmails.length} emails for ${email}`
              : `No emails found for ${email}`,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("❌ Email display error:", error);

    return new Response(
      JSON.stringify({
        data: {
          emails: [],
          count: 0,
          message: error.message || "Failed to retrieve emails",
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// declare const Deno: any;

// Deno.serve(async (req) => {
//   const corsHeaders = {
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Headers":
//       "authorization, x-client-info, apikey, content-type",
//     "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, PATCH",
//     "Access-Control-Max-Age": "86400",
//   };

//   if (req.method === "OPTIONS") {
//     return new Response(null, { status: 200, headers: corsHeaders });
//   }

//   try {
//     let email: string | null = null;

//     if (req.method === "GET") {
//       // Extract from query string
//       const url = new URL(req.url);
//       email = url.searchParams.get("email");
//     } else if (req.method === "POST") {
//       // Extract from JSON body
//       const body = await req.json();
//       email = body.email;
//     }

//     if (!email) {
//       return new Response(
//         JSON.stringify({
//           error: {
//             code: "MISSING_EMAIL",
//             message: "Email address is required",
//           },
//         }),
//         {
//           status: 400,
//           headers: { ...corsHeaders, "Content-Type": "application/json" },
//         }
//       );
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return new Response(
//         JSON.stringify({
//           error: {
//             code: "INVALID_EMAIL_FORMAT",
//             message: "Invalid email format",
//           },
//         }),
//         {
//           status: 400,
//           headers: { ...corsHeaders, "Content-Type": "application/json" },
//         }
//       );
//     }

//     const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
//     const supabaseUrl = Deno.env.get("PROJECT_URL");

//     if (!serviceRoleKey || !supabaseUrl) {
//       return new Response(
//         JSON.stringify({
//           error: {
//             code: "SERVER_CONFIG_ERROR",
//             message: "Server configuration error",
//           },
//         }),
//         {
//           status: 500,
//           headers: { ...corsHeaders, "Content-Type": "application/json" },
//         }
//       );
//     }

//     // Fetch emails
//     const dbResponse = await fetch(
//       `${supabaseUrl}/rest/v1/pending_emails?recipient_email=eq.${email}&order=created_at.desc`,
//       {
//         headers: {
//           Authorization: `Bearer ${serviceRoleKey}`,
//           apikey: serviceRoleKey,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // Read raw text first to avoid JSON parse errors on empty bodies
//     const dbRawText = await dbResponse.text();
//     let emails: any[] = [];

//     if (!dbResponse.ok) {
//       // Surface backend error details if present
//       let backendDetails = "";
//       try {
//         if (dbRawText) {
//           const maybeJson = JSON.parse(dbRawText);
//           backendDetails =
//             maybeJson?.message ||
//             maybeJson?.error?.message ||
//             dbResponse.statusText;
//         } else {
//           backendDetails = dbResponse.statusText || "Unknown error";
//         }
//       } catch (_e) {
//         backendDetails = dbRawText || dbResponse.statusText || "Unknown error";
//       }
//       throw new Error(`Database query failed: ${backendDetails}`);
//     }

//     // Parse only if body is non-empty and looks like JSON
//     if (dbRawText) {
//       try {
//         emails = JSON.parse(dbRawText);
//       } catch (e) {
//         throw new Error(
//           `Invalid JSON from database: ${
//             (e as Error).message
//           }. Body: ${dbRawText.slice(0, 200)}`
//         );
//       }
//     } else {
//       emails = [];
//     }

//     const processedEmails = emails.map((row: any) => {
//       if (row.email_type === "verification" && row.verification_token) {
//         const frontendUrl = "https://ckmb5j30pjr4.space.minimax.io";
//         row.verification_url = `${frontendUrl}/admin/verify-email?token=${row.verification_token}`;
//       }
//       return row;
//     });

//     return new Response(
//       JSON.stringify({
//         data: {
//           message: `Found ${processedEmails.length} emails for ${email}`,
//           emails: processedEmails,
//           count: processedEmails.length,
//         },
//       }),
//       {
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       }
//     );
//   } catch (error: any) {
//     console.error("❌ Email display error:", error);
//     return new Response(
//       JSON.stringify({
//         error: {
//           code: "EMAIL_DISPLAY_ERROR",
//           message: error.message || "Failed to retrieve emails",
//         },
//       }),
//       {
//         status: 500,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       }
//     );
//   }
// });
