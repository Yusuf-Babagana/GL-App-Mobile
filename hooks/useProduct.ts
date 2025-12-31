import api from '@/lib/api';
import { useEffect, useState } from 'react';

export interface ProductDetail {
    id: number;
    name: string;
    price: number;
    description: string;
    images: { id: number; image: string }[];
    category: number;
    store_name: string;
    average_rating: number;
    total_reviews: number;
    stock: number;
}

export function useProduct(id: string) {
    const [data, setData] = useState<ProductDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/market/products/${id}/`);
                setData(response.data);
            } catch (error) {
                console.log("Error fetching product details:", error);
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    return { data, isLoading, isError };
}