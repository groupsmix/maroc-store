import { PRODUCTS, CATEGORIES, WHATSAPP_NUMBER, STORE_NAME, PROMO_CODES } from './data.js';
export { PRODUCTS, CATEGORIES, WHATSAPP_NUMBER, STORE_NAME, PROMO_CODES };
import './cart-widget.js';

/* ─── Price formatting ──────────────────────────────────── */
export function formatPrice(price) {
  return price.toLocaleString('fr-MA') + ' MAD';
}

/* ─── Savings % ─────────────────────────────────────────── */
export function savingsPercent(price, oldPrice) {
  return Math.round((1 - price / oldPrice) * 100);
}

/* ─── Badge HTML ─────────────────────────────────────────── */
export function badgeHtml(badge) {
  if (!badge) return '';
  const cls =
    badge === 'Promo' ? 'badge-promo' : badge === 'Nouveau' ? 'badge-nouveau' : 'badge-bestseller';
  return `<span class="badge ${cls}">${badge}</span>`;
}

/* ─── Product Card HTML ──────────────────────────────────── */
export function productCardHtml(p, basePath = '') {
  const savings = p.oldPrice
    ? `<span class="price-savings">-${savingsPercent(p.price, p.oldPrice)}%</span>`
    : '';
  const oldPriceHtml = p.oldPrice
    ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>`
    : '';

  // Inline card rating — read from localStorage without importing reviews module
  // (avoids circular deps; cards are rendered both from pages and product-page)
  let cardRatingHtml = '';
  try {
    const allReviews = JSON.parse(localStorage.getItem('marocshop_reviews') || '{}');
    const reviews = allReviews[p.id] || [];
    if (reviews.length) {
      const avg =
        Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
      const stars = [1, 2, 3, 4, 5]
        .map((i) => {
          if (i <= Math.floor(avg)) return '<span class="star full">★</span>';
          if (i - avg <= 0.5) return '<span class="star half">★</span>';
          return '<span class="star empty">☆</span>';
        })
        .join('');
      cardRatingHtml = `
        <div class="card-rating" itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
          <span class="stars">${stars}</span>
          <span class="rating-score" itemprop="ratingValue" content="${avg}">${avg}</span>
          <span class="rating-count">(<span itemprop="reviewCount">${reviews.length}</span>)</span>
          <meta itemprop="bestRating" content="5"><meta itemprop="worstRating" content="1">
        </div>`;
    }
  } catch {}

  return `
    <article class="product-card" itemscope itemtype="https://schema.org/Product">
      <a href="${basePath}produits/${p.id}.html" class="product-card-image" aria-label="Voir ${p.name}">
        <img src="${p.image}" alt="${p.name} — ${formatPrice(p.price)} au Maroc" loading="lazy" width="400" height="400" itemprop="image">
        <div class="product-card-badge">${badgeHtml(p.badge)}</div>
      </a>
      <div class="product-card-body">
        <meta itemprop="name" content="${p.name}">
        <h3 class="product-card-name">${p.name}</h3>
        ${cardRatingHtml}
        <div class="product-card-price">
          <span class="price-current" itemprop="price" content="${p.price}">${formatPrice(p.price)}</span>
          ${oldPriceHtml}
          ${savings}
        </div>
        <p class="product-card-desc">${p.description}</p>
        <div class="product-card-actions">
          <button class="btn-cart" data-product-id="${p.id}" data-product-name="${p.name.replace(/"/g, '&quot;')}" data-product-price="${p.price}" data-product-image="${p.image}" aria-label="Ajouter au panier">🛒</button>
          <a href="${basePath}produits/${p.id}.html#commander" class="btn-order">Commander</a>
          <a href="${basePath}produits/${p.id}.html" class="btn-detail" aria-label="Détails">→</a>
        </div>
      </div>
    </article>`;
}

/* ─── WhatsApp message builder ───────────────────────────── */
export function buildWhatsAppUrl(order) {
  const msg = `🛒 Nouvelle commande — ${STORE_NAME}

📦 Produit: ${order.product}
🔢 Quantité: ${order.qty}
💰 Total: ${formatPrice(order.price * order.qty)}

👤 Nom: ${order.name}
📱 Téléphone: ${order.phone}
🏙️ Ville: ${order.city}
📍 Adresse: ${order.address}

✅ Paiement: À la livraison (COD)`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/* ─── Order form handler ─────────────────────────────────── */
export function initOrderForm(product) {
  const form = document.getElementById('order-form');
  if (!form) return;

  const qtyInput = form.querySelector('#qty');
  const qtyMinus = form.querySelector('#qty-minus');
  const qtyPlus = form.querySelector('#qty-plus');

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      const v = parseInt(qtyInput.value, 10);
      if (v > 1) qtyInput.value = v - 1;
    });
    qtyPlus.addEventListener('click', () => {
      qtyInput.value = parseInt(qtyInput.value, 10) + 1;
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#name').value.trim();
    const phone = form.querySelector('#phone').value.trim();
    const city = form.querySelector('#city').value;
    const address = form.querySelector('#address').value.trim();
    const qty = parseInt(qtyInput ? qtyInput.value : 1, 10);

    if (!name || !phone || !city || !address) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const url = buildWhatsAppUrl({
      product: product.name,
      qty,
      price: product.price,
      name,
      phone,
      city,
      address,
    });

    // Show confirmation
    form.innerHTML = `
      <div class="confirmation-msg">
        <h3>Commande reçue</h3>
        <p>Nous vous appellerons pour confirmer votre commande. Cliquez ci-dessous pour nous envoyer votre commande par WhatsApp.</p>
        <a href="${url}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-full mt-16" style="margin-top:16px">
          Confirmer via WhatsApp
        </a>
      </div>`;
    window.open(url, '_blank');
  });
}

/* ─── FAQ accordion ──────────────────────────────────────── */
export function initFaq() {
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ─── Gallery ────────────────────────────────────────────── */
export function initGallery() {
  const mainImg = document.getElementById('gallery-main-img');
  const thumbs = document.querySelectorAll('.gallery-thumb');
  if (!mainImg || !thumbs.length) return;
  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = thumb.querySelector('img').src.replace('w=80', 'w=800');
        mainImg.style.opacity = '1';
      }, 150);
    });
  });
}

/* ─── MOROCCAN CITIES ────────────────────────────────────── */
export const CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
  'Safi',
  'El Jadida',
  'Nador',
  'Béni Mellal',
  'Khouribga',
  'Settat',
  'Ksar El Kébir',
  'Larache',
  'Ksar El Kebir',
  'Taza',
  'Mohammedia',
  'Salé',
  'Temara',
  'Khémisset',
  'Tiznit',
  'Guelmim',
  'Dakhla',
  'Laâyoune',
  'Autre',
];

export function citiesOptions() {
  return CITIES.map((c) => `<option value="${c}">${c}</option>`).join('');
}
