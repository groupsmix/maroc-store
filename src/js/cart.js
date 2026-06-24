const CART_KEY = 'marocshop_cart';

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: getCount(items) } }));
}

export function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === product.id);
  if (existing) existing.qty += qty;
  else
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty,
    });
  saveCart(cart);
}

export function removeFromCart(productId) {
  saveCart(getCart().filter((i) => i.id !== productId));
}

export function updateQty(productId, qty) {
  if (qty < 1) {
    removeFromCart(productId);
    return;
  }
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (item) {
    item.qty = qty;
    saveCart(cart);
  }
}

export function clearCart() {
  saveCart([]);
}

function getCount(items) {
  return (items || getCart()).reduce((s, i) => s + i.qty, 0);
}
export { getCount };

export function getTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}
