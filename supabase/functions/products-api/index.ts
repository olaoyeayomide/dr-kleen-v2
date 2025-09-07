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

    // Parse URL parameters for filtering
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const minPrice = url.searchParams.get("min_price");
    const maxPrice = url.searchParams.get("max_price");
    const sortBy = url.searchParams.get("sort_by") || "id";
    const sortOrder = url.searchParams.get("sort_order") || "asc";

    // Build query
    let query = `${supabaseUrl}/rest/v1/products?select=*`;

    // Add filters
    const filters: string[] = [];
    if (category && category !== "All Products") {
      filters.push(`category=eq.${encodeURIComponent(category)}`);
    }
    if (search) {
      filters.push(`name=ilike.*${encodeURIComponent(search)}*`);
    }
    if (minPrice) {
      filters.push(`price=gte.${minPrice}`);
    }
    if (maxPrice) {
      filters.push(`price=lte.${maxPrice}`);
    }

    if (filters.length > 0) {
      query += "&" + filters.join("&");
    }

    // Add sorting
    query += `&order=${sortBy}.${sortOrder}`;

    const response = await fetch(query, {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const products = await response.json();

    return new Response(JSON.stringify(products), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Products API error:", error);

    const errorResponse = {
      error: {
        code: "PRODUCTS_FETCH_FAILED",
        message: error.message,
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
