import { getCart, getCount, addToCart, removeFromCart, updateQty } from './cart.js';
import { PROMO_CODES } from './data.js';

/* ─── Badge ─────────────────────────────────────────────── */
function updateBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = getCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

/* ─── Drawer promo state ─────────────────────────────────── */
let drawerPromo = null; // { code, pct }

/* ─── Drawer ─────────────────────────────────────────────── */
function buildDrawer() {
  if (document.getElementById('cart-drawer')) return;

  const overlay = document.createElement('div');
  overlay.id = 'cart-overlay';
  overlay.className = 'cart-overlay';
  overlay.addEventListener('click', closeDrawer);

  const drawer = document.createElement('div');
  drawer.id = 'cart-drawer';
  drawer.className = 'cart-drawer';
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-label', 'Mon panier');
  drawer.innerHTML = `
    <div class="cd-header">
      <span class="cd-title">Mon Panier</span>
      <button class="cd-close" aria-label="Fermer">✕</button>
    </div>
    <div class="cd-body" id="cd-body"></div>
    <div class="cd-footer" id="cd-footer"></div>`;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);
  drawer.querySelector('.cd-close').addEventListener('click', closeDrawer);
}

function openDrawer() {
  buildDrawer();
  renderDrawer();
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.body.style.overflow = '';
}

function formatPrice(n) {
  return n.toLocaleString('fr-MA') + ' MAD';
}

function renderDrawer() {
  const body = document.getElementById('cd-body');
  const footer = document.getElementById('cd-footer');
  if (!body || !footer) return;

  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (!cart.length) {
    body.innerHTML = `
      <div class="cd-empty">
        <div style="font-size:2.4rem;margin-bottom:12px">🛒</div>
        <p style="font-weight:600;margin-bottom:6px">Votre panier est vide</p>
        <p style="font-size:.83rem;color:var(--ink-muted)">Ajoutez des produits pour commander.</p>
      </div>`;
    footer.innerHTML = `<a href="/produits.html" class="btn btn-primary btn-full cd-cta" onclick="document.body.style.overflow=''">Voir les produits</a>`;
    return;
  }

  body.innerHTML = cart
    .map(
      (item) => `
    <div class="cd-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" class="cd-item-img" width="64" height="64">
      <div class="cd-item-info">
        <div class="cd-item-name">${item.name}</div>
        <div class="cd-item-price">${formatPrice(item.price)}</div>
        <div class="cd-item-controls">
          <button class="cd-qty-btn cd-dec" data-id="${item.id}">−</button>
          <span class="cd-qty-val">${item.qty}</span>
          <button class="cd-qty-btn cd-inc" data-id="${item.id}">+</button>
          <button class="cd-remove" data-id="${item.id}" aria-label="Supprimer">✕</button>
        </div>
      </div>
      <div class="cd-item-sub">${formatPrice(item.price * item.qty)}</div>
    </div>`,
    )
    .join('');

  const discount = drawerPromo ? Math.round((total * drawerPromo.pct) / 100) : 0;
  const finalTotal = total - discount;
  const promoApplied = !!drawerPromo;

  footer.innerHTML = `
    <div class="cd-promo-wrap">
      <div class="cd-promo-row">
        <input type="text" class="cd-promo-input" id="cd-promo-input" placeholder="Code promo"
          value="${drawerPromo ? drawerPromo.code : ''}" ${promoApplied ? 'disabled' : ''}
          style="text-transform:uppercase">
        <button class="cd-promo-btn ${promoApplied ? 'applied' : ''}" id="cd-promo-btn">
          ${promoApplied ? 'Supprimer' : 'Appliquer'}
        </button>
      </div>
      <div class="cd-promo-msg ${promoApplied ? 'ok' : ''}" id="cd-promo-msg">
        ${promoApplied ? `✓ −${drawerPromo.pct}% appliqué` : ''}
      </div>
    </div>
    ${
      promoApplied
        ? `
    <div class="cd-total-row" style="font-size:.85rem;color:var(--ink-muted)">
      <span>Sous-total</span><span>${formatPrice(total)}</span>
    </div>
    <div class="cd-total-row" style="font-size:.85rem;color:var(--green)">
      <span>Réduction (−${drawerPromo.pct}%)</span><span>−${formatPrice(discount)}</span>
    </div>`
        : ''
    }
    <div class="cd-total-row">
      <span style="font-weight:700">Total</span>
      <span style="font-weight:800;font-size:1.1rem">${formatPrice(finalTotal)}</span>
    </div>
    <a href="/panier.html" class="btn btn-primary btn-full cd-cta" onclick="document.body.style.overflow=''">Finaliser la commande</a>
    <div style="text-align:center;margin-top:8px">
      <button class="cd-continue" onclick="closeDrawerGlobal()">← Continuer mes achats</button>
    </div>`;

  const cdPromoInput = footer.querySelector('#cd-promo-input');
  const cdPromoBtn = footer.querySelector('#cd-promo-btn');
  const cdPromoMsg = footer.querySelector('#cd-promo-msg');

  cdPromoBtn.addEventListener('click', () => {
    if (drawerPromo) {
      drawerPromo = null;
      renderDrawer();
      return;
    }
    const code = cdPromoInput.value.trim().toUpperCase();
    const pct = PROMO_CODES[code];
    if (!pct) {
      cdPromoMsg.textContent = 'Code invalide.';
      cdPromoMsg.className = 'cd-promo-msg err';
      return;
    }
    drawerPromo = { code, pct };
    renderDrawer();
  });

  cdPromoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') cdPromoBtn.click();
  });

  body.querySelectorAll('.cd-dec').forEach((btn) =>
    btn.addEventListener('click', () => {
      const item = getCart().find((i) => i.id === btn.dataset.id);
      if (item) {
        updateQty(item.id, item.qty - 1);
        renderDrawer();
      }
    }),
  );
  body.querySelectorAll('.cd-inc').forEach((btn) =>
    btn.addEventListener('click', () => {
      const item = getCart().find((i) => i.id === btn.dataset.id);
      if (item) {
        updateQty(item.id, item.qty + 1);
        renderDrawer();
      }
    }),
  );
  body.querySelectorAll('.cd-remove').forEach((btn) =>
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.id);
      renderDrawer();
    }),
  );
}

window.closeDrawerGlobal = closeDrawer;

/* ─── Cart icon in header ────────────────────────────────── */
function mountCartIcon() {
  const actions = document.querySelector('.header-actions');
  if (!actions || document.getElementById('cart-icon-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'cart-icon-btn';
  btn.setAttribute('aria-label', 'Mon panier');
  btn.className = 'cart-icon-link';
  btn.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
    <span class="cart-badge" id="cart-badge"></span>`;

  btn.addEventListener('click', openDrawer);
  actions.prepend(btn);
  updateBadge();
}

/* ─── Product card add-to-cart (event delegation) ────────── */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-cart');
  if (!btn) return;
  const product = {
    id: btn.dataset.productId,
    name: btn.dataset.productName,
    price: parseFloat(btn.dataset.productPrice),
    image: btn.dataset.productImage,
  };
  addToCart(product, 1);
  const orig = btn.textContent;
  btn.textContent = '✓';
  btn.classList.add('btn-cart-added');
  setTimeout(() => {
    btn.textContent = orig;
    btn.classList.remove('btn-cart-added');
  }, 1200);
  openDrawer();
});

/* ─── Toast for product-page add-to-cart ─────────────────── */
export function showCartToast() {
  openDrawer();
}

document.addEventListener('DOMContentLoaded', mountCartIcon);
window.addEventListener('cart-updated', () => {
  updateBadge();
  renderDrawer();
});
