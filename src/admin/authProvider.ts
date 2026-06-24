import type { AuthProvider } from 'react-admin';
import { login as apiLogin, logout as apiLogout } from './lib/api';
import { getToken, getUser, isAuthenticated } from './lib/auth';

export const authProvider: AuthProvider = {
  login: async ({ username, password }: { username: string; password: string }) => {
    await apiLogin(username, password);
  },

  logout: async () => {
    await apiLogout();
    return '/login';
  },

  checkAuth: async () => {
    if (!isAuthenticated()) throw new Error('Session expirée');
  },

  checkError: async (error: { status?: number }) => {
    if (error?.status === 401) throw new Error('Non autorisé');
  },

  getIdentity: async () => {
    const user = getUser();
    if (!user) throw new Error('Non authentifié');
    return {
      id:       user.id,
      fullName: user.name,
      avatar:   undefined,
    };
  },

  getPermissions: async () => {
    const token = getToken();
    if (!token) return '';
    const user = getUser();
    return user?.role ?? '';
  },
};
