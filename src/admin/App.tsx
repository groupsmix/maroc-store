import { Admin, Resource } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { ProductList, ProductCreate, ProductEdit } from './resources/products';

/**
 * Categories: schema + validators exist in the API codebase, but no route is
 * registered yet. Will be added as a Resource once the API exposes /categories.
 */
export function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      title="MarocShop Admin"
    >
      <Resource
        name="products"
        list={ProductList}
        create={ProductCreate}
        edit={ProductEdit}
        options={{ label: 'Produits' }}
      />
    </Admin>
  );
}
