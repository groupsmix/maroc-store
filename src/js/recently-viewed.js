/* ============================================================
   Recently Viewed Products
   - Tracks product visits in localStorage (max 8, FIFO)
   - Renders a sticky bottom bar showing last 4 viewed items
   - Bar auto-hides when scrolled to very top (no history yet)
   ============================================================ */

const STORAGE_KEY = 'marocshop_recently_viewed';
const MAX_STORED = 8;
const MAX_SHOWN = 4;

/* ─── Storage helpers ────────────────────────────────────── */
function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function save(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

/* ─── Track a product view ───────────────────────────────── */
export function trackView(productId) {
  let ids = load().filter((id) => id !== productId);
  ids.unshift(productId);
  if (ids.length > MAX_STORED) ids = ids.slice(0, MAX_STORED);
  save(ids);
}

/* ─── Get recently viewed products (excluding current) ───── */
export function getRecentlyViewed(excludeId = null) {
  return load()
    .filter((id) => id !== excludeId)
    .slice(0, MAX_SHOWN);
}

/* ─── Render & mount the recently-viewed bar ─────────────── */
export function mountRecentBar(products, excludeId = null, basePath = '') {
  const ids = getRecentlyViewed(excludeId);
  if (!ids.length) return;

  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  if (!items.length) return;

  const bar = document.createElement('div');
  bar.id = 'recent-bar';
  bar.setAttribute('aria-label', 'Produits récemment consultés');
  bar.innerHTML = `
    <div class="recent-bar-inner">
      <button class="recent-bar-close" id="recent-bar-close" aria-label="Fermer">✕</button>
      <span class="recent-bar-label">👁 Vus récemment</span>
      <div class="recent-bar-items">
        ${items
          .map((p) => {
            const discount = p.oldPrice
              ? `<span class="recent-item-badge">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>`
              : '';
            return `
            <a href="${basePath}produits/${p.id}.html" class="recent-bar-item" title="${p.name}">
              <img src="${p.image.replace('w=800', 'w=80')}" alt="${p.name}" width="48" height="48" loading="lazy">
              <div class="recent-item-info">
                <div class="recent-item-name">${p.name.length > 22 ? p.name.slice(0, 20) + '…' : p.name}</div>
                <div class="recent-item-price">
                  ${p.price.toLocaleString('fr-MA')} MAD
                  ${discount}
                </div>
              </div>
            </a>`;
          })
          .join('')}
      </div>
      <a href="${basePath}produits.html" class="recent-bar-cta">Voir tout →</a>
    </div>`;

  document.body.appendChild(bar);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => bar.classList.add('visible'));
  });

  // Close button
  document.getElementById('recent-bar-close')?.addEventListener('click', () => {
    bar.classList.remove('visible');
    setTimeout(() => bar.remove(), 350);
  });

  // Auto-hide when near page top (user hasn't scrolled yet)
  let hideOnTop = true;
  window.addEventListener(
    'scroll',
    () => {
      if (hideOnTop && window.scrollY < 80) {
        bar.classList.remove('visible');
      } else {
        hideOnTop = false;
        bar.classList.add('visible');
      }
    },
    { passive: true },
  );
}
