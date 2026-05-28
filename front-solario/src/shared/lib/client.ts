import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001", // ZMIANA Z 5000 NA 5001
  headers: {
    "Content-Type": "application/json",
  },
});

// (Optional) interceptors for error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.response?.status === 401 && error.config && !error.config.url?.includes("/users/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;