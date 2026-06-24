import type { DataProvider } from 'react-admin';
import { getToken, clearAuth } from './lib/auth';

const API_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://api.zidni.store';

// ── helpers ──────────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleUnauthorized(status: number) {
  if (status === 401) {
    clearAuth();
    throw new Error('Unauthorized');
  }
}

// Prices come as decimal strings from the API — convert to numbers for react-admin
function normalizeProduct(p: Record<string, unknown>) {
  return {
    ...p,
    sale_price: p.sale_price != null ? Number(p.sale_price) : 0,
    cost_price: p.cost_price != null ? Number(p.cost_price) : 0,
  };
}

function normalize(resource: string, record: Record<string, unknown>) {
  if (resource === 'products') return normalizeProduct(record);
  return record;
}

async function apiFetch(method: string, path: string, body?: unknown): Promise<unknown> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  handleUnauthorized(res.status);

  const json = (await res.json()) as { success?: boolean; data?: unknown; error?: { message: string } };

  if (!res.ok || json.success === false) {
    throw new Error(json.error?.message ?? `API error ${res.status}`);
  }

  return json.data ?? json;
}

// ── data provider ─────────────────────────────────────────────────────────────

export const dataProvider: DataProvider = {
  // ── List ──────────────────────────────────────────────────────────────────
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { filter } = params;

    const qs = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    for (const [k, v] of Object.entries(filter)) {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    }

    const res = await fetch(`${API_URL}/${resource}?${qs.toString()}`, {
      headers: authHeaders(),
    });
    handleUnauthorized(res.status);

    const json = (await res.json()) as {
      data?: Record<string, unknown>[];
      meta?: { total: number };
      success?: boolean;
    };

    const rows = (json.data ?? (json as unknown as Record<string, unknown>[]));
    const data = (Array.isArray(rows) ? rows : []).map(r => normalize(resource, r));
    const total = json.meta?.total ?? data.length;

    return { data, total };
  },

  // ── One ───────────────────────────────────────────────────────────────────
  getOne: async (resource, { id }) => {
    const data = (await apiFetch('GET', `/${resource}/${id}`)) as Record<string, unknown>;
    return { data: normalize(resource, data) };
  },

  // ── Create ────────────────────────────────────────────────────────────────
  create: async (resource, { data }) => {
    const created = (await apiFetch('POST', `/${resource}`, data)) as Record<string, unknown>;
    return { data: normalize(resource, created) };
  },

  // ── Update ────────────────────────────────────────────────────────────────
  update: async (resource, { id, data }) => {
    const updated = (await apiFetch('PUT', `/${resource}/${id}`, data)) as Record<string, unknown>;
    return { data: normalize(resource, updated) };
  },

  // ── Delete ────────────────────────────────────────────────────────────────
  delete: async (resource, { id }) => {
    await apiFetch('DELETE', `/${resource}/${id}`);
    return { data: { id } as Record<string, unknown> };
  },

  deleteMany: async (resource, { ids }) => {
    await Promise.all(ids.map(id => apiFetch('DELETE', `/${resource}/${id}`)));
    return { data: ids };
  },

  // ── Many ──────────────────────────────────────────────────────────────────
  getMany: async (resource, { ids }) => {
    const data = await Promise.all(
      ids.map(async id => {
        const r = (await apiFetch('GET', `/${resource}/${id}`)) as Record<string, unknown>;
        return normalize(resource, r);
      }),
    );
    return { data };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const qs = new URLSearchParams({
      page:            String(page),
      per_page:        String(perPage),
      [params.target]: String(params.id),
    });

    const res = await fetch(`${API_URL}/${resource}?${qs.toString()}`, {
      headers: authHeaders(),
    });
    handleUnauthorized(res.status);

    const json = (await res.json()) as {
      data?: Record<string, unknown>[];
      meta?: { total: number };
    };

    const rows = json.data ?? [];
    const data = rows.map(r => normalize(resource, r));
    return { data, total: json.meta?.total ?? data.length };
  },
};
