import api from "./axios";

export const authApi = {
  register: async (data) => {
    const response = await api.post("/register", data);
    return response.data;
  },

  login: async (data) => {
    const response = await api.post("/login", data);
    return response.data;
  },

  me: async () => {
    const response = await api.get("/me");
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/logout");
    return response.data;
  },

  logoutAll: async () => {
    const response = await api.post("/logout-all");
    return response.data;
  },
};