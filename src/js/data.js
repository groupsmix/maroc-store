/* ─── STORE CONFIGURATION ────────────────────────────────── */
export const WHATSAPP_NUMBER = '212600000000'; // ← REPLACE (no + or spaces)
export const STORE_NAME = 'MarocShop'; // ← REPLACE
export const STORE_DOMAIN = 'votre-domaine.ma'; // ← REPLACE

/* ─── PROMO CODES — code: discount % ─────────────────────── */
export const PROMO_CODES = {
  MAROC10: 10,
  BIENVENUE: 15,
  VIP20: 20,
  ETE25: 25,
};

export const CATEGORIES = [
  {
    id: 'electronique',
    label: 'Électronique',
    icon: '📱',
    description: 'Gadgets et accessoires tech au meilleur prix.',
  },
  {
    id: 'mode',
    label: 'Mode',
    icon: '👜',
    description: 'Sacs, vêtements et accessoires tendance.',
  },
  {
    id: 'maison',
    label: 'Maison',
    icon: '🏠',
    description: 'Décoration et accessoires pour votre intérieur.',
  },
  {
    id: 'sport',
    label: 'Sport',
    icon: '⚽',
    description: 'Équipements sportifs et accessoires fitness.',
  },
];

export const PRODUCTS = [
  {
    id: 'montre-smart-pro',
    name: 'Montre Connectée Smart Pro',
    price: 249,
    oldPrice: 399,
    category: 'electronique',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
    ],
    description:
      'Montre intelligente avec suivi de santé, notifications et batterie longue durée. Compatible Android & iOS.',
    details: `<ul class="product-details-list">
        <li>Écran AMOLED 1.7" haute résolution</li>
        <li>Suivi fréquence cardiaque, SpO2, sommeil</li>
        <li>GPS intégré, étanche jusqu'à 50m</li>
        <li>Autonomie : jusqu'à 7 jours</li>
        <li>Compatible Android 5.0+ et iOS 10+</li>
        <li>Notifications appels, SMS, réseaux sociaux</li>
        <li>Plus de 100 modes sport</li>
      </ul>`,
    badge: 'Promo',
    related: ['ecouteurs-bluetooth', 'bracelet-sport'],
  },
  {
    id: 'ecouteurs-bluetooth',
    name: 'Écouteurs Bluetooth Pro Sans Fil',
    price: 149,
    oldPrice: 249,
    category: 'electronique',
    image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80',
      'https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=800&q=80',
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80',
    ],
    description:
      "Réduction de bruit active, son cristallin, 30h d'autonomie totale. Votre bulle sonore partout.",
    details: `<ul class="product-details-list">
        <li>Réduction de bruit active (ANC)</li>
        <li>Autonomie 8h + 22h avec le boîtier</li>
        <li>Connexion Bluetooth 5.2 stable</li>
        <li>Mode transparence pour entendre l'environnement</li>
        <li>Résistant à l'eau et à la sueur (IPX4)</li>
        <li>Micro intégré pour appels mains libres</li>
        <li>Compatible avec tous smartphones</li>
      </ul>`,
    badge: 'Bestseller',
    related: ['montre-smart-pro', 'lampe-led-multicolore'],
  },
  {
    id: 'bracelet-sport',
    name: 'Bracelet Fitness Tracker',
    price: 99,
    oldPrice: null,
    category: 'sport',
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80',
      'https://images.unsplash.com/photo-1554344728-77cf90d9ed26?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    ],
    description:
      'Bracelet waterproof avec podomètre, calories, fréquence cardiaque et notifications. Autonomie 14 jours.',
    details: `<ul class="product-details-list">
        <li>Suivi pas, distance, calories brûlées</li>
        <li>Fréquence cardiaque en continu</li>
        <li>Étanche IP68 — peut aller dans la piscine</li>
        <li>Écran OLED brillant</li>
        <li>Autonomie 14 jours</li>
        <li>Alertes sédentarité, rappels boire de l'eau</li>
        <li>Application gratuite iOS/Android</li>
      </ul>`,
    badge: 'Nouveau',
    related: ['montre-smart-pro', 'sac-a-main-femme'],
  },
  {
    id: 'sac-a-main-femme',
    name: 'Sac à Main Cuir Luxe',
    price: 199,
    oldPrice: 320,
    category: 'mode',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    ],
    description:
      'Sac en cuir PU premium, design élégant et moderne. Grand compartiment, bandoulière amovible. Idéal bureau et sorties.',
    details: `<ul class="product-details-list">
        <li>Cuir PU haute qualité, toucher doux</li>
        <li>Grand compartiment principal avec fermeture éclair</li>
        <li>Poche intérieure + poche zippée sécurisée</li>
        <li>Bandoulière amovible et réglable</li>
        <li>Dimensions : 30 × 22 × 12 cm</li>
        <li>Disponible en Noir, Marron, Beige</li>
        <li>Doublure intérieure soignée</li>
      </ul>`,
    badge: 'Promo',
    related: ['bracelet-sport'],
  },
  {
    id: 'lampe-led-multicolore',
    name: 'Lampe LED Intelligente Multicolore',
    price: 89,
    oldPrice: null,
    category: 'maison',
    image: 'https://images.unsplash.com/photo-1586016413664-864c0dd76f53?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1586016413664-864c0dd76f53?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=800&q=80',
    ],
    description:
      'Lampe LED RGB connectée, 16 millions de couleurs, compatible Alexa et Google Home. Idéale chambre ou salon.',
    details: `<ul class="product-details-list">
        <li>16 millions de couleurs RGB</li>
        <li>Contrôle via app smartphone ou télécommande incluse</li>
        <li>Compatible avec Alexa et Google Home</li>
        <li>Minuterie et programmation horaire</li>
        <li>Mode musique — réagit au son ambiant</li>
        <li>Faible consommation d'énergie</li>
        <li>Durée de vie : 25 000 heures</li>
      </ul>`,
    badge: 'Nouveau',
    related: ['montre-smart-pro', 'ecouteurs-bluetooth'],
  },
];

export const BLOG_POSTS = [
  {
    id: 'meilleure-smartwatch-maroc',
    title: 'Comment choisir la meilleure smartwatch au Maroc en 2025',
    excerpt:
      'Guide complet pour trouver la montre connectée idéale selon votre budget. Comparatif des meilleures options avec livraison COD.',
    date: '2025-01-15',
    category: "Guides d'achat",
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    readTime: '5 min',
  },
];
