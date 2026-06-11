import { useApi } from "@/lib/api";
import { normalizeData } from "@/lib/utils";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";

const useProducts = () => {
  const api = useApi();

  const result = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get<Product[]>("/market/products/");
      return normalizeData(data);
    },
  });

  return result;
};

export default useProducts;
