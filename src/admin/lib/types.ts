export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  price_override?: string | null; // decimal as string from API
  qty_on_hand?: number | null;
}

export interface Product {
  id: string;
  tenant_id: string;
  category_id?: string | null;
  name: string;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
  cost_price: string; // decimal as string from API
  sale_price: string;
  is_active: boolean;
  images?: string[] | null;
  qty_on_hand?: number | null; // joined from inventory
  created_at: string;
  updated_at: string;
  category?: Category | null;
  variants?: ProductVariant[];
}

export interface ProductCreateInput {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  cost_price: number;
  sale_price: number;
  category_id?: string;
  is_active: boolean;
  images?: string[];
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {}

export interface VariantInput {
  name: string;
  sku?: string;
  barcode?: string;
  price_override?: number;
  qty_on_hand?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'owner' | 'worker';
}

export interface LoginResponse {
  token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
  };
}
