import { Admin, Resource } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { ProductList, ProductCreate, ProductEdit } from './resources/products';
import { CategoryList, CategoryCreate, CategoryEdit } from './resources/categories';

export function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      title="JumlaOP Store"
      loginPage={false} // react-admin renders its own login page automatically
    >
      <Resource
        name="products"
        list={ProductList}
        create={ProductCreate}
        edit={ProductEdit}
        options={{ label: 'Produits' }}
      />
      <Resource
        name="categories"
        list={CategoryList}
        create={CategoryCreate}
        edit={CategoryEdit}
        options={{ label: 'Catégories' }}
      />
    </Admin>
  );
}
