import api from "../../../shared/lib/client";
import type { LoginRequest, LoginResponse } from "../types/auth.types";
import type { User } from "../../../shared/types/User";


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

