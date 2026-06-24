/* ============================================================
   Reviews & Ratings System
   - Stored in localStorage per product
   - Schema.org AggregateRating injected into page <head>
   - Stars shown on product cards & product detail pages
   ============================================================ */

const STORAGE_KEY = 'marocshop_reviews';

/* ─── Storage helpers ────────────────────────────────────── */
function loadAllReviews() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAllReviews(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getProductReviews(productId) {
  return loadAllReviews()[productId] || [];
}

export function addReview(productId, review) {
  const all = loadAllReviews();
  if (!all[productId]) all[productId] = [];
  all[productId].unshift({ ...review, date: new Date().toISOString() });
  saveAllReviews(all);
}

/* ─── Aggregate stats ────────────────────────────────────── */
export function getAggregateRating(productId) {
  const reviews = getProductReviews(productId);
  if (!reviews.length) return null;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    count: reviews.length,
    average: Math.round((total / reviews.length) * 10) / 10,
  };
}

/* ─── Stars HTML (read-only display) ─────────────────────── */
export function starsHtml(rating, max = 5) {
  let html = '<span class="stars" aria-hidden="true">';
  for (let i = 1; i <= max; i++) {
    if (i <= Math.floor(rating)) {
      html += '<span class="star full">★</span>';
    } else if (i - rating <= 0.5) {
      html += '<span class="star half">★</span>';
    } else {
      html += '<span class="star empty">☆</span>';
    }
  }
  html += '</span>';
  return html;
}

/* ─── Product card rating snippet ────────────────────────── */
export function cardRatingHtml(productId) {
  const agg = getAggregateRating(productId);
  if (!agg) return '';
  return `<div class="card-rating" itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
    ${starsHtml(agg.average)}
    <span class="rating-score" itemprop="ratingValue" content="${agg.average}">${agg.average}</span>
    <span class="rating-count">(<span itemprop="reviewCount">${agg.count}</span>)</span>
    <meta itemprop="bestRating" content="5">
    <meta itemprop="worstRating" content="1">
  </div>`;
}

/* ─── Inject AggregateRating into Product schema ─────────── */
export function injectAggregateRatingSchema(productId, productName) {
  const agg = getAggregateRating(productId);
  if (!agg) return;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: agg.average,
      reviewCount: agg.count,
      bestRating: 5,
      worstRating: 1,
    },
  };
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.textContent = JSON.stringify(schema);
  document.head.appendChild(el);
}

/* ─── Seed demo reviews (first visit only) ───────────────── */
const DEMO_REVIEWS = {
  'montre-smart-pro': [
    {
      name: 'Fatima B.',
      rating: 5,
      comment: 'Très belle montre, livraison rapide à Casablanca. Je recommande fortement !',
      date: '2025-01-10T10:00:00.000Z',
    },
    {
      name: 'Youssef M.',
      rating: 4,
      comment: "Bonne qualité pour le prix. L'écran est vraiment lumineux. Commande COD facile.",
      date: '2025-01-08T14:30:00.000Z',
    },
    {
      name: 'Khadija R.',
      rating: 5,
      comment: 'Produit conforme à la description. Le suivi santé est précis. Très satisfaite !',
      date: '2025-01-05T09:15:00.000Z',
    },
  ],
  'ecouteurs-bluetooth': [
    {
      name: 'Omar T.',
      rating: 5,
      comment: "Son excellent, réduction de bruit vraiment efficace. Meilleur achat de l'année !",
      date: '2025-01-12T16:00:00.000Z',
    },
    {
      name: 'Nadia A.',
      rating: 4,
      comment:
        'Très bonne qualité sonore. Connexion Bluetooth stable. Livraison en 3 jours à Rabat.',
      date: '2025-01-09T11:00:00.000Z',
    },
    {
      name: 'Hassan K.',
      rating: 5,
      comment: 'Je les utilise pour le sport et pour le travail. Parfaits dans les deux cas.',
      date: '2025-01-07T08:45:00.000Z',
    },
    {
      name: 'Samira O.',
      rating: 3,
      comment: 'Bon produit mais la boîte de charge est un peu fragile. Son top néanmoins.',
      date: '2025-01-03T15:20:00.000Z',
    },
  ],
  'bracelet-sport': [
    {
      name: 'Mehdi L.',
      rating: 5,
      comment: "Waterproof comme annoncé, je l'ai testé à la piscine. Autonomie excellente !",
      date: '2025-01-11T17:00:00.000Z',
    },
    {
      name: 'Aicha F.',
      rating: 4,
      comment: "Pratique et léger. L'app est simple à utiliser. Livraison COD parfaite.",
      date: '2025-01-06T12:30:00.000Z',
    },
  ],
  'sac-a-main-femme': [
    {
      name: 'Leila C.',
      rating: 5,
      comment:
        'Magnifique sac, le cuir est doux et de bonne qualité. Exactement comme sur la photo !',
      date: '2025-01-13T10:30:00.000Z',
    },
    {
      name: 'Meriem Z.',
      rating: 4,
      comment:
        'Très joli sac, grande capacité. La bandoulière est pratique. Parfait pour le bureau.',
      date: '2025-01-10T09:00:00.000Z',
    },
    {
      name: 'Hayat B.',
      rating: 5,
      comment: "J'ai commandé le modèle noir. Superbe ! Livraison rapide à Marrakech en 2 jours.",
      date: '2025-01-08T16:45:00.000Z',
    },
  ],
  'lampe-led-multicolore': [
    {
      name: 'Karim M.',
      rating: 4,
      comment:
        'Lampe sympa pour la chambre. Les couleurs sont vraiment belles. Facile à configurer.',
      date: '2025-01-14T20:00:00.000Z',
    },
    {
      name: 'Sara N.',
      rating: 5,
      comment: 'Compatible Alexa comme promis. Le mode musique est incroyable ! Je recommande.',
      date: '2025-01-11T19:30:00.000Z',
    },
  ],
};

