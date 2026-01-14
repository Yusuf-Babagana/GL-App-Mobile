import { marketAPI } from "@/lib/marketApi"; // <--- Updated Import
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "./AuthContext";

interface CartItem {
    id: number;
    product: number;
    product_name: string;
    product_price: number;
    product_image: string | null;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    cartTotal: number;
    isLoading: boolean;
    addToCart: (productId: number, quantity?: number) => Promise<void>;
    removeFromCart: (itemId: number) => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({} as any);

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { isSignedIn } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCart = async () => {
        if (!isSignedIn) return;
        try {
            const data = await marketAPI.getCart(); // <--- API Call
            setCartItems(data.items);
            setCartTotal(data.total_price);
        } catch (error) {
            console.log("Error fetching cart:", error);
        }
    };

    useEffect(() => {
        if (isSignedIn) {
            fetchCart();
        } else {
            setCartItems([]);
            setCartTotal(0);
        }
    }, [isSignedIn]);

    const addToCart = async (productId: number, quantity = 1) => {
        try {
            setIsLoading(true);
            await marketAPI.addToCart(productId, quantity); // <--- API Call
            await fetchCart();
            Alert.alert("Success", "Item added to cart!");
        } catch (error: any) {
            console.log("Add to cart error:", error);
            Alert.alert("Error", error.error || "Could not add item.");
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (itemId: number) => {
        try {
            // Optimistic UI update
            setCartItems((prev) => prev.filter((item) => item.id !== itemId));
            await marketAPI.removeFromCart(itemId); // <--- API Call
            await fetchCart(); // Sync to be sure
        } catch (error) {
            console.log("Remove error:", error);
            Alert.alert("Error", "Could not remove item.");
            await fetchCart(); // Revert on error
        }
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartTotal,
                isLoading,
                addToCart,
                removeFromCart,
                refreshCart: fetchCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}