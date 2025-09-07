import { Product, Banner, Service, Booking, Testimonial } from '../types';

const API_BASE_URL = 'https://rrremqkkrmgjwmvwofzk.supabase.co/functions/v1';

export const apiService = {
  // Products API
  async getProducts(params?: {
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.category && params.category !== 'All Products') {
      queryParams.append('category', params.category);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.min_price !== undefined) {
      queryParams.append('min_price', params.min_price.toString());
    }
    if (params?.max_price !== undefined) {
      queryParams.append('max_price', params.max_price.toString());
    }
    if (params?.sort_by) {
      queryParams.append('sort_by', params.sort_by);
    }
    if (params?.sort_order) {
      queryParams.append('sort_order', params.sort_order);
    }

    const url = `${API_BASE_URL}/products-api${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Banners API
  async getBanners(): Promise<Banner[]> {
    const response = await fetch(`${API_BASE_URL}/banners-api`);
    if (!response.ok) {
      throw new Error(`Failed to fetch banners: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Services API
  async getServices(): Promise<Service[]> {
    const response = await fetch(`${API_BASE_URL}/services-api`);
    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Testimonials API
  async getTestimonials(): Promise<Testimonial[]> {
    const response = await fetch(`${API_BASE_URL}/testimonials-api`);
    if (!response.ok) {
      throw new Error(`Failed to fetch testimonials: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Bookings API
  async createBooking(booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> {
    const response = await fetch(`${API_BASE_URL}/bookings-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create booking: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  },

  async getBookings(): Promise<Booking[]> {
    const response = await fetch(`${API_BASE_URL}/bookings-api`);
    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.statusText}`);
    }
    
    return response.json();
  },
};