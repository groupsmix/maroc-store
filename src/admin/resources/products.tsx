/**
 * Products resource — wired to the actual API contract.
 *
 * DB column names (snake_case) are used as react-admin "source" props because
 * that is what the API returns in GET responses. The dataProvider's toProductApiBody()
 * converts them back to camelCase on write.
 *
 * Field reality (from products table + routes.ts):
 *   sell_price   — decimal string from DB (e.g. "149.000")
 *   cost_price   — decimal string from DB
 *   is_active    — boolean
 *   image_url    — single URL, CDN-restricted (*.r2.cloudflarestorage.com / *.jumlaop.ma / *.jumlaop.com)
 *   sku          — required (min 1)
 *   unit         — required (default 'piece')
 *   has_variants — boolean, informational only (no variant CRUD endpoint yet)
 *   category_id  — UUID FK, no /categories endpoint yet → plain TextInput
 *
 * No search-by-category filter (API doesn't support it).
 * No is_active filter (API doesn't support it).
 * Search param sent as "search" (paginationSchema key), SearchInput sends filter.q → dataProvider maps it.
 *
 * Variants: no API endpoint yet — removed from form.
 */

import {
  List,
  Datagrid,
  TextField,
  NumberField,
  BooleanField,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  SearchInput,
  useRecordContext,
  DateField,
  required,
  minValue,
  SelectInput,
} from 'react-admin';

// ── Margin chip ───────────────────────────────────────────────────────────────

function MarginField({ label: _label }: { label: string }) {
  const record = useRecordContext();
  if (!record) return null;
  const sale = Number(record.sell_price);
  const cost = Number(record.cost_price);
  if (!sale || !cost || cost >= sale) return <span style={{ color: '#9ca3af' }}>—</span>;
  const pct = Math.round(((sale - cost) / sale) * 100);
  return (
    <span style={{ color: '#10b981', fontWeight: 600, fontSize: 13 }}>
      {pct} %
    </span>
  );
}
MarginField.displayName = 'MarginField';

// ── Filters ───────────────────────────────────────────────────────────────────
// Only "search" is supported by paginationSchema. No category/status server-side filter.

const productFilters = [
  <SearchInput key="q" source="q" alwaysOn placeholder="Nom, SKU, code-barres…" />,
];

// ── List ─────────────────────────────────────────────────────────────────────

export const ProductList = () => (
  <List
    filters={productFilters}
    perPage={20}
    sort={{ field: 'created_at', order: 'DESC' }}
  >
    <Datagrid rowClick="edit">
      <TextField  source="name"       label="Nom"          />
      <TextField  source="sku"        label="SKU"          sortable={false} />
      <TextField  source="barcode"    label="Code-barres"  sortable={false} />
      <NumberField
        source="sell_price"
        label="Prix de vente"
        sortable={false}
        options={{ style: 'currency', currency: 'MAD', maximumFractionDigits: 2 }}
      />
      <NumberField
        source="cost_price"
        label="Prix de revient"
        sortable={false}
        options={{ style: 'currency', currency: 'MAD', maximumFractionDigits: 2 }}
      />
      <MarginField label="Marge" />
      <BooleanField source="is_active"   label="Actif"    sortable={false} />
      <DateField    source="created_at"  label="Créé le"  showTime />
    </Datagrid>
  </List>
);

// ── Form ──────────────────────────────────────────────────────────────────────

const UNIT_CHOICES = [
  { id: 'piece',    name: 'Pièce'    },
  { id: 'kg',       name: 'Kg'       },
  { id: 'g',        name: 'Gramme'   },
  { id: 'litre',    name: 'Litre'    },
  { id: 'ml',       name: 'ml'       },
  { id: 'box',      name: 'Boîte'    },
  { id: 'pack',     name: 'Pack'     },
  { id: 'pair',     name: 'Paire'    },
];

const ProductForm = () => (
  <SimpleForm>
    {/* ── Identity ── */}
    <TextInput source="name"        label="Nom (FR)"        validate={required()} fullWidth />
    <TextInput source="name_ar"     label="Nom (AR)"        fullWidth dir="rtl" />
    <TextInput source="description" label="Description"     multiline rows={3} fullWidth />

    {/* ── Pricing ── */}
    <NumberInput
      source="sell_price"
      label="Prix de vente (MAD)"
      validate={[required(), minValue(0)]}
      min={0} step={0.01}
      helperText="Prix affiché aux clients"
    />
    <NumberInput
      source="cost_price"
      label="Prix de revient (MAD)"
      validate={minValue(0)}
      min={0} step={0.01}
      helperText="Votre coût d'achat — non visible sur le store"
    />
    <NumberInput
      source="wholesale_price"
      label="Prix grossiste (MAD)"
      validate={minValue(0)}
      min={0} step={0.01}
      helperText="Optionnel — pour les clients wholesale"
    />
    <NumberInput
      source="tax_rate"
      label="TVA (%)"
      validate={minValue(0)}
      min={0} max={30} step={0.5}
      helperText="Optionnel — ex: 20 pour 20%"
    />

    {/* ── Inventory ── */}
    <TextInput
      source="sku"
      label="SKU"
      validate={required()}
      helperText="Référence interne unique (obligatoire)"
    />
    <TextInput source="barcode" label="Code-barres (EAN)" />
    <SelectInput
      source="unit"
      label="Unité"
      choices={UNIT_CHOICES}
      defaultValue="piece"
    />

    {/* ── Image ── */}
    <TextInput
      source="image_url"
      label="URL de l'image"
      fullWidth
      type="url"
      helperText="Doit pointer vers *.r2.cloudflarestorage.com, *.jumlaop.ma ou *.jumlaop.com — uploadez d'abord vers R2"
    />

    {/* ── Status ── */}
    <BooleanInput source="is_active" label="Publié (visible sur le store)" defaultValue={true} />
    <BooleanInput source="has_variants" label="Ce produit a des variantes" defaultValue={false} />
  </SimpleForm>
);

// ── Create / Edit ─────────────────────────────────────────────────────────────

export const ProductCreate = () => (
  <Create redirect="list">
    <ProductForm />
  </Create>
);

export const ProductEdit = () => (
  <Edit redirect="list">
    <ProductForm />
  </Edit>
);
