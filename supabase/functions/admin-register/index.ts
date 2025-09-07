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
    // Get configuration from environment
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("PROJECT_URL");

    if (!serviceRoleKey || !supabaseUrl) {
      return new Response(
        JSON.stringify({
          error: {
            code: "CONFIG_ERROR",
            message: "Server configuration error",
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(req.url);
    const method = req.method;

    // Admin Registration endpoint
    if (method === "POST" && url.pathname.endsWith("/register")) {
      try {
        const requestBody = await req.json();
        const { email, password, full_name } = requestBody;

        // Input validation
        if (!email || !password || !full_name) {
          return new Response(
            JSON.stringify({
              error: {
                code: "VALIDATION_ERROR",
                message: "Email, password, and full name are required",
                details: {
                  email: !email ? "Email is required" : null,
                  password: !password ? "Password is required" : null,
                  full_name: !full_name ? "Full name is required" : null,
                },
              },
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return new Response(
            JSON.stringify({
              error: {
                code: "INVALID_EMAIL_FORMAT",
                message:
                  "Invalid email format. Please enter a valid email address.",
                field: "email",
              },
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Validate password strength (8+ chars, mixed case, numbers, symbols)
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
          return new Response(
            JSON.stringify({
              error: {
                code: "WEAK_PASSWORD",
                message:
                  "Password requirements not met. Must be at least 8 characters with uppercase, lowercase, numbers, and symbols.",
                field: "password",
                requirements: {
                  length: password.length >= 8,
                  uppercase: /[A-Z]/.test(password),
                  lowercase: /[a-z]/.test(password),
                  number: /\d/.test(password),
                  symbol: /[@$!%*?&]/.test(password),
                },
              },
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Check current admin count - enforce maximum of 2 admins
        try {
          const countResponse = await fetch(
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

          if (!countResponse.ok) {
            return new Response(
              JSON.stringify({
                error: {
                  code: "DATABASE_CONNECTION_ERROR",
                  message:
                    "Unable to connect to database. Please try again later.",
                  details: `HTTP ${countResponse.status}: ${countResponse.statusText}`,
                },
              }),
              {
                status: 503,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          const contentRange = countResponse.headers.get("content-range");
          const currentAdminCount = contentRange
            ? parseInt(contentRange.split("/")[1])
            : 0;

          console.log("Current admin count:", currentAdminCount);

          if (currentAdminCount >= 2) {
            return new Response(
              JSON.stringify({
                error: {
                  code: "ADMIN_LIMIT_REACHED",
                  message:
                    "Maximum admin limit reached (2/2). No new admin registrations allowed.",
                  currentCount: currentAdminCount,
                  maxAllowed: 2,
                },
              }),
              {
                status: 409,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        } catch (dbError) {
          console.error("Database error while checking admin count:", dbError);
          return new Response(
            JSON.stringify({
              error: {
                code: "DATABASE_ERROR",
                message: "Database error occurred. Please try again later.",
              },
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Check if email already exists
        try {
          const existingUserResponse = await fetch(
            `${supabaseUrl}/rest/v1/admin_users?email=eq.${email}`,
            {
              headers: {
                Authorization: `Bearer ${serviceRoleKey}`,
                apikey: serviceRoleKey,
              },
            }
          );

          if (!existingUserResponse.ok) {
            return new Response(
              JSON.stringify({
                error: {
                  code: "DATABASE_CONNECTION_ERROR",
                  message:
                    "Unable to verify email availability. Please try again later.",
                },
              }),
              {
                status: 503,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          const existingUsers = await existingUserResponse.json();
          if (existingUsers && existingUsers.length > 0) {
            return new Response(
              JSON.stringify({
                error: {
                  code: "EMAIL_ALREADY_EXISTS",
                  message:
                    "Email already exists. An admin account with this email address is already registered.",
                  field: "email",
                },
              }),
              {
                status: 409,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        } catch (emailCheckError) {
          console.error("Error checking existing email:", emailCheckError);
          return new Response(
            JSON.stringify({
              error: {
                code: "DATABASE_ERROR",
                message:
                  "Error checking email availability. Please try again later.",
              },
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Generate verification token
        const verificationToken = crypto.randomUUID();
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Hash password (simple base64 for demo - use proper hashing in production)
        const hashedPassword = btoa(password);

        // For immediate testing: Create user as active and verified
        // In production, remove this and ensure email service works
        const createUserData = {
          email,
          password_hash: hashedPassword,
          full_name,
          role: "admin",
          is_active: true, // Make active for immediate testing
          is_email_verified: true, // Mark as verified for immediate testing
          email_verification_token: verificationToken,
          verification_token_expires_at: tokenExpiresAt.toISOString(),
          verification_sent_at: new Date().toISOString(),
        };

        // Create new admin user with verified status (temporary fix)
        try {
          const createResponse = await fetch(
            `${supabaseUrl}/rest/v1/admin_users`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${serviceRoleKey}`,
                apikey: serviceRoleKey,
                "Content-Type": "application/json",
                Prefer: "return=representation",
              },
              body: JSON.stringify(createUserData),
            }
          );

          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error("Failed to create admin user:", errorText);
            return new Response(
              JSON.stringify({
                error: {
                  code: "USER_CREATION_FAILED",
                  message:
                    "Failed to create admin account. Please try again later.",
                  details: `HTTP ${createResponse.status}: ${createResponse.statusText}`,
                },
              }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          const newUser = await createResponse.json();

          // Send verification email
          try {
            const emailResponse = await fetch(
              `${supabaseUrl}/functions/v1/admin-emails`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${serviceRoleKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "verification",
                  email: email,
                  full_name: full_name,
                  verification_token: verificationToken,
                }),
              }
            );

            // Don't fail registration if email sending fails, but log it
            if (!emailResponse.ok) {
              console.warn(
                "Failed to send verification email, but registration completed"
              );
            }
          } catch (emailError) {
            console.warn("Email service error:", emailError);
            // Continue with registration success even if email fails
          }

          return new Response(
            JSON.stringify({
              data: {
                message:
                  "Admin registration successful! Account is immediately active for testing. (Email verification bypassed)",
                user_id: newUser[0].id,
                email: newUser[0].email,
                requires_verification: false,
                testing_mode: true,
              },
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } catch (userCreationError) {
          console.error("User creation error:", userCreationError);
          return new Response(
            JSON.stringify({
              error: {
                code: "DATABASE_ERROR",
                message:
                  "Failed to create admin account due to database error. Please try again later.",
              },
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      } catch (registrationError) {
        console.error("Registration validation error:", registrationError);
        return new Response(
          JSON.stringify({
            error: {
              code: "REGISTRATION_ERROR",
              message:
                "Registration failed due to validation error. Please check your input and try again.",
              details: registrationError.message,
            },
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Email Verification endpoint
    if (method === "POST" && url.pathname.endsWith("/verify-email")) {
      const { token } = await req.json();

      if (!token) {
        throw new Error("Verification token is required");
      }

      // Find user by verification token
      const userResponse = await fetch(
        `${supabaseUrl}/rest/v1/admin_users?email_verification_token=eq.${token}&is_email_verified=eq.false`,
        {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error("Failed to verify token");
      }

      const users = await userResponse.json();
      const user = users[0];

      if (!user) {
        return new Response(
          JSON.stringify({
            error: {
              code: "INVALID_TOKEN",
              message: "Invalid or expired verification token",
            },
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check if token is expired
      const tokenExpires = new Date(user.verification_token_expires_at);
      if (tokenExpires < new Date()) {
        return new Response(
          JSON.stringify({
            error: {
              code: "TOKEN_EXPIRED",
              message:
                "Verification token has expired. Please request a new one.",
            },
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Update user as verified and active
      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/admin_users?id=eq.${user.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            is_email_verified: true,
            is_active: true,
            email_verification_token: null,
            verification_token_expires_at: null,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update user verification status");
      }

      const updatedUser = await updateResponse.json();

      // Send welcome email
      const welcomeEmailResponse = await fetch(
        `${supabaseUrl}/functions/v1/admin-emails`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "welcome",
            email: user.email,
            full_name: user.full_name,
          }),
        }
      );

      // Don't fail if welcome email fails to send
      if (!welcomeEmailResponse.ok) {
        console.warn("Failed to send welcome email");
      }

      return new Response(
        JSON.stringify({
          data: {
            message:
              "Email verified successfully! Your admin account is now active.",
            user: {
              id: updatedUser[0].id,
              email: updatedUser[0].email,
              full_name: updatedUser[0].full_name,
              is_active: updatedUser[0].is_active,
              is_email_verified: updatedUser[0].is_email_verified,
            },
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
    console.error("Admin registration service error:", error);

    // Handle different types of errors with specific codes and messages
    let errorResponse;

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      errorResponse = {
        error: {
          code: "NETWORK_ERROR",
          message:
            "Network connection error. Please check your connection and try again.",
        },
      };
    } else if (error.message.includes("JSON")) {
      errorResponse = {
        error: {
          code: "INVALID_REQUEST_FORMAT",
          message:
            "Invalid request format. Please ensure all data is properly formatted.",
        },
      };
    } else if (error.message.includes("configuration")) {
      errorResponse = {
        error: {
          code: "SERVER_CONFIGURATION_ERROR",
          message: "Server configuration error. Please contact support.",
        },
      };
    } else {
      errorResponse = {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred. Please try again later.",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
      };
    }

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
