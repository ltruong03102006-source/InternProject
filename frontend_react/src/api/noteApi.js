import api from "./axios";

const noteApi = {
  getAll(params = {}) {
    return api.get("/notes", { params });
  },

  getById(id) {
    return api.get(`/notes/${id}`);
  },

  create(data) {
    return api.post("/notes", data);
  },

  update(id, data) {
    return api.patch(`/notes/${id}`, data);
  },

  remove(id) {
    return api.delete(`/notes/${id}`);
  },

  togglePin(id) {
    return api.patch(`/notes/${id}/pin`);
  },
};

export default noteApi;