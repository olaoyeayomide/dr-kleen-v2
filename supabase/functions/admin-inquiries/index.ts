Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, PATCH",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Credentials": "false",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("PROJECT_URL");

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error("Supabase configuration missing");
    }

    const url = new URL(req.url);
    const method = req.method;

    // Helper function to verify admin token
    const verifyAdminToken = (authHeader) => {
      if (!authHeader) {
        throw new Error("Authorization header required");
      }

      const token = authHeader.replace("Bearer ", "");
      try {
        const decodedToken = JSON.parse(atob(token));
        if (decodedToken.exp < Date.now()) {
          throw new Error("Token expired");
        }
        return decodedToken;
      } catch {
        throw new Error("Invalid token");
      }
    };

    // Get all inquiries (GET /)
    if (method === "GET" && url.pathname.endsWith("/admin-inquiries")) {
      const authHeader = req.headers.get("authorization");
      verifyAdminToken(authHeader);

      const queryParams = new URLSearchParams(url.search);
      const status = queryParams.get("status");
      const priority = queryParams.get("priority");
      const limit = queryParams.get("limit") || "50";
      const offset = queryParams.get("offset") || "0";

      let query = `${supabaseUrl}/rest/v1/contact_inquiries?order=created_at.desc&limit=${limit}&offset=${offset}`;

      if (status) {
        query += `&status=eq.${status}`;
      }
      if (priority) {
        query += `&priority=eq.${priority}`;
      }

      const response = await fetch(query, {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch inquiries");
      }

      const inquiries = await response.json();

      return new Response(JSON.stringify({ data: inquiries }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create new inquiry (POST /)
    if (method === "POST" && url.pathname.endsWith("/admin-inquiries")) {
      const inquiryData = await req.json();

      const { name, email, phone, message, inquiry_type } = inquiryData;

      if (!name || !email || !message) {
        throw new Error("Name, email, and message are required");
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/contact_inquiries`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          message,
          inquiry_type: inquiry_type || "general",
          status: "new",
          priority: "medium",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create inquiry: ${errorText}`);
      }

      const newInquiry = await response.json();

      return new Response(JSON.stringify({ data: newInquiry[0] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update inquiry (PUT /{id})
    if (method === "PUT" && url.pathname.match(/\/admin-inquiries\/\d+$/)) {
      const authHeader = req.headers.get("authorization");
      const adminToken = verifyAdminToken(authHeader);

      const inquiryId = url.pathname.split("/").pop();
      const updateData = await req.json();

      // Add admin info to update
      updateData.updated_at = new Date().toISOString();
      if (updateData.status === "resolved" && !updateData.resolved_at) {
        updateData.resolved_at = new Date().toISOString();
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/contact_inquiries?id=eq.${inquiryId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update inquiry: ${errorText}`);
      }

      const updatedInquiry = await response.json();

      return new Response(JSON.stringify({ data: updatedInquiry[0] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get inquiry statistics (GET /stats)
    if (method === "GET" && url.pathname.endsWith("/stats")) {
      const authHeader = req.headers.get("authorization");
      verifyAdminToken(authHeader);

      // Get count by status
      const statusResponse = await fetch(
        `${supabaseUrl}/rest/v1/contact_inquiries?select=status`,
        {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error("Failed to fetch inquiry statistics");
      }

      const inquiries = await statusResponse.json();

      const stats = {
        total: inquiries.length,
        new: inquiries.filter((i) => i.status === "new").length,
        in_progress: inquiries.filter((i) => i.status === "in_progress").length,
        resolved: inquiries.filter((i) => i.status === "resolved").length,
        high_priority: inquiries.filter((i) => i.priority === "high").length,
      };

      return new Response(JSON.stringify({ data: stats }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        error: { code: "NOT_FOUND", message: "Endpoint not found" },
      }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Admin inquiries error:", error);

    const errorResponse = {
      error: {
        code: "INQUIRIES_ERROR",
        message: error.message,
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
