import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Pencil, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { getProducts, getCategories, deleteProduct } from '../lib/api';
import { ProductDrawer } from '../components/ProductDrawer';
import type { Product } from '../lib/types';
import { clsx } from 'clsx';

const PER_PAGE = 20;

function fmt(price: string) {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 2 })
    .format(Number(price));
}

export function ProductsPage() {
  const qc = useQueryClient();

  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing]       = useState<Product | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  const is_active = statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', page, search, categoryId, is_active],
    queryFn: () => getProducts({ page, per_page: PER_PAGE, q: search || undefined, category_id: categoryId || undefined, is_active }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: Infinity,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] });
      setDeleteId(null);
      setSelected(s => { const n = new Set(s); n.delete(deleteId!); return n; });
    },
  });

  const deleteBulkMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) await deleteProduct(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] });
      setSelected(new Set());
    },
  });

  const products = data?.data ?? [];
  const total    = data?.meta?.total ?? 0;
  const pages    = Math.max(1, Math.ceil(total / PER_PAGE));

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleAll() {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map(p => p.id)));
    }
  }

  function openAdd() { setEditing(null); setDrawerOpen(true); }
  function openEdit(p: Product) { setEditing(p); setDrawerOpen(true); }
  function closeDrawer() { setDrawerOpen(false); setEditing(null); }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Produits</h1>
          <p className="page-sub">{total} produit{total !== 1 ? 's' : ''} au total</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Ajouter un produit
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <form className="search-wrap" onSubmit={handleSearch}>
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            placeholder="Rechercher par nom, SKU…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </form>

        <select
          className="filter-select"
          value={categoryId}
          onChange={e => { setCategoryId(e.target.value); setPage(1); }}
        >
          <option value="">Toutes les catégories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">Tout statut</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>

        {selected.size > 0 && (
          <button
            className="btn btn-danger-ghost"
            onClick={() => deleteBulkMutation.mutate([...selected])}
            disabled={deleteBulkMutation.isPending}
          >
            <Trash2 size={14} />
            Supprimer ({selected.size})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrap">
        {isError && (
          <div className="error-state">
            <AlertCircle size={18} />
            Erreur lors du chargement des produits.
          </div>
        )}

        {!isError && (
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-check">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selected.size === products.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="col-img"></th>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>SKU</th>
                <th className="col-right">Prix de vente</th>
                <th className="col-right">Prix de revient</th>
                <th className="col-center">Stock</th>
                <th className="col-center">Statut</th>
                <th className="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td><div className="skel skel-sm" /></td>
                  <td><div className="skel skel-img" /></td>
                  <td><div className="skel skel-lg" /></td>
                  <td><div className="skel skel-md" /></td>
                  <td><div className="skel skel-md" /></td>
                  <td><div className="skel skel-md" /></td>
                  <td><div className="skel skel-md" /></td>
                  <td><div className="skel skel-sm" /></td>
                  <td><div className="skel skel-sm" /></td>
                  <td></td>
                </tr>
              ))}

              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={10}>
                    <div className="empty-state">
                      <div className="empty-icon">📦</div>
                      <div className="empty-title">Aucun produit trouvé</div>
                      <div className="empty-sub">
                        {search ? 'Essayez une autre recherche.' : 'Ajoutez votre premier produit.'}
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && products.map(p => (
                <tr
                  key={p.id}
                  className={clsx('data-row', selected.has(p.id) && 'selected')}
                  onClick={() => toggleSelect(p.id)}
                >
                  <td className="col-check" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>
                  <td className="col-img">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="product-thumb" />
                    ) : (
                      <div className="product-thumb placeholder-thumb">📦</div>
                    )}
                  </td>
                  <td>
                    <div className="product-name">{p.name}</div>
                    {p.description && (
                      <div className="product-desc">{p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}</div>
                    )}
                  </td>
                  <td>
                    {p.category ? (
                      <span className="badge badge-gray">{p.category.name}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <span className="mono-text">{p.sku ?? <span className="text-muted">—</span>}</span>
                  </td>
                  <td className="col-right">
                    <span className="price-text">{fmt(p.sale_price)}</span>
                  </td>
                  <td className="col-right">
                    <span className="text-muted">{fmt(p.cost_price)}</span>
                  </td>
                  <td className="col-center">
                    {p.qty_on_hand != null ? (
                      <span className={clsx('stock-badge', p.qty_on_hand === 0 && 'out-of-stock')}>
                        {p.qty_on_hand}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="col-center">
                    <span className={clsx('status-dot', p.is_active ? 'dot-active' : 'dot-inactive')}>
                      {p.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="col-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="icon-btn"
                      title="Modifier"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="icon-btn danger"
                      title="Supprimer"
                      onClick={() => setDeleteId(p.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={15} />
          </button>
          <span className="page-info">Page {page} / {pages}</span>
          <button
            className="page-btn"
            disabled={page === pages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Supprimer ce produit ?</h3>
            <p className="modal-body">Cette action est irréversible. Le produit sera supprimé définitivement.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Annuler</button>
              <button
                className="btn btn-danger"
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product drawer */}
      <ProductDrawer
        open={drawerOpen}
        product={editing}
        categories={categories}
        onClose={closeDrawer}
        onSaved={() => {
          closeDrawer();
          void qc.invalidateQueries({ queryKey: ['products'] });
        }}
      />
    </div>
  );
}
