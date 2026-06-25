import { getToken, setToken, setUser, clearAuth } from './auth';
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductVariant,
  VariantInput,
  Category,
  LoginResponse,
} from './types';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://api.zidni.store';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  // 401 — token expired, clear and redirect
  if (res.status === 401) {
    clearAuth();
    window.location.hash = '/login';
    throw new ApiError('UNAUTHORIZED', 'Session expirée', 401);
  }

  const json = await res.json() as ApiResponse<T>;

  if (!res.ok || !json.success) {
    const err = json.error ?? { code: 'UNKNOWN', message: 'Erreur inconnue' };
    throw new ApiError(err.code, err.message, res.status);
  }

  return json.data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await request<LoginResponse>('POST', '/auth/login', { email, password });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function logout(): Promise<void> {
  try { await request('POST', '/auth/logout'); } catch { /* best-effort */ }
  clearAuth();
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  // API returns paginated or array — handle both shapes
  const res = await fetch(`${BASE}/categories`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) return [];
  const json = await res.json() as ApiResponse<Category[]> | PaginatedResponse<Category>;
  return ('data' in json && Array.isArray(json.data)) ? json.data : [];
}

// ── Products ──────────────────────────────────────────────────────────────────

export interface ProductsQuery {
  page?: number;
  per_page?: number;
  q?: string;
  category_id?: string;
  is_active?: boolean;
}

export async function getProducts(query: ProductsQuery = {}): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();
  if (query.page)        params.set('page',        String(query.page));
  if (query.per_page)    params.set('per_page',     String(query.per_page));
  if (query.q)           params.set('q',            query.q);
  if (query.category_id) params.set('category_id',  query.category_id);
  if (query.is_active !== undefined) params.set('is_active', String(query.is_active));

  const qs = params.toString();
  const token = getToken();

  const res = await fetch(`${BASE}/products${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) { clearAuth(); window.location.hash = '/login'; throw new ApiError('UNAUTHORIZED', 'Session expirée', 401); }

  const json = await res.json() as PaginatedResponse<Product>;
  return json;
}

export async function getProduct(id: string): Promise<Product> {
  return request<Product>('GET', `/products/${id}`);
}

export async function createProduct(input: ProductCreateInput): Promise<Product> {
  return request<Product>('POST', '/products', input);
}

export async function updateProduct(id: string, input: ProductUpdateInput): Promise<Product> {
  return request<Product>('PUT', `/products/${id}`, input);
}

export async function deleteProduct(id: string): Promise<void> {
  await request<void>('DELETE', `/products/${id}`);
}

// ── Variants ──────────────────────────────────────────────────────────────────

export async function getVariants(productId: string): Promise<ProductVariant[]> {
  return request<ProductVariant[]>('GET', `/products/${productId}/variants`);
}

export async function createVariant(productId: string, input: VariantInput): Promise<ProductVariant> {
  return request<ProductVariant>('POST', `/products/${productId}/variants`, input);
}

export async function deleteVariant(productId: string, variantId: string): Promise<void> {
  await request<void>('DELETE', `/products/${productId}/variants/${variantId}`);
}

// ── Refresh token ─────────────────────────────────────────────────────────────

export async function refreshToken(): Promise<void> {
  const data = await request<{ token: string }>('POST', '/auth/refresh');
  setToken(data.token);
}
