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
    getProducts: async (searchQuery: string = '', categoryId: number | null = null, storeId: number | null = null) => {
        try {
            const params: any = {};
            if (searchQuery) params.search = searchQuery;
            if (storeId) params.store_id = storeId;
            // Note: Backend might need to support category filtering specifically if not covered by 'search'
            // For now, filtering is done on frontend or via the generic search param if configured

            const response = await api.get('/market/products/', { params });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // --- MESSAGING ---
    startConversation: async (receiverId: number, productId: number | null = null) => {
        try {
            const response = await api.post('/chat/start/', {
                receiver_id: receiverId,
                product_id: productId
            });
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    /**
     * Get single store details
     */
    getStoreById: async (id: number) => {
        try {
            const response = await api.get(`/market/stores/${id}/`);
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
            console.error("Wallet Fetch Error:", error);
            // Return a default object so the UI doesn't crash
            return {
                balance: "0.00",
                escrow_balance: "0.00",
                account_number: "Error Loading",
                bank_name: "Try Again Later"
            };
        }
    },

    // Since WalletDetailView already includes history, this is optional but good for backup
    getTransactions: async () => {
        const response = await api.get('/finance/wallet/');
        return response.data.transactions || [];
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

    // MONNIFY: Verify Bank Account Name
    verifyBankAccount: async (accountNumber: string, bankCode: string) => {
        const response = await api.post('/finance/verify-bank/', {
            account_number: accountNumber,
            bank_code: bankCode
        });
        return response.data;
    },

    // MONNIFY: Process Withdrawal
    initiateWithdrawal: async (amount: number, bankAccountId: number) => {
        const response = await api.post('/finance/withdraw/', {
            amount: amount,
            bank_account_id: bankAccountId
        });
        return response.data;
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
        // CHECK: If data has 'video_url' or images are already URLs, send as JSON
        const isPreUploaded =
            (data.images && data.images.length > 0 && typeof data.images[0] === 'string' && data.images[0].startsWith('http')) ||
            data.video_url;

        if (isPreUploaded) {
            try {
                // Send directly as JSON (Content-Type: application/json is default in api.ts)
                const response = await api.post('/market/seller/products/add/', data);
                return response.data;
            } catch (error) {
                // @ts-ignore
                if (error.response) throw error.response.data;
                throw error;
            }
        }

        // --- FALLBACK (Old Way for direct file upload via backend) ---
        const formData = new FormData();

        // Append text fields
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", data.price);
        formData.append("stock", data.stock || "1");
        formData.append("category", data.category || "1");
        formData.append("is_ad", "true"); // Automatically mark products with video as ads

        // Handle Images (Multi-part)
        if (data.images && data.images.length > 0) {
            data.images.forEach((uri: string, index: number) => {
                // @ts-ignore
                formData.append("images", {
                    uri,
                    name: `prod_img_${index}.jpg`,
                    type: "image/jpeg",
                });
            });
        }

        // Handle Video (Crucial for Requirement #1)
        if (data.video) {
            // @ts-ignore
            formData.append("video", {
                uri: data.video,
                name: "seller_video.mp4",
                type: "video/mp4",
            });
            formData.append("resource_type", "video");
        }

        try {
            const response = await api.post('/market/seller/products/add/', formData, {
                headers: {
                    "Content-Type": undefined, // Explicitly unset default JSON header so Axios sets boundary
                },
                transformRequest: (data, headers) => {
                    // @ts-ignore
                    delete headers['Content-Type']; // Nuclear option to ensure no default leaks
                    return data;
                },
                // Increase timeout for large video files (5 minutes)
                timeout: 300000,
            });
            return response.data;
        } catch (error) {
            console.error("Video Upload Error:", error);
            throw error;
        }
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
            // The key must be 'pin' to match request.data.get('pin')
            const payload = { status, pin: pin };
            const response = await api.post(`/market/rider/orders/${orderId}/update/`, payload);
            return response.data;
        } catch (error: any) {
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
    startChat: async (userId: number, productId?: number) => {
        const response = await api.post('/chat/start/', {
            user_id: userId,
            product_id: productId
        });
        return response.data;
    },

    sendMessage: async (conversationId: number, text: string) => {
        const response = await api.post(`/chat/conversations/${conversationId}/send/`, { text });
        return response.data;
    },

    getMessages: async (conversationId: number, lastId: number = 0) => {
        // Yusuf: This sends /api/chat/conversations/5/messages/?last_id=10
        const response = await api.get(`/chat/conversations/${conversationId}/messages/`, {
            params: { last_id: lastId }
        });
        return response.data;
    },

    getConversations: async () => {
        const { data } = await api.get('/market/conversations/');
        return data;
    },


    getOrderDetail: async (id: string | string[]) => {
        // This uses your central API instance which should have the Token interceptor
        const response = await api.get(`/market/seller/orders/${id}/`);
        return response.data;
    },

    getAllStores: async () => {
        try {
            // Adjust the endpoint if your backend path is different
            const response = await api.get('/market/stores/');
            return response.data.results || response.data;
        } catch (error) {
            console.error("Error fetching stores:", error);
            throw error;
        }
    },

    getStoreDetail: async (id: string | number) => {
        try {
            const response = await api.get(`/market/stores/${id}/`);
            return response.data;
        } catch (error) {
            console.error("Error fetching store detail:", error);
            throw error;
        }
    },
    getVideoAds: async (pageNum: number = 1) => {
        try {
            const response = await api.get('/market/video-ads/', {
                params: { page: pageNum }
            });
            // Django results usually come in a 'results' key if paginated
            return response.data.results || response.data;
        } catch (error) {
            console.error("Video Ads Fetch Error:", error);
            return [];
        }
    },



    updateOrderStatus: async (orderId: number, status: string) => {
        try {
            // ENSURE THE TRAILING SLASH IS PRESENT
            const response = await api.post(`/market/seller/orders/status-change/${orderId}/`, { status });
            return response.data;
        } catch (error: any) {
            if (error.response) throw error.response.data;
            throw error;
        }
    },

    getReadyJobs: async () => {
        try {
            const response = await api.get('/market/seller/orders/ready-for-pickup/');
            return response.data;
        } catch (error) { throw error; }
    },


    // --- RIDER FUNCTIONS ---
    getAvailableDeliveries: async () => {
        try {
            // Updated to match the backend path in Step 1
            const response = await api.get('/market/rider/orders/available/');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    getRiderActiveDeliveries: async () => {
        try {
            // Updated to match the backend path in Step 1
            const response = await api.get('/market/rider/orders/active/');
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },



};
