// import api from "./client";

// import type { User, LoginResponse } from "./types/User";

// // GET /api/users/{id}
// export const getUserById = async (id: number): Promise<User> => {
//   const response = await api.get<User>(`/users/${id}`);
//   return response.data;
// };

// // POST /api/users/login
// export const loginUser = async (
//   email: string,
//   password: string
// ): Promise<LoginResponse> => {
//   const response = await api.post<LoginResponse>("/users/login", {
//     email,
//     password,
//   });

//   return response.data;
// };
