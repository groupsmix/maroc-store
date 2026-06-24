import { Plus, Trash2 } from 'lucide-react';
import type { VariantInput } from '../lib/types';

interface Props {
  variants: VariantInput[];
  onChange: (variants: VariantInput[]) => void;
}

const empty = (): VariantInput => ({ name: '', sku: '', barcode: '', qty_on_hand: undefined });

export function VariantEditor({ variants, onChange }: Props) {
  function add() { onChange([...variants, empty()]); }

  function update(i: number, patch: Partial<VariantInput>) {
    onChange(variants.map((v, idx) => idx === i ? { ...v, ...patch } : v));
  }

  function remove(i: number) { onChange(variants.filter((_, idx) => idx !== i)); }

  return (
    <div className="variant-editor">
      {variants.length === 0 && (
        <p className="variant-empty">Pas de variantes. Ajoutez-en si le produit existe en plusieurs tailles ou couleurs.</p>
      )}

      {variants.map((v, i) => (
        <div key={i} className="variant-row">
          <div className="variant-fields">
            <div className="field field-inline">
              <label>Nom</label>
              <input
                placeholder="ex: Rouge / L"
                value={v.name}
                onChange={e => update(i, { name: e.target.value })}
              />
            </div>
            <div className="field field-inline">
              <label>SKU</label>
              <input
                placeholder="Optionnel"
                value={v.sku ?? ''}
                onChange={e => update(i, { sku: e.target.value })}
              />
            </div>
            <div className="field field-inline">
              <label>Code-barres</label>
              <input
                placeholder="Optionnel"
                value={v.barcode ?? ''}
                onChange={e => update(i, { barcode: e.target.value })}
              />
            </div>
            <div className="field field-inline">
              <label>Stock</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={v.qty_on_hand ?? ''}
                onChange={e => update(i, { qty_on_hand: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>
          <button
            type="button"
            className="icon-btn danger variant-del"
            onClick={() => remove(i)}
            title="Supprimer cette variante"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <button type="button" className="btn btn-ghost btn-sm" onClick={add}>
        <Plus size={14} /> Ajouter une variante
      </button>
    </div>
  );
}
