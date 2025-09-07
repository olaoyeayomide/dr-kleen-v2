import { create, verify } from 'https://deno.land/x/djwt@v2.9.1/mod.ts';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const jwtSecret = Deno.env.get('JWT_SECRET');
    
    if (!serviceRoleKey || !supabaseUrl || !jwtSecret) {
      throw new Error('Supabase or JWT configuration missing');
    }

    const url = new URL(req.url);
    const method = req.method;

    // Helper function to create JWT token
    async function createJWT(payload: any): Promise<string> {
      return await create(
        { alg: "HS256", typ: "JWT" },
        { ...payload, exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 },
        jwtSecret
      );
    }

    // Helper function to verify JWT token
    async function verifyJWT(token: string): Promise<any> {
      return await verify(token, jwtSecret, "HS256");
    }

    // Login endpoint - FIXED to match frontend expectations
    if (method === 'POST' && url.pathname.endsWith('/admin-auth/login')) {
      try {
        const requestBody = await req.json();
        const { email, password } = requestBody;

        // Input validation
        if (!email || !password) {
          return new Response(JSON.stringify({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Email and password are required'
            }
          }), {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return new Response(JSON.stringify({
            error: {
              code: 'INVALID_EMAIL_FORMAT',
              message: 'Invalid email format'
            }
          }), {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        // Get admin user from database
        const response = await fetch(`${supabaseUrl}/rest/v1/admin_users?email=eq.${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          return new Response(JSON.stringify({
            error: {
              code: 'DATABASE_ERROR',
              message: 'Unable to connect to database',
              details: `HTTP ${response.status}: ${response.statusText}`
            }
          }), {
            status: 503,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        const adminUsers = await response.json();
        const adminUser = adminUsers[0];

        // Account not found
        if (!adminUser) {
          return new Response(JSON.stringify({
            error: {
              code: 'ACCOUNT_NOT_FOUND',
              message: 'No admin account found'
            }
          }), {
            status: 404,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        // Check if email is verified

        if (!adminUser.is_email_verified) {
          return new Response(JSON.stringify({
            error: {
              code: 'EMAIL_NOT_VERIFIED',
              message: 'Email not verified. Please check your email for the verification link.',
              email: adminUser.email,
              verification_required: true,
              suggestion: 'Click "Resend Verification" if you need a new verification email.'
            }
          }), {
            status: 403,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        if (!adminUser.is_active) {
          return new Response(JSON.stringify({
            error: {
              code: 'ACCOUNT_INACTIVE',
              message: 'Account is inactive',
              email: adminUser.email,
              account_status: 'inactive'
            }
          }), {
            status: 403,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        // Verify password with bcrypt
        const isPasswordValid = await bcrypt.compare(password, adminUser.password_hash);
        if (!isPasswordValid) {
          return new Response(JSON.stringify({
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password'
            }
          }), {
            status: 401,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        // Update last login time
        try {
          await fetch(`${supabaseUrl}/rest/v1/admin_users?id=eq.${adminUser.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              last_login: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          });
        } catch (updateError) {
          console.warn('Failed to update last login time:', updateError);
        }

        // Create proper JWT token
        const sessionToken = await createJWT({
          userId: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          iat: Math.floor(Date.now() / 1000)
        });

        // FIXED: Return response in format frontend expects
        return new Response(JSON.stringify({
          data: {
            user: {
              id: adminUser.id,
              email: adminUser.email,
              full_name: adminUser.full_name,
              role: adminUser.role,
              is_active: adminUser.is_active,
              is_email_verified: adminUser.is_email_verified,
              last_login: new Date().toISOString()
            },
            token: sessionToken
          },
          message: 'Login successful. Welcome to Dr. Kleen Admin Portal!'
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });

      } catch (error) {
        console.error('Login error:', error);
        return new Response(JSON.stringify({
          error: {
            code: 'LOGIN_ERROR',
            message: 'Login failed'
          }
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }

    // Verify token endpoint - FIXED to match frontend expectations
    if (method === 'POST' && url.pathname.endsWith('/admin-auth/verify')) {
      try {
        const { token } = await req.json();
        
        if (!token) {
          return new Response(JSON.stringify({
            error: {
              code: 'TOKEN_REQUIRED',
              message: 'Token is required'
            }
          }), {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        // Verify JWT token
        let decodedToken;
        try {
          decodedToken = await verifyJWT(token);
        } catch (e) {
          return new Response(JSON.stringify({
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid or expired token'
            }
          }), {
            status: 401,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        // Get current admin user data
        const response = await fetch(`${supabaseUrl}/rest/v1/admin_users?id=eq.${decodedToken.userId}`, {
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
          }
        });

        if (!response.ok) {
          return new Response(JSON.stringify({
            error: {
              code: 'USER_VERIFICATION_FAILED',
              message: 'Failed to verify user'
            }
          }), {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        const users = await response.json();
        const user = users[0];

        if (!user || !user.is_active) {
          return new Response(JSON.stringify({
            error: {
              code: 'USER_INACTIVE',
              message: 'User is inactive'
            }
          }), {
            status: 401,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        // FIXED: Return response in format frontend expects
        return new Response(JSON.stringify({
          data: {
            user: {
              id: user.id,
              email: user.email,
              full_name: user.full_name,
              role: user.role
            },
            valid: true
          }
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });

      } catch (error) {
        console.error('Verify error:', error);
        return new Response(JSON.stringify({
          error: {
            code: 'VERIFICATION_ERROR',
            message: 'Token verification failed'
          }
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }

    // Add other endpoints here with similar fixes...
     if (method === 'POST' && url.pathname.endsWith('/setup')) {
      try {
        const { email, password, full_name } = await req.json();
        
        if (!email || !password || !full_name) {
          return new Response(JSON.stringify({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Email, password, and full name are required'
            }
          }), {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        // Check if any admin users exist
        const checkResponse = await fetch(`${supabaseUrl}/rest/v1/admin_users`, {
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
          }
        });

        const existingUsers = await checkResponse.json();
        if (existingUsers && existingUsers.length > 0) {
          return new Response(JSON.stringify({
            error: {
              code: 'SETUP_COMPLETE',
              message: 'Admin users already exist'
            }
          }), {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        // Hash password with bcrypt
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create first admin user
        const createResponse = await fetch(`${supabaseUrl}/rest/v1/admin_users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            email,
            password_hash: hashedPassword,
            full_name,
            role: 'super_admin',
            is_active: true,
            is_email_verified: true
          })
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          throw new Error(`Failed to create admin user: ${errorText}`);
        }

        const newUser = await createResponse.json();

        // Create JWT token for the new user
        const sessionToken = await createJWT({
          userId: newUser[0].id,
          email: newUser[0].email,
          role: newUser[0].role,
          iat: Math.floor(Date.now() / 1000)
        });

        return new Response(JSON.stringify({
          data: {
            user: {
              id: newUser[0].id,
              email: newUser[0].email,
              full_name: newUser[0].full_name,
              role: newUser[0].role
            },
            token: sessionToken,
            message: 'Admin user created successfully'
          }
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });

      } catch (error) {
        console.error('Setup error:', error);
        return new Response(JSON.stringify({
          error: {
            code: 'SETUP_ERROR',
            message: error.message
          }
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }


    






    return new Response(JSON.stringify({
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found'
      }
    }), {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Admin auth error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'ADMIN_AUTH_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});