// Admin API service for comprehensive admin functionality

const ADMIN_API_BASE_URL =
  "https://rrremqkkrmgjwmvwofzk.supabase.co/functions/v1";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycmVtcWtrcm1nandtdndvZnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMDc3NDQsImV4cCI6MjA3MTY4Mzc0NH0.SkkCBctMWWRz68MfoFqLibKjH3JN8oTichZWbGwEU60";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycmVtcWtrcm1nandtdndvZnprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjEwNzc0NCwiZXhwIjoyMDcxNjgzNzQ0fQ.GSOf1lGJp4tk2kF-RbYvGqp0rWcxOKzOwsDYOSomxrc";

// Utility type for error body
type ApiErrorBody = { error?: any; message?: string; [k: string]: any };

// Types for admin functionality
export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_email_verified?: boolean;
  last_login?: string;
  created_at: string;
}

export interface LoginResponse {
  data: { user: AdminUser; token: string };
  message?: string;
}

export interface AdminRegistrationResponse {
  message: string;
  user_id: number;
  email: string;
  requires_verification: boolean;
}

export interface EmailVerificationResponse {
  message: string;
  user: AdminUser;
}

export interface AdminStats {
  total: number;
  active: number;
  pending_verification: number;
  max_allowed: number;
}

export interface AdminUsersData {
  users: AdminUser[];
  count: AdminStats;
}

export interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  inquiry_type: string;
  status: string;
  priority: string;
  assigned_to?: number;
  notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_type: string;
  property_type?: string;
  property_size?: string;
  preferred_date?: string;
  preferred_time?: string;
  special_instructions?: string;
  estimated_cost?: number;
  status: string;
  priority: string;
  assigned_to?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// DASHBOARD
export interface DashboardStats {
  totalBookings: number;
  totalProducts: number;
  totalTestimonials: number;
  totalServices: number;
  pendingBookings: number;
  completedBookings: number;
  recentBookings: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalProductValue: number;
  totalInquiries: number;
  newInquiries: number;
  resolvedInquiries: number;
  highPriorityInquiries: number;
  recentInquiries: number;
  totalServiceRequests: number;
  pendingServiceRequests: number;
  completedServiceRequests: number;
  recentServiceRequests: number;
  averageRating: string;
  recentTestimonials: number;
}

export interface RecentActivity {
  type: string;
  title: string;
  description: string;
  date: string;
  status: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  chartData: {
    bookingsByStatus: { [key: string]: number };
    inquiriesByPriority: { [key: string]: number };
    monthlyTrends: {
      bookings: Array<{ month: string; count: number }>;
      inquiries: Array<{ month: string; count: number }>;
      serviceRequests: Array<{ month: string; count: number }>;
    };
  };
}


export class AdminApiService {
  private adminToken: string | null;

  constructor() {
    this.adminToken = localStorage.getItem("adminToken");
  }

  private saveToken(token: string | null) {
    this.adminToken = token;
    if (token) localStorage.setItem("adminToken", token);
    else localStorage.removeItem("adminToken");
  }


private getHeaders(isAuth: boolean = true, debug: boolean = false): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    apikey: SUPABASE_ANON_KEY,
  };

  // Add Authorization header for ALL requests
  if (isAuth && this.adminToken) {
    // For authenticated requests with a valid user token
    headers["Authorization"] = `Bearer ${this.adminToken}`;
  } else {
    // For registration, use Service Role Key (admin privileges)
    headers["Authorization"] = `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`;
  }

  if (debug) {
    console.log("📤 Request headers:", headers);
  }

  return headers;
}


private async request<T>(
  endpoint: string,
  options: RequestInit = {},
  isAuth: boolean = true
): Promise<T> {
  console.log('🔍 Making request to:', endpoint);
  console.log('🔍 Auth required:', isAuth);
  console.log('🔍 Using token:', this.adminToken ? 'Yes' : 'No');

  const url = `${ADMIN_API_BASE_URL}${endpoint}`;
  const headers = {
    ...this.getHeaders(isAuth),
    ...(options.headers || {}),
  };

  console.log('🔍 Request headers:', headers);

  const response = await fetch(url, { ...options, headers });

  console.log('🔍 Response status:', response.status);

  // try to parse JSON safely
  let body: any = null;
  const ct = response.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    body = await response.json().catch(() => null);
  } else {
    body = await response.text().catch(() => null);
  }

  if (!response.ok) {
    const err = new Error(
      (body && (body.error?.message || body.message)) ||
        `HTTP ${response.status}: ${response.statusText}`
    );
    (err as any).status = response.status;
    (err as any).body = body;
    throw err;
  }

  return body as T;
}

  // Authentication methods
async login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/admin-auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Login failed');
    }

    // Handle different response structures
    const token = data.data?.token || data.token;
    if (!token) {
      throw new Error('No token received from server');
    }

    this.saveToken(token);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async verifyToken(): Promise<{ user?: AdminUser; valid: boolean }> {
    if (!this.adminToken) return { valid: false };

    // send token both in Authorization header and body to match many backends
    const res = await this.request<any>(
      "/admin-auth/verify",
      {
        method: "POST",
        body: JSON.stringify({ token: this.adminToken }),
      },
      true
    );

    // res might be { valid: true, payload } or { data: { user }, valid: true }
    const user = res?.data?.user || res?.user || res?.payload || null;
    const valid = !!(res?.valid ?? (user != null));

    // if invalid, clear stored token
    if (!valid) this.saveToken(null);

    return { user, valid };
  }

