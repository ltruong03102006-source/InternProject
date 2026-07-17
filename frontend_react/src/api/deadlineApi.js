import api from "./axios";

const deadlineApi = {
  getAll(params = {}) {
    return api.get("/deadlines", { params });
  },

  getById(id) {
    return api.get(`/deadlines/${id}`);
  },

  create(data) {
    return api.post("/deadlines", data);
  },

  update(id, data) {
    return api.patch(`/deadlines/${id}`, data);
  },

  remove(id) {
    return api.delete(`/deadlines/${id}`);
  },

  updateStatus(id, status) {
    return api.patch(`/deadlines/${id}/status`, { status });
  },
};

export default deadlineApi;