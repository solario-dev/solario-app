import api from "./client";
import type { User } from "./types/User";

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/api/users/login", data);
  return response.data;
};

export const registerUser = async (userData: Partial<User>): Promise<User> => {
    const response = await api.post<User>("/api/users/register", userData);
    return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get<User>(`/api/users/${id}`);
  return response.data;
};

export const equipSkin = async (userId: string, itemId: string): Promise<{ message: string, equippedSkin: string }> => {
    const response = await api.post<{ message: string, equippedSkin: string }>(`/api/users/equip/${userId}/${itemId}`);
    return response.data;
};