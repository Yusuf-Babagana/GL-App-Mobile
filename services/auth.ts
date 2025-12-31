import api from "@/lib/api";

export const authService = {
    async register(data: any) {
        const response = await api.post("/users/register/", data);
        return response.data;
    },

    async login(data: any) {
        const response = await api.post("/users/login/", data);
        return response.data; // Returns { access, refresh }
    },
};