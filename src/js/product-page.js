import {
  PRODUCTS,
  WHATSAPP_NUMBER,
  STORE_NAME,
  formatPrice,
  savingsPercent,
  badgeHtml,
  buildWhatsAppUrl,
  initGallery,
  citiesOptions,
} from './main.js';
import { PROMO_CODES } from './data.js';
import { addToCart } from './cart.js';
import { showCartToast } from './cart-widget.js';
import {
  seedDemoReviews,
  renderReviewSection,
  initReviewForm,
  getAggregateRating,
  starsHtml,
} from './reviews.js';
import { trackView, mountRecentBar } from './recently-viewed.js';

export function renderProductPage(productId) {
  const p = PRODUCTS.find((x) => x.id === productId);
  if (!p) {
    document.body.innerHTML =
      '<div style="padding:64px;text-align:center"><h1>Produit introuvable</h1><a href="/produits.html">← Retour à la boutique</a></div>';
    return;
  }

  document.title = `${p.name} — ${formatPrice(p.price)} | MarocShop`;

  const galleryThumbsHtml = p.images
    .map(
      (img, i) => `
    <div class="gallery-thumb ${i === 0 ? 'active' : ''}" role="button" tabindex="0" aria-label="Image ${i + 1}">
      <img src="${img.replace('w=800', 'w=80')}" alt="${p.name} vue ${i + 1}" loading="lazy" width="80" height="80">
    </div>`,
    )
    .join('');

  const related = PRODUCTS.filter((x) => p.related.includes(x.id));
  const relatedHtml = related
    .map((r) => {
      const sp = r.oldPrice
        ? `<span class="price-savings">-${savingsPercent(r.price, r.oldPrice)}%</span>`
        : '';
      return `<a href="/produits/${r.id}.html" style="display:block;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:10px;overflow:hidden;transition:.2s;text-decoration:none" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,.08)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
      <div style="aspect-ratio:1/1;overflow:hidden;background:#f5f5f7"><img src="${r.image}" alt="${r.name}" loading="lazy" width="200" height="200" style="width:100%;height:100%;object-fit:cover"></div>
      <div style="padding:12px 14px">
        <p style="font-size:.84rem;font-weight:600;color:#0d0d0d;margin-bottom:6px;line-height:1.35">${r.name}</p>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:800;color:#C4A472;font-size:.95rem">${formatPrice(r.price)}</span>
          ${r.oldPrice ? `<span style="font-size:.78rem;text-decoration:line-through;color:rgba(0,0,0,.3)">${formatPrice(r.oldPrice)}</span>` : ''}
          ${sp}
        </div>
      </div>
    </a>`;
    })
    .join('');

  const catLabels = {
    electronique: 'Électronique',
    mode: 'Mode',
    maison: 'Maison',
    sport: 'Sport',
  };
  const catLabel = catLabels[p.category] || p.category;

  // Structured data
  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: p.images,
    brand: { '@type': 'Brand', name: 'MarocShop' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MAD',
      price: p.price,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'MarocShop' },
    },
  });
  const breadcrumbJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://votre-domaine.ma/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: catLabel,
        item: `https://votre-domaine.ma/categorie/${p.category}.html`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: p.name,
        item: `https://votre-domaine.ma/produits/${p.id}.html`,
      },
    ],
  });

  const schemaEl = document.createElement('script');
  schemaEl.type = 'application/ld+json';
  schemaEl.textContent = schemaJson;
  document.head.appendChild(schemaEl);
  const bcEl = document.createElement('script');
  bcEl.type = 'application/ld+json';
  bcEl.textContent = breadcrumbJson;
  document.head.appendChild(bcEl);

  const priceWrap = p.oldPrice
    ? `<span class="pdp-price">${formatPrice(p.price)}</span>
       <span class="pdp-price-old">${formatPrice(p.oldPrice)}</span>
       <span class="pdp-savings">−${savingsPercent(p.price, p.oldPrice)}%</span>`
    : `<span class="pdp-price">${formatPrice(p.price)}</span>`;

  document.getElementById('product-content').innerHTML = `
    <!-- Breadcrumb -->
    <nav class="pdp-breadcrumb" aria-label="Fil d'Ariane">
      <a href="/">Accueil</a>
      <span>›</span>
      <a href="/categorie/${p.category}.html">${catLabel}</a>
      <span>›</span>
      <span>${p.name}</span>
    </nav>

    <!-- Main 2-col layout -->
    <div class="pdp-main">
      <!-- Gallery -->
      <div class="pdp-col-gallery">
        <div class="pdp-gallery-main">
          <img id="gallery-main-img" src="${p.images[0]}" alt="${p.name} — ${formatPrice(p.price)} COD Maroc" width="800" height="800">
        </div>
        <div class="pdp-thumbs gallery-thumbs">${galleryThumbsHtml}</div>
      </div>

      <!-- Info + Order -->
      <div class="pdp-col-info" itemscope itemtype="https://schema.org/Product">
        <div class="pdp-badge">${badgeHtml(p.badge)}</div>
        <h1 class="pdp-name" itemprop="name">${p.name}</h1>
        <!-- rating injected here by JS below -->

        <div class="pdp-price-wrap" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <meta itemprop="priceCurrency" content="MAD">
          <meta itemprop="price" content="${p.price}">
          <meta itemprop="availability" content="https://schema.org/InStock">
          ${priceWrap}
        </div>

        <hr class="pdp-sep">
        <p class="pdp-desc" itemprop="description">${p.description}</p>
        <div class="pdp-features">${p.details}</div>

        <div class="pdp-trust">
          <span class="pdp-trust-pill">Paiement à la livraison</span>
          <span class="pdp-trust-pill">Livraison 2–5 jours</span>
          <span class="pdp-trust-pill">Retours 7 jours</span>
        </div>

        <!-- Order form panel -->
        <div class="pdp-form-panel" id="commander">
          <div class="pdp-form-header">
            <span class="pdp-form-label">Commander</span>
            <span class="pdp-form-sublabel">Paiement uniquement à la livraison — aucun prépaiement requis</span>
          </div>
          <form id="order-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="name">Nom complet <span>*</span></label>
              <input type="text" id="name" class="form-control" placeholder="Votre nom complet" required autocomplete="name">
            </div>
            <div class="form-group">
              <label class="form-label" for="phone">Téléphone <span>*</span></label>
              <input type="tel" id="phone" class="form-control" placeholder="06 XX XX XX XX" required autocomplete="tel">
            </div>
            <div class="form-group">
              <label class="form-label" for="city">Ville <span>*</span></label>
              <select id="city" class="form-control" required>
                <option value="">Sélectionnez votre ville...</option>
                ${citiesOptions()}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="address">Adresse complète <span>*</span></label>
              <textarea id="address" class="form-control" rows="2" placeholder="Quartier, rue, n° de maison..." required></textarea>
            </div>
            <div class="pdp-qty-row">
              <div class="qty-control">
                <button type="button" id="qty-minus" aria-label="Diminuer la quantité">−</button>
                <input type="number" id="qty" value="1" min="1" max="10" readonly>
                <button type="button" id="qty-plus" aria-label="Augmenter la quantité">+</button>
              </div>
              <div>
                <div class="pdp-total-lbl">Total estimé</div>
                <div class="pdp-total-val" id="total-price">${formatPrice(p.price)}</div>
              </div>
            </div>
            <div class="promo-row">
              <div class="promo-input-wrap">
                <input type="text" id="promo-code" class="form-control promo-input" placeholder="Code promo (optionnel)" autocomplete="off" spellcheck="false" style="text-transform:uppercase">
                <button type="button" id="promo-apply" class="promo-apply-btn">Appliquer</button>
              </div>
              <div id="promo-msg" class="promo-msg"></div>
            </div>
            <button type="button" id="add-to-cart-btn" class="pdp-btn-cart">🛒 Ajouter au panier</button>
            <button type="submit" class="pdp-btn-order">Confirmer ma commande</button>
            <div class="pdp-form-note">Aucun prépaiement — vous payez à la réception</div>
          </form>
        </div>
      </div>
    </div>

    <!-- Related products -->
    ${
      related.length
        ? `
    <div class="pdp-related">
      <div class="pdp-related-head">
        <span class="pdp-related-num">—</span>
        <h2 class="pdp-related-title">Vous pourriez aussi aimer</h2>
      </div>
      <div class="pdp-related-grid">${relatedHtml}</div>
    </div>`
        : ''
    }

    <div id="reviews-container"></div>
  `;

  // Track view + recently-viewed bar
  trackView(p.id);
  mountRecentBar(PRODUCTS, p.id);

  // Reviews
  seedDemoReviews();
  const reviewContainer = document.getElementById('reviews-container');
  if (reviewContainer) {
    reviewContainer.innerHTML = renderReviewSection(p.id, p.name);
    initReviewForm(p.id);
  }

  // Inject aggregate rating below product name
  const agg = getAggregateRating(p.id);
  if (agg) {
    const pdpName = document.querySelector('.pdp-name');
    if (pdpName) {
      pdpName.insertAdjacentHTML(
        'afterend',
        `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
          ${starsHtml(agg.average)}
          <span style="font-weight:700;font-size:.85rem;color:#0d0d0d">${agg.average}</span>
          <a href="#reviews-container" style="font-size:.82rem;color:rgba(0,0,0,.45);text-decoration:underline;text-underline-offset:2px">${agg.count} avis</a>
        </div>`,
      );
    }
  }

  // Gallery
  initGallery();

  // Qty + total
  const qtyInput = document.getElementById('qty');
  const totalEl = document.getElementById('total-price');
  let activeDiscount = 0; // percent (0–100)

  document.getElementById('qty-minus').addEventListener('click', () => {
    if (parseInt(qtyInput.value) > 1) {
      qtyInput.value = parseInt(qtyInput.value) - 1;
      updateTotal();
    }
  });
  document.getElementById('qty-plus').addEventListener('click', () => {
    qtyInput.value = parseInt(qtyInput.value) + 1;
    updateTotal();
  });
  function updateTotal() {
    const base = p.price * parseInt(qtyInput.value);
    const final = activeDiscount > 0 ? Math.round(base * (1 - activeDiscount / 100)) : base;
    totalEl.textContent = formatPrice(final);
  }

  // Promo code
  const promoInput = document.getElementById('promo-code');
  const promoMsg = document.getElementById('promo-msg');
  document.getElementById('promo-apply').addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();
    if (!code) {
      promoMsg.textContent = '';
      return;
    }
    const pct = PROMO_CODES[code];
    if (pct) {
      activeDiscount = pct;
      promoInput.readOnly = true;
      promoMsg.innerHTML = `<span class="promo-ok">✓ Code appliqué — ${pct}% de réduction</span>`;
      updateTotal();
    } else {
      activeDiscount = 0;
      promoMsg.innerHTML = `<span class="promo-err">Code invalide ou expiré.</span>`;
      updateTotal();
    }
  });
  promoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('promo-apply').click();
    }
  });

  // Add to cart
  document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    const qty = parseInt(qtyInput.value) || 1;
    addToCart({ id: p.id, name: p.name, price: p.price, image: p.images[0] }, qty);
    showCartToast(`${p.name} ajouté au panier ✓`);
  });

  // Form submit
  document.getElementById('order-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const city = document.getElementById('city').value;
    const address = document.getElementById('address').value.trim();
    const qty = parseInt(qtyInput.value);
    if (!name || !phone || !city || !address) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const basePrice = p.price * qty;
    const finalPrice =
      activeDiscount > 0 ? Math.round(basePrice * (1 - activeDiscount / 100)) : basePrice;
    const promoCode = activeDiscount > 0 ? promoInput.value.trim().toUpperCase() : '';
    const notes = promoCode ? `Code promo: ${promoCode} (-${activeDiscount}%)` : '';

    const submitBtn = document.querySelector('#order-form .pdp-btn-order');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours…';
    }

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          city,
          address,
          productId: p.id,
          productName: p.name,
          quantity: qty,
          notes,
        }),
      });
    } catch (_) {
      /* network error — continue to WhatsApp */
    }

    const url = buildWhatsAppUrl({
      product: p.name,
      qty,
      price: Math.round(finalPrice / qty),
      name,
      phone,
      city,
      address,
    });
    document.getElementById('order-form').innerHTML = `
      <div style="text-align:center;padding:24px 0">
        <div style="font-size:2rem;margin-bottom:12px">✓</div>
        <h3 style="font-size:1.1rem;font-weight:800;letter-spacing:-.03em;color:#0d0d0d;margin-bottom:8px">Commande reçue !</h3>
        <p style="font-size:.85rem;color:rgba(0,0,0,.5);margin-bottom:4px">Merci <strong style="color:#0d0d0d">${name}</strong> ! Nous vous appellerons au <strong style="color:#0d0d0d">${phone}</strong>.</p>
        <p style="font-size:.82rem;color:rgba(0,0,0,.4);margin-bottom:20px">Cliquez ci-dessous pour confirmer via WhatsApp.</p>
        <a href="${url}" target="_blank" rel="noopener" style="display:block;background:#25d366;color:#fff;padding:14px 28px;border-radius:100px;font-weight:700;font-size:.9rem;letter-spacing:-.01em;transition:background .15s" onmouseover="this.style.background='#1ebe5d'" onmouseout="this.style.background='#25d366'">Envoyer via WhatsApp</a>
        <a href="/suivi-commande.html?phone=${encodeURIComponent(phone)}" style="display:block;margin-top:12px;font-size:.75rem;color:rgba(0,0,0,.35);text-decoration:underline;text-underline-offset:3px">Suivre ma commande →</a>
      </div>`;
    window.open(url, '_blank');
    const sticky = document.getElementById('sticky-order-bar');
    if (sticky) sticky.style.display = 'none';
  });

  // Sticky bar (mobile)
  const sticky = document.getElementById('sticky-order-bar');
  if (sticky) {
    sticky.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:600px;margin:0 auto">
        <div>
          <div style="font-size:.75rem;font-weight:600;color:rgba(0,0,0,.5);letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px">${p.name}</div>
          <div style="font-weight:800;font-size:1.05rem;letter-spacing:-.03em;color:#C4A472">${formatPrice(p.price)}</div>
        </div>
        <a href="#commander" style="background:#0d0d0d;color:#fff;padding:11px 24px;border-radius:100px;font-size:.82rem;font-weight:700;letter-spacing:-.01em;white-space:nowrap;flex-shrink:0;transition:background .15s" onmouseover="this.style.background='#000'" onmouseout="this.style.background='#0d0d0d'">Commander</a>
      </div>`;
  }
}
