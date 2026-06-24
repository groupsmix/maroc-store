/**
 * dataProvider — maps react-admin CRUD to the jumlaOP REST API.
 *
 * Ground truth (read from apps/api/src/modules/products/routes.ts + service.ts + schema.ts):
 *
 * GET  /products          → { success, data: { items: Product[], page, limit, hasMore } }
 * GET  /products/:id      → { success, data: { product: Product } }
 * POST /products          → { success, data: { product: Product } }   (201)
 * PUT  /products/:id      → { success, data: { product: Product } }
 * DEL  /products/:id      → { success, data: { removed: true } }
 *
 * Query params (paginationSchema): page, limit, search, sortBy, sortOrder
 * NO category_id filter. NO is_active filter. Search param is "search" not "q".
 *
 * Request body field names are camelCase (validators), DB response fields are snake_case.
 * Money fields (cost_price / sell_price) are returned as decimal strings by Postgres.
 * Money fields in request must be strings like "50.000" (up to 3 decimal places).
 *
 * imageUrl is CDN-restricted: only *.r2.cloudflarestorage.com, *.jumlaop.ma, *.jumlaop.com
 *
 * No categories API route exists yet (schema + validators exist, no route registered).
 * No variants API route exists yet.
 */

import type { DataProvider } from 'react-admin';
import { getToken, clearAuth } from './lib/auth';

const API_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://api.zidni.store';

// ── Helpers ───────────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function checkUnauthorized(status: number) {
  if (status === 401) {
    clearAuth();
    window.location.hash = '#/login';
    throw new Error('Session expirée');
  }
}

/** Convert a money value (number | string | undefined) to the API's money string format */
function toMoney(v: unknown, decimals = 3): string {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(decimals) : '0'.padEnd(decimals + 2, '0').replace(/(\d)(\d{3})$/, '$1.$2');
}

/**
 * Transform a react-admin record (DB snake_case fields) to the API request body (camelCase).
 * Called before every POST and PUT.
 */
function toProductApiBody(data: Record<string, unknown>): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name:        data.name,
    sku:         data.sku,
    unit:        data.unit ?? 'piece',
    sellPrice:   toMoney(data.sell_price),
    costPrice:   toMoney(data.cost_price),
    isActive:    data.is_active ?? true,
    hasVariants: data.has_variants ?? false,
  };
  // Optional fields — only include when present to avoid sending null strings
  if (data.name_ar)       body.nameAr       = data.name_ar;
  if (data.description)   body.description  = data.description;
  if (data.barcode)       body.barcode      = data.barcode;
  if (data.category_id)   body.categoryId   = data.category_id;
  if (data.image_url)     body.imageUrl     = data.image_url;
  if (data.wholesale_price != null) body.wholesalePrice = toMoney(data.wholesale_price);
  if (data.tax_rate != null)        body.taxRate        = toMoney(data.tax_rate, 2);
  return body;
}

async function apiFetch(method: string, path: string, body?: unknown): Promise<{ data: unknown }> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  checkUnauthorized(res.status);

  const json = (await res.json()) as { success?: boolean; data?: unknown; error?: { message: string } };

  if (!res.ok || json.success === false) {
    throw new Error(json.error?.message ?? `API error ${res.status}`);
  }

  return { data: json.data };
}

// ── Data provider ─────────────────────────────────────────────────────────────

export const dataProvider: DataProvider = {

  // ── List ───────────────────────────────────────────────────────────────────
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { filter } = params;

    const qs = new URLSearchParams({ page: String(page), limit: String(perPage) });

    // paginationSchema supports: page, limit, search, sortBy, sortOrder
    // SearchInput sends filter.q — map to "search"
    if (filter.q) qs.set('search', String(filter.q));

    // sortBy / sortOrder
    if (params.sort?.field) qs.set('sortBy', params.sort.field);
    if (params.sort?.order) qs.set('sortOrder', params.sort.order.toLowerCase());

    const res = await fetch(`${API_URL}/${resource}?${qs.toString()}`, {
      headers: authHeaders(),
    });
    checkUnauthorized(res.status);

    const json = (await res.json()) as { success?: boolean; data?: unknown; error?: { message: string } };
    if (!res.ok || json.success === false) {
      throw new Error((json.error as { message: string } | undefined)?.message ?? `API error ${res.status}`);
    }

    // GET /products → data: { items, page, limit, hasMore }
    const wrapper = json.data as { items?: unknown[]; hasMore?: boolean } | undefined;
    const items = (wrapper?.items ?? (Array.isArray(json.data) ? json.data : [])) as Record<string, unknown>[];
    const offset = (page - 1) * perPage;
    // No total from API — estimate: if hasMore, at least one more page exists
    const total = wrapper?.hasMore ? offset + items.length + 1 : offset + items.length;

    return { data: items, total };
  },

  // ── One ────────────────────────────────────────────────────────────────────
  getOne: async (resource, { id }) => {
    const { data } = await apiFetch('GET', `/${resource}/${id}`);
    // GET /products/:id → data: { product: {...} }
    const wrapper = data as Record<string, unknown>;
    const record = (wrapper.product ?? wrapper) as Record<string, unknown>;
    return { data: record };
  },

  // ── Create ─────────────────────────────────────────────────────────────────
  create: async (resource, { data }) => {
    const body = resource === 'products' ? toProductApiBody(data as Record<string, unknown>) : data;
    const { data: responseData } = await apiFetch('POST', `/${resource}`, body);
    const wrapper = responseData as Record<string, unknown>;
    const record = (wrapper.product ?? wrapper) as Record<string, unknown>;
    return { data: record };
  },

  // ── Update ─────────────────────────────────────────────────────────────────
  update: async (resource, { id, data }) => {
    const body = resource === 'products' ? toProductApiBody(data as Record<string, unknown>) : data;
    const { data: responseData } = await apiFetch('PUT', `/${resource}/${id}`, body);
    const wrapper = responseData as Record<string, unknown>;
    const record = (wrapper.product ?? wrapper) as Record<string, unknown>;
    return { data: record };
  },

  // ── Delete ─────────────────────────────────────────────────────────────────
  delete: async (resource, { id }) => {
    await apiFetch('DELETE', `/${resource}/${id}`);
    return { data: { id } as Record<string, unknown> };
  },

  deleteMany: async (resource, { ids }) => {
    await Promise.all(ids.map(id => apiFetch('DELETE', `/${resource}/${id}`)));
    return { data: ids };
  },

  // ── Many (used by ReferenceInput, not needed without categories) ────────────
  getMany: async (resource, { ids }) => {
    const records = await Promise.all(
      ids.map(async id => {
        const { data } = await apiFetch('GET', `/${resource}/${id}`);
        const wrapper = data as Record<string, unknown>;
        return (wrapper.product ?? wrapper) as Record<string, unknown>;
      }),
    );
    return { data: records };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const qs = new URLSearchParams({
      page:            String(page),
      limit:           String(perPage),
      [params.target]: String(params.id),
    });
    const res = await fetch(`${API_URL}/${resource}?${qs.toString()}`, {
      headers: authHeaders(),
    });
    checkUnauthorized(res.status);
    const json = (await res.json()) as { data?: { items?: unknown[] } };
    const items = (json.data?.items ?? []) as Record<string, unknown>[];
    return { data: items, total: items.length };
  },
};