verifyTokenStorage(): boolean {
  const storedToken = localStorage.getItem("adminToken");
  console.log('🔍 Stored token:', storedToken);
  console.log('🔍 Memory token:', this.adminToken);
  return storedToken === this.adminToken;
}y


  // Admin Registration methods
async registerAdmin(
  email: string,
  password: string,
  full_name: string
): Promise<AdminRegistrationResponse> {
  // Call the endpoint directly with Service Role Key
  const response = await fetch(`${ADMIN_API_BASE_URL}/admin-register/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ email, password, full_name })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Registration failed');
  }

  return data;
}

  async verifyEmail(token: string): Promise<EmailVerificationResponse> {
    const response = await this.request<{ data: EmailVerificationResponse }>(
      "/admin-register/verify-email",
      {
        method: "POST",
        body: JSON.stringify({ token }),
      }
    );

    return response.data;
  }

  // Admin Management methods
  async getAdminUsers(): Promise<AdminUsersData> {
    const response = await this.request<{ data: AdminUsersData }>(
      "/admin-management/admin-users"
    );
    return response.data;
  }

  async deleteAdminUser(
    userId: number
  ): Promise<{ message: string; deleted_user_id: string }> {
    const response = await this.request<{
      data: { message: string; deleted_user_id: string };
    }>(`/admin-management/admin-users/${userId}`, {
      method: "DELETE",
    });

    return response.data;
  }

  async getAdminStats(): Promise<AdminStats> {
    const response = await this.request<{ data: AdminStats }>(
      "/admin-management/admin-stats"
    );
    return response.data;
  }

  // Dashboard methods
  async getDashboardOverview(): Promise<DashboardData> {
    const response = await this.request<{ data: DashboardData }>(
      "/admin-data/dashboard-overview"
    );
    return response.data;
  }

  // Contact inquiries methods
  async getInquiries(params?: {
    status?: string;
    priority?: string;
    limit?: number;
    offset?: number;
  }): Promise<ContactInquiry[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/admin-inquiries${
      queryParams.toString() ? "?" + queryParams.toString() : ""
    }`;
    const response = await this.request<{ data: ContactInquiry[] }>(endpoint);
    return response.data;
  }

  async createInquiry(
    inquiryData: Omit<ContactInquiry, "id" | "created_at" | "updated_at">
  ): Promise<ContactInquiry> {
    const response = await this.request<{ data: ContactInquiry }>(
      "/admin-inquiries",
      {
        method: "POST",
        body: JSON.stringify(inquiryData),
      }
    );
    return response.data;
  }

  async updateInquiry(
    id: number,
    updateData: Partial<ContactInquiry>
  ): Promise<ContactInquiry> {
    const response = await this.request<{ data: ContactInquiry }>(
      `/admin-inquiries/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(updateData),
      }
    );
    return response.data;
  }

  async getInquiryStats(): Promise<{
    total: number;
    new: number;
    in_progress: number;
    resolved: number;
    high_priority: number;
  }> {
    const response = await this.request<{ data: any }>(
      "/admin-inquiries/stats"
    );
    return response.data;
  }

  // Entity management methods
  async getEntityData(entityType: string): Promise<any[]> {
    const response = await this.request<{ data: any[] }>(
      `/admin-data/${entityType}`
    );
    return response.data;
  }

  async updateEntity(
    entityType: string,
    id: number,
    updateData: any
  ): Promise<any> {
    const response = await this.request<{ data: any }>(
      `/admin-data/${entityType}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(updateData),
      }
    );
    return response.data;
  }

  async deleteEntity(
    entityType: string,
    id: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ data: any }>(
      `/admin-data/${entityType}/${id}`,
      {
        method: "DELETE",
      }
    );
    return response.data;
  }

  // Content management methods
  async getWebsiteSettings(): Promise<any[]> {
    const response = await this.request<{ data: any[] }>(
      "/admin-management/settings"
    );
    return response.data;
  }

  async updateWebsiteSetting(
    key: string,
    value: string,
    description?: string
  ): Promise<any> {
    const response = await this.request<{ data: any }>(
      `/admin-management/settings/${key}`,
      {
        method: "PUT",
        body: JSON.stringify({ setting_value: value, description }),
      }
    );
    return response.data;
  }

  // Product management methods
  async createProduct(productData: any): Promise<any> {
    const response = await this.request<{ data: any }>(
      "/admin-management/products",
      {
        method: "POST",
        body: JSON.stringify(productData),
      }
    );
    return response.data;
  }

  // Service management methods
  async createService(serviceData: any): Promise<any> {
    const response = await this.request<{ data: any }>(
      "/admin-management/services",
      {
        method: "POST",
        body: JSON.stringify(serviceData),
      }
    );
    return response.data;
  }
}

export const adminApiService = new AdminApiService();