export function seedDemoReviews() {
  if (localStorage.getItem('marocshop_seeded_v1')) return;
  const all = {};
  for (const [id, reviews] of Object.entries(DEMO_REVIEWS)) {
    all[id] = reviews;
  }
  saveAllReviews(all);
  localStorage.setItem('marocshop_seeded_v1', '1');
}

/* ─── Full review section HTML ───────────────────────────── */
export function renderReviewSection(productId, productName) {
  seedDemoReviews();
  const reviews = getProductReviews(productId);
  const agg = getAggregateRating(productId);

  // Inject schema
  if (agg) injectAggregateRatingSchema(productId, productName);

  const reviewsListHtml = reviews.length
    ? reviews
        .map(
          (r) => `
      <article class="review-item" itemscope itemtype="https://schema.org/Review">
        <div class="review-header">
          <div class="review-avatar">${r.name.charAt(0).toUpperCase()}</div>
          <div>
            <div class="review-name" itemprop="author" itemscope itemtype="https://schema.org/Person">
              <span itemprop="name">${escapeHtml(r.name)}</span>
            </div>
            <div class="review-stars" itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
              <meta itemprop="ratingValue" content="${r.rating}">
              <meta itemprop="bestRating" content="5">
              ${starsHtml(r.rating)}
              <time class="review-date" datetime="${r.date}">${formatDate(r.date)}</time>
            </div>
          </div>
        </div>
        <p class="review-comment" itemprop="reviewBody">${escapeHtml(r.comment)}</p>
      </article>`,
        )
        .join('')
    : '<div class="reviews-empty">Aucun avis pour l\'instant. Soyez le premier à donner votre avis !</div>';

  return `
    <section class="reviews-section" aria-labelledby="reviews-title">
      <div class="reviews-header">
        <h2 id="reviews-title" class="reviews-title">Avis clients</h2>
        ${
          agg
            ? `
          <div class="reviews-aggregate">
            <div class="agg-score">${agg.average}</div>
            <div>
              ${starsHtml(agg.average)}
              <div class="agg-count">${agg.count} avis vérifiés</div>
            </div>
          </div>`
            : ''
        }
      </div>

      <!-- Submit form -->
      <div class="review-form-wrapper" id="review-form-wrapper">
        <h3 class="review-form-title">✍️ Laisser un avis</h3>
        <form id="review-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="review-name">Votre nom <span>*</span></label>
            <input type="text" id="review-name" class="form-control" placeholder="Prénom + première lettre du nom" required>
          </div>
          <div class="form-group">
            <label class="form-label">Note <span>*</span></label>
            <div class="star-input" role="radiogroup" aria-label="Donner une note de 1 à 5 étoiles">
              ${[1, 2, 3, 4, 5]
                .map(
                  (n) => `
                <label class="star-label" for="star-${n}" title="${n} étoile${n > 1 ? 's' : ''}">
                  <input type="radio" name="rating" id="star-${n}" value="${n}" class="sr-only" ${n === 5 ? 'checked' : ''}>
                  <span class="star-btn" data-value="${n}">★</span>
                </label>`,
                )
                .join('')}
            </div>
            <input type="hidden" id="review-rating" value="5">
          </div>
          <div class="form-group">
            <label class="form-label" for="review-comment">Votre avis <span>*</span></label>
            <textarea id="review-comment" class="form-control" rows="3" placeholder="Partagez votre expérience avec ce produit..." required></textarea>
          </div>
          <button type="submit" class="btn btn-secondary">Publier mon avis</button>
        </form>
      </div>

      <!-- Reviews list -->
      <div class="reviews-list" id="reviews-list" aria-label="Liste des avis">
        ${reviewsListHtml}
      </div>
    </section>`;
}

