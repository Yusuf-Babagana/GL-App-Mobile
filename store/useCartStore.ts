import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  product: number;
  product_name: string;
  product_price: number;
  product_image: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  addItem: (
    item: Omit<CartItem, 'id' | 'quantity'>,
    quantity?: number
  ) => void;
  removeItem: (productId: number) => void;
  decrementQuantity: (productId: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item, quantity = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.product === item.product);

        if (existing) {
          set({
            items: items.map((i) =>
              i.product === item.product
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, id: `${item.product}`, quantity }],
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product !== productId) });
      },

      decrementQuantity: (productId) => {
        const { items } = get();
        const existing = items.find((i) => i.product === productId);
        if (!existing) return;

        if (existing.quantity <= 1) {
          set({ items: items.filter((i) => i.product !== productId) });
        } else {
          set({
            items: items.map((i) =>
              i.product === productId
                ? { ...i, quantity: i.quantity - 1 }
                : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [] }),

      setItems: (items) => set({ items }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useCartTotal = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.product_price * item.quantity, 0)
  );

export const useCartCount = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
