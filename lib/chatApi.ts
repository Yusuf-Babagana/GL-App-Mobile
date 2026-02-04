import api from "./api"; // Your base axios/fetch instance

export const chatApi = {
    // 1. Get or Create a conversation with a seller from a product page
    startConversation: async (sellerId: number, productId?: number) => {
        const response = await api.post("/chat/start/", {
            seller_id: sellerId,
            product_id: productId
        });
        return response.data; // returns { conversation_id: 12, partner_name: "Yusuf Store" }
    },

    // 2. Fetch all conversations for the Inbox (Seller or Buyer)
    getInbox: async () => {
        const response = await api.get("/chat/inbox/");
        return response.data;
    },

    // 3. Get messages for a specific conversation
    getMessages: async (conversationId: string | number) => {
        const response = await api.get(`/chat/conversations/${conversationId}/messages/`);
        return response.data;
    },

    // 4. Send a message to a conversation
    sendMessage: async (conversationId: string | number, text: string) => {
        const response = await api.post(`/chat/conversations/${conversationId}/send/`, {
            text: text
        });
        return response.data;
    }
};