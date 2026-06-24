import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Package, LogOut, Store } from 'lucide-react';
import { getUser, clearAuth } from '../lib/auth';
import { logout } from '../lib/api';

export function Layout() {
  const navigate = useNavigate();
  const user = getUser();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Store size={18} />
          <span>JumlaOP Store</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/products" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Package size={16} />
            Produits
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() ?? '?'}</div>
            <div className="user-info">
              <div className="user-name">{user?.name ?? 'Admin'}</div>
              <div className="user-role">{user?.role ?? ''}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Se déconnecter">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
