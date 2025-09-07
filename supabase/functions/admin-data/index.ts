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

    // Get dashboard overview data
    if (method === "GET" && url.pathname.endsWith("/dashboard-overview")) {
      const authHeader = req.headers.get("authorization");
      verifyAdminToken(authHeader);

      // Fetch all data concurrently
      const [
        bookingsRes,
        productsRes,
        testimonialsRes,
        inquiriesRes,
        servicesRes,
        serviceRequestsRes,
      ] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/bookings`, {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }),
        fetch(`${supabaseUrl}/rest/v1/products`, {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }),
        fetch(`${supabaseUrl}/rest/v1/testimonials`, {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }),
        fetch(`${supabaseUrl}/rest/v1/contact_inquiries`, {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }),
        fetch(`${supabaseUrl}/rest/v1/services`, {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }),
        fetch(`${supabaseUrl}/rest/v1/service_requests`, {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }),
      ]);

      const bookings = bookingsRes.ok ? await bookingsRes.json() : [];
      const products = productsRes.ok ? await productsRes.json() : [];
      const testimonials = testimonialsRes.ok
        ? await testimonialsRes.json()
        : [];
      const inquiries = inquiriesRes.ok ? await inquiriesRes.json() : [];
      const services = servicesRes.ok ? await servicesRes.json() : [];
      const serviceRequests = serviceRequestsRes.ok
        ? await serviceRequestsRes.json()
        : [];

      // Calculate current date ranges
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Calculate statistics
      const stats = {
        // Overall counts
        totalBookings: bookings.length,
        totalProducts: products.length,
        totalTestimonials: testimonials.length,
        totalServices: services.length,

        // Booking stats
        pendingBookings: bookings.filter((b) => b.status === "pending").length,
        completedBookings: bookings.filter((b) => b.status === "completed")
          .length,
        recentBookings: bookings.filter(
          (b) => new Date(b.created_at) >= sevenDaysAgo
        ).length,

        // Product stats
        lowStockProducts: products.filter((p) => p.stock && p.stock <= 5)
          .length,
        outOfStockProducts: products.filter((p) => p.stock === 0).length,
        totalProductValue: products.reduce(
          (sum, p) => sum + p.price * (p.stock || 0),
          0
        ),

        // Inquiry stats
        totalInquiries: inquiries.length,
        newInquiries: inquiries.filter((i) => i.status === "new").length,
        resolvedInquiries: inquiries.filter((i) => i.status === "resolved")
          .length,
        highPriorityInquiries: inquiries.filter((i) => i.priority === "high")
          .length,
        recentInquiries: inquiries.filter(
          (i) => new Date(i.created_at) >= sevenDaysAgo
        ).length,

        // Service request stats
        totalServiceRequests: serviceRequests.length,
        pendingServiceRequests: serviceRequests.filter(
          (sr) => sr.status === "pending"
        ).length,
        completedServiceRequests: serviceRequests.filter(
          (sr) => sr.status === "completed"
        ).length,
        recentServiceRequests: serviceRequests.filter(
          (sr) => new Date(sr.created_at) >= sevenDaysAgo
        ).length,

        // Testimonial stats
        averageRating:
          testimonials.length > 0
            ? (
                testimonials.reduce((sum, t) => sum + t.rating, 0) /
                testimonials.length
              ).toFixed(1)
            : 0,
        recentTestimonials: testimonials.filter(
          (t) => new Date(t.created_at) >= thirtyDaysAgo
        ).length,
      };

      // Get recent activity (last 10 items across all types)
      const recentActivity = [];

      // Recent bookings
      bookings.slice(0, 5).forEach((booking) => {
        recentActivity.push({
          type: "booking",
          title: `New booking from ${booking.customer_name}`,
          description: booking.service_type,
          date: booking.created_at,
          status: booking.status,
        });
      });

      // Recent inquiries
      inquiries.slice(0, 5).forEach((inquiry) => {
        recentActivity.push({
          type: "inquiry",
          title: `Inquiry from ${inquiry.name}`,
          description: inquiry.inquiry_type,
          date: inquiry.created_at,
          status: inquiry.status,
        });
      });

      // Sort by date and take top 10
      recentActivity.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const topRecentActivity = recentActivity.slice(0, 10);

      return new Response(
        JSON.stringify({
          data: {
            stats,
            recentActivity: topRecentActivity,
            chartData: {
              bookingsByStatus: {
                pending: stats.pendingBookings,
                completed: stats.completedBookings,
                cancelled: bookings.filter((b) => b.status === "cancelled")
                  .length,
              },
              inquiriesByPriority: {
                high: stats.highPriorityInquiries,
                medium: inquiries.filter((i) => i.priority === "medium").length,
                low: inquiries.filter((i) => i.priority === "low").length,
              },
              monthlyTrends: {
                // Calculate last 6 months trends
                bookings: calculateMonthlyTrends(bookings),
                inquiries: calculateMonthlyTrends(inquiries),
                serviceRequests: calculateMonthlyTrends(serviceRequests),
              },
            },
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Helper function to calculate monthly trends
    function calculateMonthlyTrends(data) {
      const months = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(
          now.getFullYear(),
          now.getMonth() - i + 1,
          1
        );

        const monthData = data.filter((item) => {
          const itemDate = new Date(item.created_at);
          return itemDate >= monthDate && itemDate < nextMonth;
        });

        months.push({
          month: monthDate.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          count: monthData.length,
        });
      }

      return months;
    }

    // Get specific entity data with CRUD operations
    if (method === "GET" && url.pathname.match(/\/admin-data\/\w+$/)) {
      const authHeader = req.headers.get("authorization");
      verifyAdminToken(authHeader);

      const entityType = url.pathname.split("/").pop();
      const validEntities = [
        "bookings",
        "products",
        "services",
        "testimonials",
        "contact_inquiries",
        "service_requests",
      ];

      if (!validEntities.includes(entityType)) {
        throw new Error("Invalid entity type");
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/${entityType}?order=created_at.desc`,
        {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${entityType}`);
      }

      const data = await response.json();

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update entity
    if (method === "PUT" && url.pathname.match(/\/admin-data\/\w+\/\d+$/)) {
      const authHeader = req.headers.get("authorization");
      verifyAdminToken(authHeader);

      const pathParts = url.pathname.split("/");
      const entityType = pathParts[pathParts.length - 2];
      const entityId = pathParts[pathParts.length - 1];

      const validEntities = [
        "bookings",
        "products",
        "services",
        "testimonials",
        "contact_inquiries",
        "service_requests",
      ];

      if (!validEntities.includes(entityType)) {
        throw new Error("Invalid entity type");
      }

      const updateData = await req.json();
      updateData.updated_at = new Date().toISOString();

      const response = await fetch(
        `${supabaseUrl}/rest/v1/${entityType}?id=eq.${entityId}`,
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
        throw new Error(`Failed to update ${entityType}: ${errorText}`);
      }

      const updatedData = await response.json();

      return new Response(JSON.stringify({ data: updatedData[0] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete entity
    if (method === "DELETE" && url.pathname.match(/\/admin-data\/\w+\/\d+$/)) {
      const authHeader = req.headers.get("authorization");
      verifyAdminToken(authHeader);

      const pathParts = url.pathname.split("/");
      const entityType = pathParts[pathParts.length - 2];
      const entityId = pathParts[pathParts.length - 1];

      const validEntities = [
        "bookings",
        "products",
        "services",
        "testimonials",
        "contact_inquiries",
        "service_requests",
      ];

      if (!validEntities.includes(entityType)) {
        throw new Error("Invalid entity type");
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/${entityType}?id=eq.${entityId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete ${entityType}: ${errorText}`);
      }

      return new Response(
        JSON.stringify({
          data: {
            success: true,
            message: `${entityType} deleted successfully`,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
    console.error("Admin data error:", error);

    const errorResponse = {
      error: {
        code: "ADMIN_DATA_ERROR",
        message: error.message,
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
