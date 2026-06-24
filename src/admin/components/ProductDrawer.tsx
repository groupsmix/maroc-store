import { useState, useEffect, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createProduct, updateProduct, getVariants, createVariant } from '../lib/api';
import { VariantEditor } from './VariantEditor';
import type { Product, Category, VariantInput, ProductCreateInput } from '../lib/types';

interface Props {
  open: boolean;
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

function margin(sale: string, cost: string): string {
  const s = Number(sale); const c = Number(cost);
  if (!s || !c || c >= s) return '';
  return `Marge : ${Math.round(((s - c) / s) * 100)} %`;
}

const EMPTY_FORM: ProductCreateInput & { qty_on_hand: number; images: string[] } = {
  name: '', description: '', sku: '', barcode: '',
  cost_price: 0, sale_price: 0,
  category_id: '', is_active: true,
  images: [], qty_on_hand: 0,
};

export function ProductDrawer({ open, product, categories, onClose, onSaved }: Props) {
  const isEdit = product !== null;

  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [variants, setVariants] = useState<VariantInput[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

  // Load existing variants when editing
  const { data: existingVariants } = useQuery({
    queryKey: ['variants', product?.id],
    queryFn: () => getVariants(product!.id),
    enabled: isEdit && open,
  });

  // Populate form when editing
  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        name:        product.name,
        description: product.description ?? '',
        sku:         product.sku ?? '',
        barcode:     product.barcode ?? '',
        cost_price:  Number(product.cost_price),
        sale_price:  Number(product.sale_price),
        category_id: product.category_id ?? '',
        is_active:   product.is_active,
        images:      product.images ?? [],
        qty_on_hand: product.qty_on_hand ?? 0,
      });
    } else {
      setForm({ ...EMPTY_FORM });
      setVariants([]);
    }
    setErrors({});
    setApiError('');
    setImageUrl('');
  }, [open, product]);

  useEffect(() => {
    if (existingVariants) {
      setVariants(existingVariants.map(v => ({
        name:          v.name,
        sku:           v.sku ?? '',
        barcode:       v.barcode ?? '',
        qty_on_hand:   v.qty_on_hand ?? undefined,
        price_override: v.price_override ? Number(v.price_override) : undefined,
      })));
    }
  }, [existingVariants]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim())      e.name = 'Le nom est requis.';
    if (!form.sale_price)       e.sale_price = 'Le prix de vente est requis.';
    if (form.sale_price < 0)    e.sale_price = 'Le prix doit être positif.';
    variants.forEach((v, i) => {
      if (!v.name.trim()) e[`variant_${i}`] = 'Le nom de la variante est requis.';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: ProductCreateInput = {
        name:        form.name.trim(),
        description: form.description?.trim() || undefined,
        sku:         form.sku?.trim() || undefined,
        barcode:     form.barcode?.trim() || undefined,
        cost_price:  form.cost_price,
        sale_price:  form.sale_price,
        category_id: form.category_id || undefined,
        is_active:   form.is_active,
        images:      form.images.filter(Boolean),
      };
      const saved = isEdit
        ? await updateProduct(product!.id, payload)
        : await createProduct(payload);

      // Save variants (create only — no variant update endpoint yet)
      for (const v of variants) {
        if (v.name.trim()) {
          await createVariant(saved.id, {
            name:       v.name.trim(),
            sku:        v.sku?.trim() || undefined,
            barcode:    v.barcode?.trim() || undefined,
            qty_on_hand: v.qty_on_hand,
          });
        }
      }
    },
    onSuccess: onSaved,
    onError: (err: Error) => setApiError(err.message),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');
    saveMutation.mutate();
  }

  function addImage() {
    const url = imageUrl.trim();
    if (url && !form.images.includes(url)) {
      set('images', [...form.images, url]);
      setImageUrl('');
    }
  }

  function removeImage(url: string) {
    set('images', form.images.filter(u => u !== url));
  }

  return (
    <>
      {/* Backdrop */}
      {open && <div className="drawer-backdrop" onClick={onClose} />}

      <aside className={`drawer${open ? ' drawer-open' : ''}`}>
        <div className="drawer-header">
          <h2 className="drawer-title">{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form className="drawer-body" onSubmit={handleSubmit} noValidate>
          {/* ── Infos ── */}
          <section className="form-section">
            <div className="field">
              <label>Nom <span className="req">*</span></label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="ex: Montre Smart Pro"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Description courte du produit…"
              />
            </div>
          </section>

          {/* ── Pricing ── */}
          <section className="form-section">
            <div className="section-label">Prix</div>
            <div className="field-row">
              <div className="field">
                <label>Prix de vente <span className="req">*</span></label>
                <div className="input-suffix">
                  <input
                    type="number" min="0" step="0.01"
                    value={form.sale_price || ''}
                    onChange={e => set('sale_price', Number(e.target.value))}
                    placeholder="0.00"
                  />
                  <span>MAD</span>
                </div>
                {errors.sale_price && <span className="field-error">{errors.sale_price}</span>}
              </div>
              <div className="field">
                <label>Prix de revient</label>
                <div className="input-suffix">
                  <input
                    type="number" min="0" step="0.01"
                    value={form.cost_price || ''}
                    onChange={e => set('cost_price', Number(e.target.value))}
                    placeholder="0.00"
                  />
                  <span>MAD</span>
                </div>
                {form.sale_price > 0 && form.cost_price > 0 && (
                  <span className="field-hint">{margin(String(form.sale_price), String(form.cost_price))}</span>
                )}
              </div>
            </div>
          </section>

          {/* ── Inventory ── */}
          <section className="form-section">
            <div className="section-label">Inventaire</div>
            <div className="field-row">
              <div className="field">
                <label>SKU</label>
                <input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="ex: SKU-001" />
              </div>
              <div className="field">
                <label>Code-barres</label>
                <input value={form.barcode} onChange={e => set('barcode', e.target.value)} placeholder="ex: 6111234567890" />
              </div>
            </div>
            <div className="field field-short">
              <label>Stock initial</label>
              <input
                type="number" min="0"
                value={form.qty_on_hand || ''}
                onChange={e => set('qty_on_hand', Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </section>

          {/* ── Category ── */}
          <section className="form-section">
            <div className="section-label">Catégorie</div>
            <div className="field">
              <label>Catégorie</label>
              <select value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                <option value="">Sans catégorie</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </section>

          {/* ── Images ── */}
          <section className="form-section">
            <div className="section-label">Images</div>
            <div className="field">
              <label>URL de l'image</label>
              <div className="input-action">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://…"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); }}}
                />
                <button type="button" className="btn btn-ghost btn-sm" onClick={addImage}>Ajouter</button>
              </div>
            </div>
            {form.images.length > 0 && (
              <div className="image-list">
                {form.images.map(url => (
                  <div key={url} className="image-item">
                    <img src={url} alt="" className="image-preview" />
                    <button type="button" className="image-remove" onClick={() => removeImage(url)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Variants ── */}
          <section className="form-section">
            <div className="section-label">Variantes</div>
            <VariantEditor variants={variants} onChange={setVariants} />
            {Object.entries(errors).filter(([k]) => k.startsWith('variant_')).map(([k, msg]) => (
              <span key={k} className="field-error">{msg}</span>
            ))}
          </section>

          {/* ── Status ── */}
          <section className="form-section">
            <label className="toggle-row">
              <span>Publié</span>
              <input
                type="checkbox"
                className="toggle-checkbox"
                checked={form.is_active}
                onChange={e => set('is_active', e.target.checked)}
              />
              <span className="toggle-track" />
            </label>
          </section>

          {apiError && <div className="form-error">{apiError}</div>}

          <div className="drawer-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le produit'}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
