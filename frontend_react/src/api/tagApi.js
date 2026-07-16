import api from "./axios";

const tagApi = {
  getAll(params = {}) {
    return api.get("/tags", { params });
  },

  getById(id) {
    return api.get(`/tags/${id}`);
  },

  create(data) {
    return api.post("/tags", data);
  },

  update(id, data) {
    return api.patch(`/tags/${id}`, data);
  },

  remove(id) {
    return api.delete(`/tags/${id}`);
  },

  getNotes(id, params = {}) {
    return api.get(`/tags/${id}/notes`, { params });
  },
};

export default tagApi;