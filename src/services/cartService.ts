import { apiRequest } from './apiClient';

export function getCart() {
  return apiRequest<any>('/market/cart/');
}

export function addToCart(productId: number, quantity: number = 1) {
  return apiRequest<any>('/market/cart/', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export function removeFromCart(itemId: number) {
  return apiRequest<any>('/market/cart/', {
    method: 'DELETE',
    body: JSON.stringify({ item_id: itemId }),
  });
}

export function placeOrder(shippingAddress: { address: string; city: string; phone: string }) {
  return apiRequest<any>('/market/orders/create/', {
    method: 'POST',
    body: JSON.stringify({ shipping_address: shippingAddress }),
  });
}

export function getMyOrders() {
  return apiRequest<any>('/market/buyer/orders/');
}