/* ─── Init review form interactions ──────────────────────── */
export function initReviewForm(productId) {
  // Star input interaction
  const starBtns = document.querySelectorAll('.star-btn');
  const ratingInput = document.getElementById('review-rating');

  function updateStars(value) {
    starBtns.forEach((btn) => {
      btn.classList.toggle('selected', parseInt(btn.dataset.value) <= value);
    });
    if (ratingInput) ratingInput.value = value;
  }

  // Initialize with default 5
  updateStars(5);

  starBtns.forEach((btn) => {
    btn.addEventListener('mouseover', () => updateStars(parseInt(btn.dataset.value)));
    btn.addEventListener('click', () => {
      updateStars(parseInt(btn.dataset.value));
      const radio = btn.previousElementSibling;
      if (radio) radio.checked = true;
    });
  });

  // Reset on mouse leave
  const starInput = document.querySelector('.star-input');
  if (starInput) {
    starInput.addEventListener('mouseleave', () => {
      updateStars(parseInt(ratingInput?.value || 5));
    });
  }

  // Form submit
  const form = document.getElementById('review-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('review-name').value.trim();
    const rating = parseInt(document.getElementById('review-rating').value);
    const comment = document.getElementById('review-comment').value.trim();

    if (!name || !comment) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    addReview(productId, { name, rating, comment });

    // Re-render reviews list
    const list = document.getElementById('reviews-list');
    if (list) {
      const reviews = getProductReviews(productId);
      list.innerHTML = reviews
        .map(
          (r) => `
        <article class="review-item">
          <div class="review-header">
            <div class="review-avatar">${r.name.charAt(0).toUpperCase()}</div>
            <div>
              <div class="review-name">${escapeHtml(r.name)}</div>
              <div class="review-stars">
                ${starsHtml(r.rating)}
                <time class="review-date" datetime="${r.date}">${formatDate(r.date)}</time>
              </div>
            </div>
          </div>
          <p class="review-comment">${escapeHtml(r.comment)}</p>
        </article>`,
        )
        .join('');
    }

    // Update aggregate display
    const agg = getAggregateRating(productId);
    const aggEl = document.querySelector('.reviews-aggregate');
    if (agg && aggEl) {
      aggEl.innerHTML = `
        <div class="agg-score">${agg.average}</div>
        <div>${starsHtml(agg.average)}<div class="agg-count">${agg.count} avis vérifiés</div></div>`;
    } else if (agg) {
      const header = document.querySelector('.reviews-header');
      if (header)
        header.insertAdjacentHTML(
          'beforeend',
          `
        <div class="reviews-aggregate">
          <div class="agg-score">${agg.average}</div>
          <div>${starsHtml(agg.average)}<div class="agg-count">${agg.count} avis vérifiés</div></div>
        </div>`,
        );
    }

    // Reset form
    form.reset();
    updateStars(5);

    // Scroll to new review
    list?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ─── Helpers ────────────────────────────────────────────── */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-MA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}
