import api from "../../../shared/lib/client";
import type { ShopItem } from "../../../shared/types/ShopItem";

export const getShopItems = async (): Promise<ShopItem[]> => {
  const response = await api.get<ShopItem[]>("/api/shop");
  return response.data;
};

export const purchaseItem = async (userId: string, itemId: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`/api/shop/purchase/${userId}/${itemId}`);
  return response.data;
};