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
  ReferenceInput,
  SelectInput,
  ArrayInput,
  SimpleFormIterator,
  required,
  minValue,
  SearchInput,
  useRecordContext,
  DateField,
} from 'react-admin';

// ── Filters ───────────────────────────────────────────────────────────────────

const productFilters = [
  <SearchInput key="q" source="q" alwaysOn placeholder="Nom, SKU, code-barres…" />,
  <ReferenceInput key="cat" source="category_id" reference="categories" alwaysOn>
    <SelectInput optionText="name" label="Catégorie" emptyText="Toutes" />
  </ReferenceInput>,
  <SelectInput
    key="status"
    source="is_active"
    label="Statut"
    choices={[
      { id: 'true', name: 'Actif' },
      { id: 'false', name: 'Inactif' },
    ]}
  />,
];

// ── Margin display ─────────────────────────────────────────────────────────────

function MarginField() {
  const record = useRecordContext();
  if (!record) return null;
  const sale = Number(record.sale_price);
  const cost = Number(record.cost_price);
  if (!sale || !cost || cost >= sale) return <span>—</span>;
  const pct = Math.round(((sale - cost) / sale) * 100);
  return <span style={{ color: '#10b981', fontWeight: 600 }}>{pct} %</span>;
}
MarginField.displayName = 'MarginField';

// ── List ─────────────────────────────────────────────────────────────────────

export const ProductList = () => (
  <List
    filters={productFilters}
    perPage={20}
    sort={{ field: 'name', order: 'ASC' }}
  >
    <Datagrid rowClick="edit" bulkActionButtons={<></>}>
      <TextField source="name" label="Nom" />
      <TextField source="category.name" label="Catégorie" sortable={false} />
      <TextField source="sku" label="SKU" sortable={false} />
      <TextField source="barcode" label="Code-barres" sortable={false} />
      <NumberField
        source="sale_price"
        label="Prix de vente"
        options={{ style: 'currency', currency: 'MAD', maximumFractionDigits: 2 }}
      />
      <NumberField
        source="cost_price"
        label="Prix de revient"
        options={{ style: 'currency', currency: 'MAD', maximumFractionDigits: 2 }}
      />
      <MarginField label="Marge" />
      <NumberField source="qty_on_hand" label="Stock" sortable={false} />
      <BooleanField source="is_active" label="Actif" />
      <DateField source="updated_at" label="Modifié" showTime />
    </Datagrid>
  </List>
);

// ── Form ──────────────────────────────────────────────────────────────────────

const ProductForm = () => (
  <SimpleForm>
    {/* Basic info */}
    <TextInput source="name" label="Nom" validate={required()} fullWidth />
    <TextInput source="description" label="Description" multiline rows={3} fullWidth />

    <ReferenceInput source="category_id" reference="categories">
      <SelectInput optionText="name" label="Catégorie" />
    </ReferenceInput>

    {/* Pricing */}
    <NumberInput
      source="sale_price"
      label="Prix de vente (MAD)"
      validate={[required(), minValue(0)]}
      min={0}
      step={0.01}
    />
    <NumberInput
      source="cost_price"
      label="Prix de revient (MAD)"
      validate={minValue(0)}
      min={0}
      step={0.01}
      helperText="Utilisé pour calculer la marge — non visible sur le store"
    />

    {/* Inventory */}
    <TextInput source="sku" label="SKU" />
    <TextInput source="barcode" label="Code-barres" />

    {/* Images — list of URLs */}
    <ArrayInput source="images" label="Images (URLs)">
      <SimpleFormIterator disableReordering={false}>
        <TextInput source="" label="URL de l'image" type="url" fullWidth helperText={false} />
      </SimpleFormIterator>
    </ArrayInput>

    {/* Variants */}
    <ArrayInput source="variants" label="Variantes (taille, couleur, etc.)">
      <SimpleFormIterator disableReordering={false}>
        <TextInput source="name"        label="Nom"         validate={required()} />
        <TextInput source="sku"         label="SKU"         />
        <TextInput source="barcode"     label="Code-barres" />
        <NumberInput source="qty_on_hand" label="Stock"     min={0} />
      </SimpleFormIterator>
    </ArrayInput>

    {/* Status */}
    <BooleanInput source="is_active" label="Publié (visible sur le store)" defaultValue={true} />
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
