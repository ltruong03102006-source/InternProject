import api from "./axios";

export const dashboardApi = {
  getDashboard: async () => {
    const response = await api.get("/dashboard");
    return response.data;
  },
};