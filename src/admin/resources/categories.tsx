import {
  List,
  Datagrid,
  TextField,
  DateField,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  required,
} from 'react-admin';

export const CategoryList = () => (
  <List perPage={50} sort={{ field: 'name', order: 'ASC' }}>
    <Datagrid rowClick="edit">
      <TextField source="name" label="Nom" />
      <TextField source="description" label="Description" sortable={false} />
      <DateField source="created_at" label="Créée le" />
    </Datagrid>
  </List>
);

const CategoryForm = () => (
  <SimpleForm>
    <TextInput source="name"        label="Nom"         validate={required()} fullWidth />
    <TextInput source="description" label="Description" multiline rows={2}   fullWidth />
  </SimpleForm>
);

export const CategoryCreate = () => (
  <Create redirect="list">
    <CategoryForm />
  </Create>
);

export const CategoryEdit = () => (
  <Edit redirect="list">
    <CategoryForm />
  </Edit>
);
