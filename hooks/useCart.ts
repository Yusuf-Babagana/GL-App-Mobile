import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { normalizeData } from "@/lib/utils";

const normalizeCartItem = (item: any) => ({
  ...item,
  _id: item._id || String(item.id),
  product: {
    _id: String(item.product),
    id: item.product,
    price: item.product_price,
    name: item.product_name,
    image: item.product_image,
  },
});

const normalizeCart = (data: any) => {
  const normalized = normalizeData(data);
  if (normalized?.items) {
    normalized.items = normalized.items.map(normalizeCartItem);
  }
  return normalized;
};

const useCart = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const {
    data: cart,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await api.get("/market/cart/");
      return normalizeCart(data);
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const { data } = await api.post("/market/cart/", {
        product_id: Number(productId),
        quantity,
      });
      return normalizeCart(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const { data } = await api.post("/market/cart/", {
        product_id: Number(productId),
        quantity,
      });
      return normalizeCart(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.delete("/market/cart/", {
        data: { item_id: Number(productId) },
      });
      return normalizeCart(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete("/market/cart/", {
        data: { clear_all: true },
      });
      return normalizeCart(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const cartTotal =
    cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) ?? 0;

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return {
    cart,
    isLoading,
    isError,
    cartTotal,
    cartItemCount,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
    isClearing: clearCartMutation.isPending,
  };
};
export default useCart;
