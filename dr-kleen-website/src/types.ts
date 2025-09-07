export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  is_new?: boolean;
  discount?: number;
  rating?: number;
  review_count?: number;
  original_price?: number;
  specs?: { [key: string]: string };
  stock?: number;
  added_at?: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  discount: string;
  image: string;
  bg_color: string;
  added_at?: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  image: string;
  price_range: string;
  created_at?: string;
}

export interface Booking {
  id?: number;
  customer_name: string;
  email: string;
  phone?: string;
  service_type: string;
  booking_date?: string;
  status?: string;
  created_at?: string;
}

export interface Testimonial {
  id: number;
  customer_name: string;
  review: string;
  rating: number;
  service_type: string;
  created_at: string;
}