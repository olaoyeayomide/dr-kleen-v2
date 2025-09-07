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

    // Get website settings (GET /settings)
    if (method === "GET" && url.pathname.endsWith("/settings")) {
      const authHeader = req.headers.get("authorization");
      verifyAdminToken(authHeader);

      const response = await fetch(
        `${supabaseUrl}/rest/v1/website_settings?order=setting_key.asc`,
        {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch website settings");
      }

      const settings = await response.json();

      return new Response(JSON.stringify({ data: settings }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update website setting (PUT /settings/{key})
    if (method === "PUT" && url.pathname.match(/\/settings\/[\w-]+$/)) {
      const authHeader = req.headers.get("authorization");
      const adminToken = verifyAdminToken(authHeader);

      const settingKey = url.pathname.split("/").pop();
      const { setting_value, description } = await req.json();

      if (!setting_value) {
        throw new Error("Setting value is required");
      }

      // Check if setting exists
      const checkResponse = await fetch(
        `${supabaseUrl}/rest/v1/website_settings?setting_key=eq.${settingKey}`,
        {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }
      );

      const existingSettings = await checkResponse.json();

      if (existingSettings.length === 0) {
        // Create new setting
        const createResponse = await fetch(
          `${supabaseUrl}/rest/v1/website_settings`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceRoleKey}`,
              apikey: serviceRoleKey,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              setting_key: settingKey,
              setting_value,
              description: description || "",
              updated_by: adminToken.userId,
            }),
          }
        );

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          throw new Error(`Failed to create setting: ${errorText}`);
        }

        const newSetting = await createResponse.json();
        return new Response(JSON.stringify({ data: newSetting[0] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        // Update existing setting
        const updateResponse = await fetch(
          `${supabaseUrl}/rest/v1/website_settings?setting_key=eq.${settingKey}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${serviceRoleKey}`,
              apikey: serviceRoleKey,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              setting_value,
              description: description || existingSettings[0].description,
              updated_by: adminToken.userId,
              updated_at: new Date().toISOString(),
            }),
          }
        );

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          throw new Error(`Failed to update setting: ${errorText}`);
        }

        const updatedSetting = await updateResponse.json();
        return new Response(JSON.stringify({ data: updatedSetting[0] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Add new product (POST /products)
    if (method === "POST" && url.pathname.endsWith("/products")) {
      const authHeader = req.headers.get("authorization");
      verifyAdminToken(authHeader);

      const productData = await req.json();

      const {
        name,
        price,
        category,
        description,
        image,
        is_new,
        discount,
        stock,
      } = productData;

      if (!name || !price || !category) {
        throw new Error("Name, price, and category are required");
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          name,
          price,
          category,
          description: description || "",
          image: image || "",
          is_new: is_new || false,
          discount: discount || 0,
          stock: stock || 0,
          rating: 5.0,
          review_count: 0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create product: ${errorText}`);
      }

      const newProduct = await response.json();

      return new Response(JSON.stringify({ data: newProduct[0] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Add new service (POST /services)
    if (method === "POST" && url.pathname.endsWith("/services")) {
      const authHeader = req.headers.get("authorization");
      verifyAdminToken(authHeader);

      const serviceData = await req.json();

      const { name, description, price_range, image } = serviceData;

      if (!name || !description || !price_range) {
        throw new Error("Name, description, and price range are required");
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/services`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          name,
          description,
          price_range,
          image: image || "",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create service: ${errorText}`);
      }

      const newService = await response.json();

      return new Response(JSON.stringify({ data: newService[0] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get admin users (GET /admin-users)
    if (method === "GET" && url.pathname.endsWith("/admin-users")) {
      const authHeader = req.headers.get("authorization");
      const adminToken = verifyAdminToken(authHeader);

      const response = await fetch(
        `${supabaseUrl}/rest/v1/admin_users?select=id,email,full_name,role,is_active,is_email_verified,last_login,created_at&order=created_at.desc`,
        {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch admin users");
      }

      const adminUsers = await response.json();
      const totalCount = adminUsers.length;
      const activeCount = adminUsers.filter(
        (user) => user.is_active && user.is_email_verified
      ).length;

      return new Response(
        JSON.stringify({
          data: {
            users: adminUsers,
            count: {
              total: totalCount,
              active: activeCount,
              max_allowed: 2,
            },
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Delete admin user (DELETE /admin-users/{id})
    if (method === "DELETE" && url.pathname.match(/\/admin-users\/\d+$/)) {
      const authHeader = req.headers.get("authorization");
      const adminToken = verifyAdminToken(authHeader);

      const userIdToDelete = url.pathname.split("/").pop();

      // Prevent admin from deleting themselves
      if (parseInt(userIdToDelete) === adminToken.userId) {
        return new Response(
          JSON.stringify({
            error: {
              code: "CANNOT_DELETE_SELF",
              message: "You cannot delete your own admin account",
            },
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Verify the admin user exists
      const userResponse = await fetch(
        `${supabaseUrl}/rest/v1/admin_users?id=eq.${userIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error("Failed to verify user existence");
      }

      const users = await userResponse.json();
      if (!users || users.length === 0) {
        return new Response(
          JSON.stringify({
            error: {
              code: "USER_NOT_FOUND",
              message: "Admin user not found",
            },
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Delete the admin user
      const deleteResponse = await fetch(
        `${supabaseUrl}/rest/v1/admin_users?id=eq.${userIdToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        throw new Error(`Failed to delete admin user: ${errorText}`);
      }

      return new Response(
        JSON.stringify({
          data: {
            message: "Admin user deleted successfully",
            deleted_user_id: userIdToDelete,
            deleted_by: adminToken.userId,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get admin stats (GET /admin-stats)
    if (method === "GET" && url.pathname.endsWith("/admin-stats")) {
      const authHeader = req.headers.get("authorization");
      verifyAdminToken(authHeader);

      // Get admin count using proper HEAD request with count=exact
      const adminCountResponse = await fetch(
        `${supabaseUrl}/rest/v1/admin_users?select=count`,
        {
          method: "HEAD",
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            Prefer: "count=exact",
          },
        }
      );

      let adminStats = {
        total: 0,
        active: 0,
        pending_verification: 0,
        max_allowed: 2,
      };

      if (adminCountResponse.ok) {
        const contentRange = adminCountResponse.headers.get("content-range");
        adminStats.total = contentRange
          ? parseInt(contentRange.split("/")[1])
          : 0;

        // Get detailed admin data for active/pending counts
        const adminResponse = await fetch(
          `${supabaseUrl}/rest/v1/admin_users?select=id,is_active,is_email_verified`,
          {
            headers: {
              Authorization: `Bearer ${serviceRoleKey}`,
              apikey: serviceRoleKey,
            },
          }
        );

        if (adminResponse.ok) {
          const admins = await adminResponse.json();
          adminStats.active = admins.filter(
            (admin) => admin.is_active && admin.is_email_verified
          ).length;
          adminStats.pending_verification = admins.filter(
            (admin) => !admin.is_email_verified
          ).length;
        }
      }

      return new Response(JSON.stringify({ data: adminStats }), {
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
    console.error("Admin management error:", error);

    const errorResponse = {
      error: {
        code: "ADMIN_MANAGEMENT_ERROR",
        message: error.message,
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
