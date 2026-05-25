import type { User } from "../../../shared/types/User";

export interface LoginResponse {
    token: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

