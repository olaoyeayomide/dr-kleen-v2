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
    const { type, email, full_name, verification_token } = await req.json();

    if (!type || !email || !full_name) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_REQUEST",
            message: "Email type, recipient email, and full name are required",
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const frontendUrl = "https://ckmb5j30pjr4.space.minimax.io"; // Current deployment URL

    let emailContent = "";
    let subject = "";
    let verificationUrl = "";

    if (type === "verification") {
      if (!verification_token) {
        return new Response(
          JSON.stringify({
            error: {
              code: "MISSING_TOKEN",
              message: "Verification token is required for verification emails",
            },
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      subject = "Dr. Kleen - Verify Your Admin Account";
      verificationUrl = `${frontendUrl}/admin/verify-email?token=${verification_token}`;

      // ===== Example snippet added here =====
      // Example usage of verification URL in a simple text email body
      const exampleVerificationUrl = `https://ckmb5j30pjr4.space.minimax.io/admin/verify-email?token=${verification_token}`;
      const emailBodyExample = `
    Welcome to Dr. Kleen!
    Please verify your email by clicking this link: ${exampleVerificationUrl}
  `;
      console.log("Example email body:", emailBodyExample);
      // =====================================

      // if (type === "verification") {
      //   if (!verification_token) {
      //     return new Response(
      //       JSON.stringify({
      //         error: {
      //           code: "MISSING_TOKEN",
      //           message: "Verification token is required for verification emails",
      //         },
      //       }),
      //       {
      //         status: 400,
      //         headers: { ...corsHeaders, "Content-Type": "application/json" },
      //       }
      //     );
      //   }

      //   subject = "Dr. Kleen - Verify Your Admin Account";
      //   verificationUrl = `${frontendUrl}/admin/verify-email?token=${verification_token}`;

      emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Dr. Kleen Admin Account</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Dr. Kleen</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Professional Cleaning Services</p>
        </div>
        
        <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; font-weight: 400;">🎉 Welcome to Dr. Kleen Admin Portal</h2>
            
            <p style="color: #666; font-size: 16px; margin: 0 0 20px 0;">Hello <strong>${full_name}</strong>,</p>
            
            <p style="color: #666; font-size: 16px; margin: 0 0 20px 0;">
                Thank you for registering as an admin user for Dr. Kleen. To complete your registration and activate your account, please click the verification button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: 500; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">✅ Verify Email Address</a>
            </div>
            
            <div style="background: #e8f4ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
                <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;"><strong>📋 Important Information:</strong></p>
                <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px;">
                    <li>This verification link expires in 24 hours</li>
                    <li>Your account remains inactive until verified</li>
                    <li>Maximum 2 admin accounts allowed per system</li>
                </ul>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="color: #666; font-size: 14px; margin: 0;"><strong>🔗 Manual Verification:</strong></p>
                <p style="color: #666; font-size: 12px; margin: 5px 0 0 0; word-break: break-all;">If the button doesn't work, copy this link: ${verificationUrl}</p>
            </div>
            
            <p style="color: #999; font-size: 14px; margin: 20px 0 0 0;">
                If you didn't request this registration, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
                📧 Automated email from Dr. Kleen Admin System • Please do not reply
            </p>
        </div>
    </div>
</body>
</html>
            `;
    } else if (type === "welcome") {
      subject = "Welcome to Dr. Kleen Admin Portal";

      emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Dr. Kleen Admin Portal</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Dr. Kleen</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Professional Cleaning Services</p>
        </div>
        
        <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; font-weight: 400;">🎉 Account Verified Successfully!</h2>
            
            <p style="color: #666; font-size: 16px; margin: 0 0 20px 0;">Dear <strong>${full_name}</strong>,</p>
            
            <p style="color: #666; font-size: 16px; margin: 0 0 20px 0;">
                Congratulations! Your email address has been successfully verified and your Dr. Kleen admin account is now active.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0; text-align: center;">
                <p style="color: #155724; font-size: 16px; margin: 0;"><strong>✅ Account Status: ACTIVE</strong></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${frontendUrl}/admin/login" style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: 500; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">🚀 Access Admin Dashboard</a>
            </div>
            
            <h3 style="color: #333; font-size: 18px; margin: 30px 0 15px 0;">🎯 What's Next?</h3>
            
            <ul style="color: #666; font-size: 16px; margin: 0 0 20px 0; padding-left: 20px;">
                <li>📊 Access the admin dashboard to manage website content</li>
                <li>💬 Review and respond to customer inquiries</li>
                <li>📅 Manage service bookings and appointments</li>
                <li>⚙️ Update website settings and content</li>
                <li>📈 Monitor business analytics and performance</li>
            </ul>
            
            <div style="background: #e8f4ff; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;"><strong>👥 Admin System Information:</strong></p>
                <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px;">
                    <li>Maximum 2 admin accounts allowed</li>
                    <li>Each admin can manage the other admin account</li>
                    <li>Full access to all system features and settings</li>
                </ul>
            </div>
            
            <p style="color: #666; font-size: 16px; margin: 20px 0 0 0;">
                If you have any questions or need assistance, please don't hesitate to contact our support team.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
                📧 Automated email from Dr. Kleen Admin System • Please do not reply
            </p>
        </div>
    </div>
</body>
</html>
            `;
    } else {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_EMAIL_TYPE",
            message: 'Invalid email type. Must be "verification" or "welcome"',
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Store email in the database for display to users (simulating email sending)
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("PROJECT_URL");

    if (!serviceRoleKey || !supabaseUrl) {
      return new Response(
        JSON.stringify({
          error: {
            code: "SERVER_CONFIG_ERROR",
            message: "Server configuration error",
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    try {
      // Store email in pending_emails table
      const emailRecord = {
        recipient_email: email,
        recipient_name: full_name,
        subject: subject,
        html_content: emailContent,
        email_type: type,
        verification_token: verification_token || null,
        status: "ready_to_send",
        created_at: new Date().toISOString(),
        verification_url: type === "verification" ? verificationUrl : null,
      };

      const response = await fetch(`${supabaseUrl}/rest/v1/pending_emails`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(emailRecord),
      });

      if (!response.ok) {
        throw new Error(`Failed to store email: ${response.statusText}`);
      }

      const savedEmail = await response.json();
      console.log("📧 Email stored successfully:", savedEmail[0]?.id);

      return new Response(
        JSON.stringify({
          data: {
            message: "Email prepared and stored successfully",
            type: type,
            recipient: email,
            subject: subject,
            sent_at: new Date().toISOString(),
            email_id: savedEmail[0]?.id,
            status: "ready_to_send",
            verification_url: type === "verification" ? verificationUrl : null,
            note: "📧 Email stored for display. In production, this would be sent via email service.",
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (dbError) {
      console.error("❌ Database error:", dbError.message);
      return new Response(
        JSON.stringify({
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to store email for processing",
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("❌ Email service error:", error);

    return new Response(
      JSON.stringify({
        error: {
          code: "EMAIL_SERVICE_ERROR",
          message: error.message || "Email service error occurred",
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
