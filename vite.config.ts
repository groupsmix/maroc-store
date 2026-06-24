import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const rawPort = process.env.PORT ?? '5173';
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

const basePath = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base: basePath,
  plugins: [react()],
  root: path.resolve(import.meta.dirname),
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
        produits: path.resolve(import.meta.dirname, 'produits.html'),
        blog: path.resolve(import.meta.dirname, 'blog.html'),
        'a-propos': path.resolve(import.meta.dirname, 'a-propos.html'),
        contact: path.resolve(import.meta.dirname, 'contact.html'),
        faq: path.resolve(import.meta.dirname, 'faq.html'),
        retours: path.resolve(import.meta.dirname, 'retours.html'),
        conditions: path.resolve(import.meta.dirname, 'conditions.html'),
        'p-montre-smart-pro': path.resolve(import.meta.dirname, 'produits/montre-smart-pro.html'),
        'p-ecouteurs-bluetooth': path.resolve(import.meta.dirname, 'produits/ecouteurs-bluetooth.html'),
        'p-bracelet-sport': path.resolve(import.meta.dirname, 'produits/bracelet-sport.html'),
        'p-sac-a-main-femme': path.resolve(import.meta.dirname, 'produits/sac-a-main-femme.html'),
        'p-lampe-led': path.resolve(import.meta.dirname, 'produits/lampe-led-multicolore.html'),
        'blog-guide-smartwatch': path.resolve(import.meta.dirname, 'blog/meilleure-smartwatch-maroc.html'),
        'cat-electronique': path.resolve(import.meta.dirname, 'categorie/electronique.html'),
        'cat-mode': path.resolve(import.meta.dirname, 'categorie/mode.html'),
        'cat-maison': path.resolve(import.meta.dirname, 'categorie/maison.html'),
        'cat-sport': path.resolve(import.meta.dirname, 'categorie/sport.html'),
        admin: path.resolve(import.meta.dirname, 'admin.html'),
        panier: path.resolve(import.meta.dirname, 'panier.html'),
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
