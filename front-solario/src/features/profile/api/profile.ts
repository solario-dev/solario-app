import api from "../../../shared/lib/client";
import type { UserStats } from "../types/profile.types";

export const equipSkin = async (userId: string, itemId: string): Promise<{ message: string, equippedSkin: string }> => {
    const response = await api.post<{ message: string, equippedSkin: string }>(`/api/users/equip/${userId}/${itemId}`);
    return response.data;
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
    const response = await api.get<UserStats>(`/api/users/${userId}/stats`);
    return response.data;
};