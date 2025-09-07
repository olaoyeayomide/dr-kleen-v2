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
    const supabaseUrl = Deno.env.get("PROJECT_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase configuration missing");
    }

    if (req.method === "POST") {
      // Create a new booking
      const bookingData = await req.json();

      const { customer_name, email, phone, service_type, booking_date } =
        bookingData;

      if (!customer_name || !email || !service_type) {
        throw new Error("Customer name, email, and service type are required");
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/bookings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          customer_name,
          email,
          phone,
          service_type,
          booking_date: booking_date || new Date().toISOString().split("T")[0],
          status: "pending",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create booking: ${errorText}`);
      }

      const booking = await response.json();

      return new Response(
        JSON.stringify({
          data: booking[0],
          message: "Booking created successfully",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (req.method === "GET") {
      // Fetch bookings (for admin purposes)
      const response = await fetch(
        `${supabaseUrl}/rest/v1/bookings?select=*&order=created_at.desc`,
        {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.statusText}`);
      }

      const bookings = await response.json();

      return new Response(JSON.stringify(bookings), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Method not allowed");
  } catch (error) {
    console.error("Bookings API error:", error);

    const errorResponse = {
      error: {
        code: "BOOKINGS_API_FAILED",
        message: error.message,
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
