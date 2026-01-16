import api from './api'; // The axios instance from mobile/lib/api.ts

// Helper to standardise error handling
const handleApiError = (error: any) => {
    if (error.response) {
        console.error("API Error Data:", error.response.data);
        console.error("API Error Status:", error.response.status);
        throw error.response.data; // Throw the actual error message from backend
    } else {
        console.error("Network/Unknown Error:", error.message);
        throw new Error("Network error or server is unreachable.");
    }
};

export const marketAPI = {

    // --- BROWSING & SEARCH ---

    /**
     * Fetch all categories
     */
    getCategories: async () => {
        try {
            const response = await api.get('/market/categories/');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Fetch products with optional search and category filters
     */
    getProducts: async (searchQuery: string = '', categoryId: number | null = null) => {
        try {
            const params: any = {};
            if (searchQuery) params.search = searchQuery;
            // Note: Backend might need to support category filtering specifically if not covered by 'search'
            // For now, filtering is done on frontend or via the generic search param if configured

            const response = await api.get('/market/products/', { params });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Get single product details
     */
    getProductById: async (id: number) => {
        try {
            const response = await api.get(`/market/products/${id}/`);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // --- CART MANAGEMENT ---

    /**
     * Get current user's cart
     */
    getCart: async () => {
        try {
            const response = await api.get('/market/cart/');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Add item to cart
     */
    addToCart: async (productId: number, quantity: number = 1) => {
        try {
            const payload = { product_id: productId, quantity };
            const response = await api.post('/market/cart/', payload);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Remove specific item from cart
     */
    removeFromCart: async (itemId: number) => {
        try {
            // Backend expects 'item_id' in body for DELETE requests
            const response = await api.delete('/market/cart/', { data: { item_id: itemId } });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // --- ORDER & CHECKOUT ---

    /**
     * Place an order (Checkout)
     */
    placeOrder: async (shippingAddress: { address: string; city: string; phone: string }) => {
        try {
            const payload = { shipping_address: shippingAddress };
            const response = await api.post('/market/orders/create/', payload);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Track Orders (Order History)
     */
    getMyOrders: async () => {
        try {
            const response = await api.get('/market/buyer/orders/');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getOrderById: async (orderId: number) => {
        try {
            const response = await api.get(`/market/buyer/orders/${orderId}/`);
            return response.data;
        } catch (error) {
            // @ts-ignore
            if (error.response) throw error.response.data;
            throw new Error("Network error");
        }
    },

    getWallet: async () => {
        try {
            const response = await api.get('/finance/wallet/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    initiateDeposit: async (amount: number) => {
        try {
            const response = await api.post('/finance/deposit/initiate/', { amount });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    verifyDeposit: async (reference: string) => {
        try {
            const response = await api.post('/finance/deposit/verify/', { reference });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    confirmOrder: async (orderId: number) => {
        try {
            const response = await api.post(`/market/orders/${orderId}/confirm/`);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
    createStore: async (data: any) => {
        // data should contain { name: "My Shop", description: "..." }
        // and optionally logo/image if your serializer handles multipart
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        if (data.image) {
            // @ts-ignore
            formData.append("logo", {
                uri: data.image,
                name: "logo.jpg",
                type: "image/jpeg",
            });
        }

        try {
            const response = await api.post('/market/store/create/', formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            // @ts-ignore
            if (error.response) throw error.response.data;
            throw error;
        }
    },

    // --- SELLER FUNCTIONS ---
    getSellerStats: async () => {
        try {
            const response = await api.get('/market/seller/stats/');
            return response.data;
        } catch (error) { throw error; }
    },

    getSellerProducts: async () => {
        try {
            const response = await api.get('/market/seller/products/');
            return response.data;
        } catch (error) { throw error; }
    },

    getSellerOrders: async () => {
        try {
            const response = await api.get('/market/seller/orders/');
            return response.data;
        } catch (error) { throw error; }
    },

    addProduct: async (data: any) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", data.price);
        formData.append("stock", data.stock);
        formData.append("category", data.category); // ID of category

        if (data.image) {
            // @ts-ignore
            formData.append("image", {
                uri: data.image,
                name: "product.jpg",
                type: "image/jpeg",
            });
        }

        try {
            const response = await api.post('/market/seller/products/add/', formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        } catch (error) {
            // @ts-ignore
            if (error.response) throw error.response.data;
            throw error;
        }
    },
    updateOrderStatus: async (orderId: number, status: 'shipped' | 'pending') => {
        try {
            const response = await api.post(`/market/seller/orders/${orderId}/update/`, { status });
            return response.data;
        } catch (error) {
            // @ts-ignore
            if (error.response) throw error.response.data;
            throw error;
        }
    },

    // --- RIDER FUNCTIONS ---
    getAvailableDeliveries: async () => {
        try {
            const response = await api.get('/market/rider/orders/available/');
            return response.data;
        } catch (error) { throw error; }
    },

    getRiderActiveDeliveries: async () => {
        try {
            const response = await api.get('/market/rider/orders/active/');
            return response.data;
        } catch (error) { throw error; }
    },

    acceptDelivery: async (orderId: number) => {
        try {
            const response = await api.post(`/market/rider/orders/${orderId}/accept/`, {});
            return response.data;
        } catch (error) {
            // @ts-ignore
            if (error.response) throw error.response.data;
            throw error;
        }
    },

    riderUpdateStatus: async (orderId: number, status: 'picked_up' | 'delivered', pin?: string) => {
        try {
            const payload = { status, pin };
            const response = await api.post(`/market/rider/orders/${orderId}/update/`, payload);
            return response.data;
        } catch (error) {
            // @ts-ignore
            if (error.response) throw error.response.data;
            throw error;
        }
    },

    getAdminStats: async () => {
        try {
            const response = await api.get('/market/admin/stats/');
            return response.data;
        } catch (error) { throw error; }
    },

    // --- KYC FUNCTIONS ---
    submitKYC: async (formData: FormData) => {
        try {
            // Important: We send FormData, so we let the browser/native set Content-Type
            const response = await api.post('/users/kyc/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) { throw error; }
    },

    getPendingKYC: async () => {
        try {
            const response = await api.get('/users/admin/kyc/pending/');
            return response.data;
        } catch (error) { throw error; }
    },

    adminKYCAction: async (userId: number, action: 'approve' | 'reject') => {
        try {
            const response = await api.post(`/users/admin/kyc/${userId}/action/`, { action });
            return response.data;
        } catch (error) { throw error; }
    },

    // --- CHAT FUNCTIONS ---
    startChat: async (userId: number) => {
        try {
            const response = await api.post(`/market/chat/start/${userId}/`, {});
            return response.data;
        } catch (error) { throw error; }
    },

    sendMessage: async (conversationId: number, text: string) => {
        try {
            const response = await api.post(`/market/chat/${conversationId}/send/`, { text });
            return response.data;
        } catch (error) { throw error; }
    },

    getConversations: async () => {
        const { data } = await api.get('/market/conversations/');
        return data;
    },
};
